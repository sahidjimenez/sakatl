import assert from "node:assert/strict";
import { test } from "node:test";
import { convertToModelMessages, type UIMessage } from "ai";
import { prepareAssistantMessages, MAX_ASSISTANT_CONTEXT } from "../lib/assistant-history";
import { readAssistantMessages } from "../lib/assistant-request";

const user = (id: string, text = "Continúa con mi rutina"): UIMessage => ({ id, role: "user", parts: [{ type: "text", text }] });
const request = (messages: UIMessage[]) => new Request("http://localhost/api/assistant", {
  method: "POST", body: JSON.stringify({ messages }),
});

test("large persisted tool output continues without losing the visible proposal", async () => {
  const proposal: UIMessage = { id: "proposal", role: "assistant", parts: [{
    type: "tool-proposeRoutine", toolCallId: "routine-1", state: "output-available",
    input: { name: "Piernas", blocks: [] },
    output: { name: "Piernas", blocks: [{ exercises: [{ exerciseId: "squat", exerciseImage: "x".repeat(40_000) }] }] },
  }] };
  const history = [user("first"), proposal, user("latest")];
  assert.ok(JSON.stringify(history).length > 32_000);
  const prepared = await readAssistantMessages(request(history));
  assert.equal(prepared.length, 3);
  assert.ok(JSON.stringify(prepared).length < 32_000);
  assert.ok(JSON.stringify(proposal).includes("x".repeat(40_000)));
  const converted = await convertToModelMessages(prepared);
  assert.ok(converted.some(message => message.role === "tool"));
});

test("long histories drop complete old turns and preserve the latest request", async () => {
  const history: UIMessage[] = Array.from({ length: 30 }, (_, i) => i % 2 === 0 ? user(String(i), "x".repeat(3000)) : {
    id: String(i), role: "assistant", parts: [{ type: "text", text: "Respuesta" }],
  });
  history.push(user("latest"));
  const prepared = await readAssistantMessages(request(history));
  assert.ok(prepared.length <= 24);
  assert.ok(JSON.stringify(prepared).length <= MAX_ASSISTANT_CONTEXT);
  assert.equal(prepared[0].role, "user");
  assert.equal(prepared.at(-1)?.id, "latest");
});

test("interrupted tool calls are not resent as dangling calls", async () => {
  const prepared = prepareAssistantMessages([user("first"), {
    id: "interrupted", role: "assistant", parts: [{ type: "tool-proposeRoutine", toolCallId: "cut", state: "input-streaming", input: {} }],
  }, user("retry")]);
  assert.deepEqual(prepared.map(message => message.id), ["first", "retry"]);
  await convertToModelMessages(prepared);
});

test("oversized individual messages and invalid payloads are rejected", async () => {
  await assert.rejects(readAssistantMessages(request([user("huge", "x".repeat(33_000))])), /último mensaje/);
  await assert.rejects(readAssistantMessages(request([])), /no es válida/);
  await assert.rejects(readAssistantMessages(new Request("http://localhost", { method: "POST", body: "{" })), /no es válida/);
});
