import { createFileRoute } from "@tanstack/react-router";
import { Code2, FileJson, SearchCheck, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const MODULES = [
  { name: "JSON Schema subset validator", scope: "Parses the submitted JSON and validates supported constraints: type, required, properties, additionalProperties, enum, items, string lengths and numeric bounds.", tools: "TypeScript · Zod request validation", caveat: "Not a complete Draft 2020-12 implementation." },
  { name: "RAG lexical grounding", scope: "Compares normalized answer terms against retrieved context and reports lexical overlap and context coverage.", tools: "Token normalization · deterministic metrics", caveat: "Does not establish semantic entailment or factual truth." },
  { name: "Python static security heuristics", scope: "Scans code text for selected risky constructs such as eval, exec, shell=True, hardcoded secrets and unsafe pickle deserialization.", tools: "Python AST analysis · no code execution", caveat: "Limited AST rules; not a replacement for Bandit, Semgrep, Ruff or human review." },
  { name: "Adversarial prompt scanner", scope: "Checks prompt text against explicit rules for instruction override, prompt disclosure, jailbreak patterns, credential harvesting and potential exfiltration.", tools: "Rule-based detection · JSON API", caveat: "Does not send attacks to a live LLM or validate model-side mitigations." },
];

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture & Methodology — ApexEval" },
      { name: "description", content: "Implemented evaluation modules, deterministic methods and documented limitations." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <PageHeader eyebrow="Architecture" title="Implemented modules & methodology">
        The current implementation favors reproducibility and transparent limits over synthetic production claims.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((module, index) => {
          const Icon = [FileJson, SearchCheck, Code2, ShieldCheck][index]!;
          return <article key={module.name} className="glass p-6">
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">{module.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{module.scope}</p>
            <p className="mt-4 font-mono text-xs text-primary">{module.tools}</p>
            <p className="mt-3 border-t border-border pt-3 text-xs text-amber-500">Limitation: {module.caveat}</p>
          </article>;
        })}
      </div>
    </div>
  ),
});
