import { createAgentUIStreamResponse } from "ai";
import { requireUser } from "@/lib/auth";
import { assistantAgent } from "@/lib/agents/assistant-agent";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const userId = await requireUser();

  const { allowed, retryAfterMs } = checkRateLimit(`assistant:${userId}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
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
