import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EvaluationPlayground } from "@/components/playground/EvaluationPlayground";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Live LLM & RAG Evaluation Playground — ApexEval" },
      { name: "description", content: "Run static Python heuristics, lexical RAG overlap checks and JSON structure validation." },
      { property: "og:title", content: "Live LLM & RAG Evaluation Playground — ApexEval" },
      { property: "og:description", content: "Interactive model vs. ground-truth evaluation with radar analytics." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <PageHeader eyebrow="Playground" title="Live LLM & RAG Evaluation">
        Ejecutá validaciones deterministas sobre datos de prueba. Cada métrica muestra su método y sus limitaciones; no se invoca un modelo externo.
      </PageHeader>
      <EvaluationPlayground />
    </div>
  ),
});
