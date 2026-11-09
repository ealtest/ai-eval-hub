import { createFileRoute } from "@tanstack/react-router";
import { readBoundedJson } from "@/server/http";
import { redTeamPayloadSchema, scanAdversarialInput } from "@/server/services/evaluation";
export const Route = createFileRoute("/api/red-team")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body: unknown = await readBoundedJson(request);
          const parsed = redTeamPayloadSchema.safeParse(body);
          if (!parsed.success) return Response.json({ error: "Payload inválido." }, { status: 400 });
          return Response.json(scanAdversarialInput(parsed.data.payload), { headers: { "Cache-Control": "no-store" } });
        } catch {
          return Response.json({ error: "No se pudo procesar la solicitud." }, { status: 400 });
        }
      },
    },
  },
});
