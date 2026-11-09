import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { RedTeamSimulator } from "@/components/redteam/RedTeamSimulator";

export const Route = createFileRoute("/red-teaming")({
  head: () => ({
    meta: [
      { title: "Adversarial Red-Teaming Simulator — ApexEval" },
      { name: "description", content: "Scan prompt injection, jailbreak and data exfiltration patterns with deterministic rules." },
      { property: "og:title", content: "Adversarial Red-Teaming Simulator — ApexEval" },
      { property: "og:description", content: "Deterministic prompt injection and jailbreak pattern scanning." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <PageHeader eyebrow="Red Teaming" title="Adversarial Input Scanner">
        Analizá texto frente a reglas transparentes de detección. Este módulo no ataca ni protege un modelo LLM en vivo.
      </PageHeader>
      <RedTeamSimulator />
    </div>
  ),
});
