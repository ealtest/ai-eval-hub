import { useState } from "react";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import type { EvaluationMode } from "@/types/evaluation";
import { useEvaluation } from "@/hooks/use-evaluation";
import { cn } from "@/lib/utils";

const MODES: { id: EvaluationMode; label: string; description: string }[] = [
  { id: "retail-rag", label: "RAG grounding (lexical)", description: "Compara términos de la respuesta con el contexto recuperado." },
  { id: "schema", label: "JSON Schema validation", description: "Valida estructura y restricciones soportadas." },
  { id: "python-audit", label: "Python static security scan", description: "Busca patrones de riesgo sin ejecutar el código." },
];

const DEFAULT_SCHEMA = JSON.stringify({
  type: "object",
  required: ["id", "status"],
  additionalProperties: false,
  properties: {
    id: { type: "integer", minimum: 1 },
    status: { type: "string", enum: ["open", "closed", "pending"] },
  },
}, null, 2);

export function EvaluationPlayground() {
  const [mode, setMode] = useState<EvaluationMode>("retail-rag");
  const [output, setOutput] = useState('{"id": 42, "status": "open"}');
  const [context, setContext] = useState("SKU 4387: chaqueta azul, talle M, precio 89 EUR. Disponible en stock.");
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const { result, running, error, run } = useEvaluation();

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="glass flex flex-col gap-3 p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Evaluation harness</p>
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={cn("rounded-lg border p-3 text-left transition-colors", mode === m.id ? "border-primary bg-primary/10" : "border-border hover:bg-secondary")}>
            <p className="text-sm font-medium">{m.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
          </button>
        ))}
        <label className="mt-2 text-xs font-medium text-muted-foreground">Input / model output</label>
        <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" placeholder="Pegá la salida a evaluar…" />
        {mode === "retail-rag" && <>
          <label className="text-xs font-medium text-muted-foreground">Retrieved context</label>
          <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={5} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
        </>}
        {mode === "schema" && <>
          <label className="text-xs font-medium text-muted-foreground">JSON Schema (supported subset)</label>
          <textarea value={schema} onChange={(e) => setSchema(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
        </>}
        <button onClick={() => run({ mode, output, context, schema })} disabled={running || !output.trim()} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Evaluating…" : "Run evaluation"}
        </button>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </aside>

      <section className="glass min-h-80 p-6">
        {!result ? <div className="flex h-full min-h-80 items-center justify-center text-sm text-muted-foreground">Ingresá datos y ejecutá una evaluación para obtener resultados calculados por el backend.</div> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Calculated score" value={`${result.score}%`} />
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className={cn("mt-2 flex items-center gap-2 font-mono text-xl font-semibold", result.passed ? "text-primary" : "text-destructive")}>
                  {result.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  {result.passed ? "Passed" : "Review"}
                </p>
              </div>
              <Metric label="Execution / chars" value={`${result.latencyMs}ms · ${result.inputCharacters}`} />
            </div>
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Measured metrics</p>
              {result.metrics.map((metric) => <div key={metric.dimension} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{metric.dimension}</span><span className="font-mono">{metric.score}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${metric.score}%` }} /></div>
              </div>)}
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Findings</p>
              <ul className="space-y-2 font-mono text-xs leading-relaxed">{result.findings.map((line, i) => <li key={i}>[{String(i + 1).padStart(2, "0")}] {line}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="mb-2 text-xs font-semibold text-amber-500">Methodology and limitations</p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">{result.limitations.map((line) => <li key={line}>{line}</li>)}</ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-mono text-xl font-semibold">{value}</p></div>;
}
