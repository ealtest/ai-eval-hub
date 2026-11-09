import { createFileRoute } from "@tanstack/react-router";
import { readBoundedJson } from "@/server/http";
import { evaluationRequestSchema, runEvaluation } from "@/server/services/evaluation";
import { runPythonAudit } from "@/server/services/python-audit";

export const Route = createFileRoute("/api/evaluate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: unknown = await readBoundedJson(request);
          const parsed = evaluationRequestSchema.safeParse(body);
          if (!parsed.success) return Response.json({ error: "Solicitud inválida.", details: parsed.error.flatten() }, { status: 400 });
          const result = parsed.data.mode === "python-audit"
            ? await runPythonAudit(parsed.data.output)
            : runEvaluation(parsed.data);
          return Response.json(result, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error interno.";
          return Response.json({ error: message }, { status: 422 });
        }
      },
    },
  },
});

