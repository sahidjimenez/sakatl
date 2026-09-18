import type { UIMessage } from "ai";

export const MAX_ASSISTANT_CONTEXT = 32_000;

// Keep presentation data in the UI, but don't send it back to the model.
export function prepareAssistantMessages(messages: UIMessage[]): UIMessage[] {
  const compact = messages.map(({ id, role, parts }) => ({
    id,
    role,
    parts: parts.filter(part => part.type === "text" ||
      (part.type.startsWith("tool-") && "state" in part &&
        (part.state === "output-available" || part.state === "output-error")))
      .map(part => JSON.parse(JSON.stringify(part, (key, value) =>
        ["exerciseImage", "providerMetadata", "callProviderMetadata", "resultProviderMetadata"].includes(key)
          ? undefined : value))),
  })).filter(message => message.parts.length > 0);

  // Remove whole turns so tool calls and their results stay together.
  while (compact.length > 1 && (compact.length > 24 ||
    JSON.stringify(compact).length > MAX_ASSISTANT_CONTEXT)) {
    const nextUser = compact.findIndex((message, index) => index > 0 && message.role === "user");
    if (nextUser < 0) break;
    compact.splice(0, nextUser);
  }
  return compact;
}
