// Live regression through the same HTTP transport and message preparation as useChat.
import assert from "node:assert/strict";
import { DefaultChatTransport, readUIMessageStream, type UIMessage } from "ai";
import { prepareAssistantMessages } from "../lib/assistant-history";

async function main() {
  const messages: UIMessage[] = [];
  const transport = new DefaultChatTransport({
    api: "http://localhost:3000/api/assistant-invitado",
    prepareSendMessagesRequest: ({ messages }) => ({ body: { messages: prepareAssistantMessages(messages) } }),
  });
  const answers = ["quiero una rutina para espalda", "Hipertrofia (volumen muscular)", "Gimnasio completo", "1 día"];
  for (const [index, text] of answers.entries()) {
    messages.push({ id: `test-${index}`, role: "user", parts: [{ type: "text", text }] });
    const started = Date.now();
    const stream = await transport.sendMessages({ trigger: "submit-message", chatId: "regression", messageId: undefined, messages, abortSignal: AbortSignal.timeout(115_000) });
    const traced = stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
      if (chunk.type === "tool-input-available") console.log(`Turno ${index + 1}, ${chunk.toolName}: ${JSON.stringify(chunk.input)}`);
      if (chunk.type === "tool-output-error" || chunk.type === "error") console.log(chunk);
      controller.enqueue(chunk);
    }}));
    let response: UIMessage | undefined;
    for await (const message of readUIMessageStream({ stream: traced, terminateOnError: true })) response = message;
    assert.ok(response);
    messages.push(response);
    console.log(`Turno ${index + 1} finalizado en ${Math.round((Date.now() - started) / 1000)}s`);
    const expected = index === 3 ? "tool-proposeRoutine" : "tool-presentOptions";
    assert.ok(response.parts.some(part => part.type === expected && "state" in part && part.state === "output-available"), `Falta ${expected} en la respuesta visible`);
    if (index === 3) {
      assert.ok(response.parts.filter(part => part.type === "tool-searchExercises").length <= 3, "No debe agotar el turno en búsquedas repetidas");
    }
  }
  console.log("OK: rutina recibida por HTTP sin mensaje adicional.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Falló la prueba"); process.exitCode = 1; });
