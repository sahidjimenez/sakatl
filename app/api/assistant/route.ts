import { createAgentUIStreamResponse } from "ai";
import { requireUser } from "@/lib/auth";
import { assistantAgent } from "@/lib/agents/assistant-agent";
import { checkRateLimit } from "@/lib/rate-limit";
import { after } from "next/server";
import { consumeUsage, refundUsage } from "@/lib/billing/store";
import { handleApiError } from "@/lib/routines";
import { readAssistantMessages } from "@/lib/assistant-request";

export const maxDuration = 120;

const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  let reservation: Awaited<ReturnType<typeof consumeUsage>> = null;
  let released = false;
  async function release() { if (released) return; released = true; await refundUsage(reservation); }
  try {
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

  const messages = await readAssistantMessages(request);
  reservation = await consumeUsage(userId, "assistant");

  return await createAgentUIStreamResponse({
    agent: assistantAgent,
    uiMessages: messages,
    onError: () => { after(release); return "No se pudo responder. Tu mensaje no consumirá el cupo; intenta de nuevo."; },
  });
  } catch (error) { await release(); return handleApiError(error); }
}
