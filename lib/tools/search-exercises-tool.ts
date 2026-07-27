import { tool } from "ai";
import { z } from "zod";
import { searchExercises } from "@/lib/exercises";

export const searchExercisesTool = tool({
  description:
    "Busca ejercicios reales del catálogo de Sakatl por nombre, músculo o equipo. Usar antes de proponer una rutina, para obtener exerciseId válidos.",
  inputSchema: z.object({
    q: z.string().optional().describe("Texto libre: nombre, músculo o equipo (ej. 'pecho', 'sentadilla')"),
    equipment: z.string().optional().describe("Filtro de equipo exacto (ej. 'barbell', 'dumbbell', 'body weight')"),
  }),
  execute: async ({ q, equipment }) => {
    const { items } = searchExercises({ q, equipment, limit: 8 });
    return {
      items: items.map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.muscle_group,
        equipment: ex.equipment,
        target: ex.target,
      })),
    };
  },
});
