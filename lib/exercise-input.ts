import { z } from "zod";
import { MUSCLE_GROUPS } from "./exercise-muscles";

export const MAX_GIF_BYTES = 3 * 1024 * 1024;
export const exerciseInput = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  muscleGroup: z.string().refine((value) => MUSCLE_GROUPS.some((group) => group.label === value)),
  equipment: z.string().trim().min(1).max(80),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(15),
});
