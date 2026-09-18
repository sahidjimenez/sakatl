import { transcribe } from "ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { billingEnabled } from "@/lib/billing/stripe";
import { consumeUsage, refundUsage } from "@/lib/billing/store";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/routines";

// Billing requires an authenticated account and a durable usage allowance.
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  let userId: string | null = null;
  if (process.env.AI_USAGE_LIMITS_ENABLED === "true" && billingEnabled()) {
    try { userId = await requireUser(); } catch (error) { return handleApiError(error); }
  }
  if (Number(request.headers.get("content-length")) > 6_000_000) return Response.json({ error: "El audio es demasiado grande (máximo 5 MB)." }, { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(`transcribe:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return Response.json(
      { error: "Estás enviando audios muy rápido. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return Response.json({ error: "El formato del audio no es válido." }, { status: 400 }); }
  const audio = formData.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "No se recibió audio." }, { status: 400 });
  }

  if (audio.size > 5_000_000) return Response.json({ error: "El audio es demasiado grande (máximo 5 MB)." }, { status: 413 });
  let reservation: Awaited<ReturnType<typeof consumeUsage>> = null;
  try {
    if (userId) reservation = await consumeUsage(userId, "voice");
    const buffer = Buffer.from(await audio.arrayBuffer());
    const result = await transcribe({
      model: "openai/whisper-1",
      audio: buffer,
    });

    if (!result.text.trim()) {
      await refundUsage(reservation);
      return Response.json({ error: "No se detectó voz en el audio. Intenta de nuevo." }, { status: 422 });
    }

    return Response.json({ text: result.text.trim() });
  } catch (error) {
    await refundUsage(reservation);
    if (error instanceof Error && "status" in error) return handleApiError(error);
    return Response.json(
      { error: "No se pudo transcribir el audio. Intenta de nuevo en un momento." },
      { status: 500 },
    );
  }
}
