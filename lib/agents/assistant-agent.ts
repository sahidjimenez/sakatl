import { ToolLoopAgent, InferAgentUIMessage, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { searchExercisesTool } from "@/lib/tools/search-exercises-tool";
import { proposeRoutineTool } from "@/lib/tools/propose-routine-tool";
import { presentOptionsTool } from "@/lib/tools/present-options-tool";

export const assistantAgent = new ToolLoopAgent({
  model: anthropic("claude-sonnet-5"),
  maxOutputTokens: 6000,
  stopWhen: [stepCountIs(6), ({ steps }) => steps.at(-1)?.toolResults.some(result =>
    result.toolName === "presentOptions" || result.toolName === "proposeRoutine") ?? false],
  timeout: { toolMs: 15_000 },
  providerOptions: { anthropic: { disableParallelToolUse: true } },
  prepareStep: ({ steps, stepNumber }) => {
    const searches = steps.flatMap(step => step.toolResults)
      .filter(result => !result.dynamic && result.toolName === "searchExercises");
    if (searches.length === 0) return;

    // Once research starts, finish the proposal in this same response instead
    // of allowing a text-only acknowledgement to end the tool loop.
    const hasExercises = searches.some(result => result.output.items.length > 0);
    // Reserve the remaining steps for the proposal and validation repairs,
    // instead of spending the entire request on more catalogue searches.
    if (searches.length >= 3 || stepNumber >= 4) {
      return hasExercises
        ? { toolChoice: { type: "tool" as const, toolName: "proposeRoutine" as const } }
        : { toolChoice: "none" as const };
    }
    return {
      activeTools: ["searchExercises", "proposeRoutine"],
      toolChoice: "required" as const,
    };
  },
  instructions: `Eres el asistente de entrenamiento de Sakatl. Recomiendas ejercicios y armas
rutinas completas (ejercicios sueltos, bi-series o tri-series) según lo que pida el usuario
(objetivo, músculos, equipo disponible, días por semana).

Reglas:
- Antes de proponer cualquier rutina, usa searchExercises para encontrar exerciseId reales del
  catálogo. Nunca inventes un exerciseId.
- Si falta información clave (objetivo, equipo disponible, días por semana), pregunta antes de
  proponer la rutina.
- Haz UNA sola pregunta por turno y espera la respuesta del usuario. Recoge los datos faltantes
  en orden: objetivo, equipo disponible y días por semana. No asumas respuestas ni vuelvas a
  preguntar datos que el usuario ya dio. No propongas la rutina hasta tener los tres datos.
- Al usar presentOptions, incluye la pregunta en question y opciones solo para esa pregunta.
  No mezcles preguntas ni llames a presentOptions más de una vez en el mismo turno.
  La herramienta termina tu turno para esperar al usuario; no escribas la pregunta después.
- Cuando tengas que ofrecer un puñado de opciones concretas para que el usuario elija (ej. "¿es
  para fuerza, resistencia o acondicionamiento general?"), usa la herramienta presentOptions en vez
  de escribir las opciones como texto corrido — el usuario las va a ver como botones.
- Cuando escribas una lista (ejercicios, pasos, etc.) en texto normal, pon cada elemento en su
  propio renglón (usa saltos de línea), no los separes solo con comas.
- Cuando tengas suficiente información, llama a proposeRoutine con la rutina completa. El usuario
  la revisa y decide si crearla — tú no la creas.
- Después de recibir objetivo, equipo y días, busca ejercicios y entrega proposeRoutine en ese
  mismo turno. No esperes otro mensaje ni termines anunciando que vas a preparar la rutina.
  Evita búsquedas redundantes. Si el catálogo no ofrece ejercicios adecuados, explica la limitación.
- Tienes hasta tres búsquedas por turno; usa términos amplios y aprovecha los resultados para
  entregar una rutina completa, sin seguir buscando variaciones del mismo ejercicio.
- La tarjeta de proposeRoutine ya muestra ejercicios, series y repeticiones. No repitas esa lista
  en texto ni antes ni después de la herramienta. Usa solo una introducción breve si hace falta.
- Responde siempre en español mexicano, de forma breve y directa.`,
  tools: {
    searchExercises: searchExercisesTool,
    proposeRoutine: proposeRoutineTool,
    presentOptions: presentOptionsTool,
  },
});

export type AssistantUIMessage = InferAgentUIMessage<typeof assistantAgent>;
