import { z } from "zod";
import { ASSISTING_MUSCLES, MUSCLE_GROUPS, canAssist } from "./exercise-muscles";
import { parseExerciseVideo } from "./exercise-video";

export const MAX_GIF_BYTES = 3 * 1024 * 1024;
export const exerciseInput = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  muscleGroup: z.string().refine((value) => MUSCLE_GROUPS.some((group) => group.label === value)),
  assistingMuscles: z.array(z.string().refine(value => ASSISTING_MUSCLES.some(group => group.label === value))).max(ASSISTING_MUSCLES.length).default([]),
  videoUrl: z.string().trim().max(2048).refine(value => !value || parseExerciseVideo(value) !== null, "Usa el enlace completo de un video de YouTube, Instagram o TikTok.").default(""),
  equipment: z.string().trim().min(1).max(80),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(15),
}).refine(input => input.assistingMuscles.every(label => canAssist(label, input.muscleGroup)) && new Set(input.assistingMuscles).size === input.assistingMuscles.length, { message: "Los músculos asistentes deben ser distintos del grupo principal y no repetirse.", path: ["assistingMuscles"] });
