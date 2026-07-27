import { createAgentUIStreamResponse } from "ai";
import { requireUser } from "@/lib/auth";
import { assistantAgent } from "@/lib/agents/assistant-agent";

export async function POST(request: Request) {
  await requireUser();
  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: assistantAgent,
    uiMessages: messages,
  });
}
