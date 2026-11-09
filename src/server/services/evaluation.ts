import * as z from "zod";

export const evaluationRequestSchema = z.object({
  mode: z.enum(["python-audit", "retail-rag", "schema"]),
  output: z.string().min(1).max(100_000),
  context: z.string().max(100_000).optional().default(""),
  schema: z.string().max(50_000).optional().default(""),
});

export type EvaluationRequest = z.infer<typeof evaluationRequestSchema>;

export interface EvaluationResult {
  mode: EvaluationRequest["mode"];
  score: number;
  passed: boolean;
  latencyMs: number;
  inputCharacters: number;
  metrics: { dimension: string; score: number }[];
  findings: string[];
  limitations: string[];
}

const tokens = (value: string) =>
  new Set((value.toLowerCase().match(/[a-z0-9_]{2,}/g) ?? []).filter((t) => !STOP_WORDS.has(t)));
const STOP_WORDS = new Set(["the","and","for","with","that","this","from","have","are","was","were","una","uno","que","los","las","del","por","con","para","una","sus","como"]);

function validateJsonSchema(value: unknown, schema: unknown, path = "$", depth = 0): string[] {
  if (depth > 20) return [`${path}: maximum schema/value nesting depth exceeded`];
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return [`${path}: schema must be a JSON object`];
  const s = schema as Record<string, unknown>;
  const errors: string[] = [];
  const type = s.type;
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (typeof type === "string" && type !== actual && !(type === "integer" && typeof value === "number" && Number.isInteger(value))) {
    errors.push(`${path}: expected ${type}, received ${actual}`);
    return errors;
  }
  if (Array.isArray(s.enum) && !s.enum.some((item) => JSON.stringify(item) === JSON.stringify(value))) errors.push(`${path}: value is not in enum`);
  if (actual === "object" && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const props = (s.properties && typeof s.properties === "object" ? s.properties : {}) as Record<string, unknown>;
    if (Array.isArray(s.required)) for (const key of s.required) if (typeof key === "string" && !(key in obj)) errors.push(`${path}.${key}: required property is missing`);
    for (const [key, child] of Object.entries(props)) if (key in obj) errors.push(...validateJsonSchema(obj[key], child, `${path}.${key}`, depth + 1));
    if (s.additionalProperties === false) for (const key of Object.keys(obj)) if (!(key in props)) errors.push(`${path}.${key}: additional property is not allowed`);
  }
  if (actual === "array" && Array.isArray(value) && s.items) value.forEach((item, i) => errors.push(...validateJsonSchema(item, s.items, `${path}[${i}]`, depth + 1)));
  if (typeof value === "string") {
    if (typeof s.minLength === "number" && value.length < s.minLength) errors.push(`${path}: shorter than minLength ${s.minLength}`);
    if (typeof s.maxLength === "number" && value.length > s.maxLength) errors.push(`${path}: longer than maxLength ${s.maxLength}`);
  }
  if (typeof value === "number") {
    if (typeof s.minimum === "number" && value < s.minimum) errors.push(`${path}: below minimum ${s.minimum}`);
    if (typeof s.maximum === "number" && value > s.maximum) errors.push(`${path}: above maximum ${s.maximum}`);
  }
  return errors;
}

