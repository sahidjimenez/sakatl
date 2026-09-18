import { validateUIMessages } from "ai";
import { ApiError } from "./errors";
import { MAX_ASSISTANT_CONTEXT, prepareAssistantMessages } from "./assistant-history";

export async function readAssistantMessages(request: Request) {
  const raw = await request.text();
  // Separate the transport limit from the model context limit. Older clients
  // include images and provider metadata in their persisted tool results.
  if (raw.length > 1_000_000) throw new ApiError(413, "El mensaje es demasiado grande. Reduce el texto o inicia una nueva conversación.");
  let messages;
  try {
    const body = JSON.parse(raw);
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 100) throw new Error();
    messages = await validateUIMessages({ messages: body.messages });
  } catch {
    throw new ApiError(400, "La conversación no es válida. Inicia una nueva conversación.");
  }
  const prepared = prepareAssistantMessages(messages);
  if (!prepared.length || prepared.at(-1)?.role !== "user") throw new ApiError(400, "Escribe un mensaje para continuar.");
  if (JSON.stringify(prepared).length > MAX_ASSISTANT_CONTEXT) throw new ApiError(413, "Tu último mensaje es demasiado largo. Acórtalo e intenta de nuevo.");
  return prepared;
}
