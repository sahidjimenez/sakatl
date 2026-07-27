import { ToolLoopAgent, InferAgentUIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { searchExercisesTool } from "@/lib/tools/search-exercises-tool";
import { proposeRoutineTool } from "@/lib/tools/propose-routine-tool";

export const assistantAgent = new ToolLoopAgent({
  model: anthropic("claude-sonnet-5"),
  instructions: `Eres el asistente de entrenamiento de Sakatl. Recomiendas ejercicios y armas
rutinas completas (ejercicios sueltos, bi-series o tri-series) según lo que pida el usuario
(objetivo, músculos, equipo disponible, días por semana).

Reglas:
- Antes de proponer cualquier rutina, usa searchExercises para encontrar exerciseId reales del
  catálogo. Nunca inventes un exerciseId.
- Si falta información clave (objetivo, equipo disponible, días por semana), pregunta antes de
  proponer la rutina.
- Cuando tengas suficiente información, llama a proposeRoutine con la rutina completa. El usuario
  la revisa y decide si crearla — tú no la creas.
- Responde siempre en español mexicano, de forma breve y directa.`,
  tools: {
    searchExercises: searchExercisesTool,
    proposeRoutine: proposeRoutineTool,
  },
});

export type AssistantUIMessage = InferAgentUIMessage<typeof assistantAgent>;
