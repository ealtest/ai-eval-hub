export async function readBoundedJson(request: Request, maxBytes = 120_000): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new Error("El cuerpo supera el tamaño máximo permitido.");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error("El cuerpo supera el tamaño máximo permitido.");
  return JSON.parse(raw) as unknown;
}
