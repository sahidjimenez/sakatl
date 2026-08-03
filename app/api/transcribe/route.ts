import { transcribe } from "ai";
import { checkRateLimit } from "@/lib/rate-limit";

// Sin autenticación: lo usan tanto el chat normal como el de invitado. El
// límite es sólo una red de seguridad contra abuso/costos, no una fuente de
// verdad de negocio (ver app/api/assistant-invitado/route.ts).
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(`transcribe:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return Response.json(
      { error: "Estás enviando audios muy rápido. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "No se recibió audio." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await audio.arrayBuffer());
    const result = await transcribe({
      model: "openai/whisper-1",
      audio: buffer,
    });

    if (!result.text.trim()) {
      return Response.json({ error: "No se detectó voz en el audio. Intenta de nuevo." }, { status: 422 });
    }

    return Response.json({ text: result.text.trim() });
  } catch {
    return Response.json(
      { error: "No se pudo transcribir el audio. Intenta de nuevo en un momento." },
      { status: 500 },
    );
  }
}
