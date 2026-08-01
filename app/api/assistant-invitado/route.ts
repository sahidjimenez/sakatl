import { createAgentUIStreamResponse } from "ai";
import { assistantAgent } from "@/lib/agents/assistant-agent";
import { checkRateLimit } from "@/lib/rate-limit";

// Sin cuenta no hay identidad de usuario que limitar en el servidor: el límite
// real de "1 rutina por semana" vive en localStorage (ver lib/guest/storage.ts,
// getGuestAssistantCooldown/markGuestAssistantUsed). Este límite por IP es sólo
// una red de seguridad contra abuso/costos, no la fuente de verdad del límite.
const RATE_LIMIT = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
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

  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: assistantAgent,
    uiMessages: messages,
  });
}
