// Live conversational regression test; does not create or save routines.
import assert from "node:assert/strict";
import { z } from "zod";
import type { ModelMessage } from "ai";
import { assistantAgent } from "../lib/agents/assistant-agent";
import { getDb } from "../lib/db";

async function main() {
  const messages: ModelMessage[] = [{ role: "user", content: "Me puedes hacer una rutina para pierna" }];
  const answers = ["Resistencia", "Gimnasio completo", "2 días por semana"];
  const expected = [/objetivo|buscas|lograr|enfoque/i, /equipo|entrenar|material|gimnasio/i, /días|frecuencia|veces/i];
  for (let turn = 0; turn < answers.length; turn++) {
    const result = await assistantAgent.generate({ prompt: messages, abortSignal: AbortSignal.timeout(60_000) });
    const calls = result.steps.flatMap(step => step.toolResults);
    const questions = calls.filter(call => call.toolName === "presentOptions");
    assert.equal(questions.length, 1, "Debe preguntar una sola cosa por turno");
    assert.ok(!calls.some(call => call.toolName === "proposeRoutine"), "No debe proponer antes de recibir todos los datos");
    const question = z.object({ question: z.string(), options: z.array(z.string()) }).parse(questions[0].output);
    assert.match(question.question, expected[turn]);
    console.log(`Turno ${turn + 1}: ${question.question}`);
    messages.push(...result.response.messages, { role: "user", content: `${question.question} ${answers[turn]}` });
  }
  console.log("Secuencia verificada: objetivo, equipo y días, esperando respuesta en cada turno.");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Falló la prueba");
  process.exitCode = 1;
}).finally(async () => {
  if (process.env.DATABASE_URL) await getDb().$client.end();
});
