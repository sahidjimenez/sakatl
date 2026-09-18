// Optional live smoke test. Uses the configured AI provider; does not save a routine.
import assert from "node:assert/strict";
import { assistantAgent } from "../lib/agents/assistant-agent";
import { z } from "zod";
import { getDb } from "../lib/db";

async function main() {
  const result = await assistantAgent.generate({
    prompt: "Soy principiante, quiero ganar fuerza. Tengo mancuernas y entreno lunes y jueves. Propón ahora una rutina de cuerpo completo de 4 ejercicios para repetir esos días. No tengo lesiones. Usa el catálogo y presenta la rutina con proposeRoutine.",
    abortSignal: AbortSignal.timeout(100_000),
  });
  const proposals = result.steps.flatMap(step => step.toolResults)
    .filter(tool => tool.toolName === "proposeRoutine");
  assert.ok(proposals.length > 0, "El agente terminó sin proponer una rutina");
  const proposal = z.object({ blocks: z.array(z.unknown()).min(1) }).parse(proposals[0].output);
  console.log(`Generación verificada: ${result.steps.length} pasos, ${proposal.blocks.length} bloques. No se guardó ninguna rutina.`);
}

main().catch(error => {
  // Avoid logging provider request headers or connection details.
  console.error(error instanceof Error ? error.message : "No se pudo completar la prueba");
  process.exitCode = 1;
}).finally(async () => {
  if (process.env.DATABASE_URL) await getDb().$client.end();
});
