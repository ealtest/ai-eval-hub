import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, FileJson, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApexEval — AI Evaluation & Cybersecurity Hub" },
      { name: "description", content: "A transparent workbench for deterministic AI output evaluation and security checks." },
      { property: "og:title", content: "ApexEval — AI Evaluation & Cybersecurity Hub" },
      { property: "og:description", content: "JSON validation, lexical RAG checks and adversarial input scanning." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="relative">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Deterministic evaluation workbench
        </p>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          AI Quality Assurance &amp; Security{" "}
          <span className="text-primary">Infrastructure Hub</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A practical QA workbench for structured outputs, retrieval-grounding heuristics and adversarial prompt triage.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90"
          >
            Open Evaluation Playground <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/red-teaming" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm hover:bg-secondary">
            Scan Adversarial Input
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="glass p-5"><FileJson className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Structured output validation</h2><p className="mt-2 text-sm text-muted-foreground">Comprueba JSON frente a un subconjunto documentado de JSON Schema.</p></div>
          <div className="glass p-5"><Code2 className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Static code heuristics</h2><p className="mt-2 text-sm text-muted-foreground">Busca patrones de riesgo en fragmentos Python sin ejecutarlos.</p></div>
          <div className="glass p-5"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Adversarial input triage</h2><p className="mt-2 text-sm text-muted-foreground">Identifica patrones conocidos con reglas deterministas y limitaciones explícitas.</p></div>
        </div>
      </section>
    </div>
  );
}
