import { tool } from "ai";
import { z } from "zod";
import { getExerciseById } from "@/lib/exercises";

const blockExerciseSchema = z.object({
  exerciseId: z.string().describe("Id de ejercicio obtenido con searchExercises"),
  plannedSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).optional(),
  targetRepsMax: z.number().int().min(1).optional(),
  targetWeight: z.number().min(0).optional(),
});

export const proposeRoutineTool = tool({
  description:
    "Propone una rutina completa (ejercicios sueltos, bi-series o tri-series) para que el usuario la revise y la cree con un clic. Todos los exerciseId deben venir de resultados previos de searchExercises.",
  inputSchema: z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    scheduledDays: z
      .array(z.number().int().min(1).max(7))
      .optional()
      .describe("Días de la semana sugeridos, 1=lunes..7=domingo"),
    blocks: z
      .array(
        z.object({
          type: z.enum(["single", "bi_series", "tri_series"]),
          exercises: z.array(blockExerciseSchema).min(1).max(3),
        }),
      )
      .min(1)
      .max(50),
  }),
  execute: async (input) => {
    const blocks = input.blocks.map((block) => ({
      ...block,
      exercises: block.exercises.map((ex) => {
        const exercise = getExerciseById(ex.exerciseId);
        if (!exercise) {
          throw new Error(`exerciseId '${ex.exerciseId}' no existe en el catálogo — usa searchExercises primero.`);
        }
        return { ...ex, exerciseName: exercise.name, exerciseImage: exercise.image };
      }),
    }));

    return { ...input, blocks };
  },
});
