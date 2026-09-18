import { createAgentUIStreamResponse } from "ai";
import { assistantAgent } from "@/lib/agents/assistant-agent";
import { checkRateLimit } from "@/lib/rate-limit";
import { readAssistantMessages } from "@/lib/assistant-request";
import { handleApiError } from "@/lib/routines";

export const maxDuration = 120;

// Protección contra ráfagas de solicitudes; sin cupo semanal de IA.
const RATE_LIMIT = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(`assistant-invitado:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Estás enviando mensajes muy rápido. Espera un momento e intenta de nuevo.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        },
      },
    );
  }

  const messages = await readAssistantMessages(request);

  return await createAgentUIStreamResponse({
    agent: assistantAgent,
    uiMessages: messages,
    onError: () => "No se pudo generar la rutina. Intenta de nuevo en un momento.",
  });
  } catch (error) { return handleApiError(error); }
}