export function runEvaluation(input: EvaluationRequest): EvaluationResult {
  const started = performance.now();
  if (input.mode === "python-audit") throw new Error("Python audits must use the AST-based Python runner.");
  const findings: string[] = [];
  const limitations: string[] = [];
  let metrics: EvaluationResult["metrics"] = [];
  let score = 0;
  let passed = false;

  if (input.mode === "schema") {
    let parsedSchema: unknown;
    let parsedOutput: unknown;
    try { parsedSchema = JSON.parse(input.schema); } catch { throw new Error("El JSON Schema no es JSON válido."); }
    try { parsedOutput = JSON.parse(input.output); } catch { throw new Error("La salida evaluada no es JSON válido."); }
    const errors = validateJsonSchema(parsedOutput, parsedSchema);
    passed = errors.length === 0;
    score = passed ? 100 : Math.max(0, Math.round(100 - errors.length * 12));
    findings.push(...(errors.length ? errors : ["Salida JSON válida y conforme al subconjunto de JSON Schema implementado."]));
    metrics = [{ dimension: "Schema compliance", score }, { dimension: "Required fields", score: passed ? 100 : Math.max(0, 100 - errors.length * 15) }];
    limitations.push("Validador propio de subconjunto JSON Schema: soporta type, required, properties, additionalProperties, enum, items, min/max y tipos básicos; no implementa toda la especificación Draft 2020-12.");
  } else if (input.mode === "retail-rag") {
    if (!input.context.trim()) throw new Error("Para evaluar RAG debes proporcionar el contexto recuperado.");
    const answerTokens = tokens(input.output);
    const contextTokens = tokens(input.context);
    const overlap = [...answerTokens].filter((t) => contextTokens.has(t));
    const unsupported = [...answerTokens].filter((t) => !contextTokens.has(t));
    const grounding = answerTokens.size ? Math.round((overlap.length / answerTokens.size) * 100) : 0;
    const contextCoverage = contextTokens.size ? Math.round((overlap.length / contextTokens.size) * 100) : 0;
    score = grounding;
    passed = grounding >= 60;
    findings.push(`Coincidencia léxica respuesta/contexto: ${overlap.length}/${answerTokens.size} términos (${grounding}%).`);
    findings.push(`Cobertura léxica del contexto: ${contextCoverage}%.`);
    findings.push(unsupported.length ? `Términos no encontrados en el contexto: ${unsupported.slice(0, 25).join(", ")}${unsupported.length > 25 ? "…" : ""}` : "No se detectaron términos fuera del contexto mediante coincidencia léxica.");
    metrics = [{ dimension: "Lexical grounding", score: grounding }, { dimension: "Context coverage", score: contextCoverage }];
    limitations.push("La coincidencia léxica no demuestra entailment semántico ni detecta paráfrasis fiables. No es un juez NLI ni una evaluación de verdad factual.");

  }

  return { mode: input.mode, score, passed, latencyMs: Math.round(performance.now() - started), inputCharacters: input.output.length, metrics, findings, limitations };
}

export const redTeamPayloadSchema = z.object({
  payload: z.string().min(1).max(20_000),
});

export function scanAdversarialInput(payload: string) {
  const rules: { id: string; label: string; severity: "high" | "medium"; pattern: RegExp; rationale: string }[] = [
    { id: "instruction-override", label: "Instruction override", severity: "high", pattern: /ignore (all )?(previous|prior|above) instructions|disregard (the )?(system|developer) prompt|override.{0,30}instructions/i, rationale: "El texto intenta reemplazar instrucciones de mayor prioridad." },
    { id: "prompt-disclosure", label: "Prompt disclosure", severity: "medium", pattern: /(?:\b(?:reveal|print|show|repeat)\b.{0,40}\b(?:system prompt|hidden instructions)\b|\b(?:system prompt|hidden instructions)\b.{0,40}\b(?:reveal|print|show|repeat)\b)/i, rationale: "El texto solicita revelar instrucciones internas." },
    { id: "role-jailbreak", label: "Role-play jailbreak", severity: "medium", pattern: /you are now|act as an unrestricted|developer mode|dan mode|pretend (that )?you have no restrictions/i, rationale: "El texto intenta cambiar el rol o eludir restricciones." },
    { id: "exfiltration", label: "Potential data exfiltration", severity: "high", pattern: /send|embed|append|upload.{0,80}(secret|credential|customer|personal|private|record)|https?:\/\/[^\s]+/i, rationale: "Se detectó una solicitud de transferencia o una URL que requiere revisión de salida." },
    { id: "secret-harvesting", label: "Credential harvesting", severity: "high", pattern: /(api[_ -]?key|password|access token|secret key).{0,50}(show|print|send|reveal|export)/i, rationale: "El texto intenta obtener credenciales o secretos." },
    { id: "tool-abuse", label: "Tool abuse / command execution", severity: "high", pattern: /run (this )?(shell|bash|powershell|terminal) command|execute.{0,30}(command|script)|rm -rf|curl .+\|\s*(sh|bash)/i, rationale: "Se detectó una instrucción de ejecución potencialmente peligrosa." },
  ];
  const matches = rules.filter((rule) => rule.pattern.test(payload)).map(({ pattern, ...rule }) => rule);
  return {
    scannedAt: new Date().toISOString(),
    verdict: matches.some((m) => m.severity === "high") ? "high-risk" : matches.length ? "review" : "no-known-pattern",
    matches,
    summary: matches.length ? `${matches.length} patrón(es) coincidente(s); requiere revisión.` : "No hubo coincidencias con las reglas configuradas.",
    limitations: ["Escáner determinista de patrones; no ejecuta ataques contra un LLM ni verifica mitigaciones.", "La ausencia de coincidencias no garantiza que el contenido sea seguro.", "Las reglas pueden producir falsos positivos y falsos negativos."],
  };
}
