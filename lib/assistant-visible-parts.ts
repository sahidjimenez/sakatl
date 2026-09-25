import type { AssistantUIMessage } from "./agents/assistant-agent";

// Internal tool steps and empty streaming text must not create bubbles or gaps.
export function visibleAssistantParts(message: AssistantUIMessage) {
  const hasCard = message.parts.some(part =>
    (part.type === "tool-proposeRoutine" || part.type === "tool-presentOptions") &&
    part.state === "output-available");
  return message.parts.filter(part => {
    if (part.type === "text") return Boolean(part.text.trim()) && !(message.role === "assistant" && hasCard);
    if ("state" in part && part.state === "output-error") return true;
    return (part.type === "tool-proposeRoutine" || part.type === "tool-presentOptions") &&
      part.state === "output-available";
  });
}
