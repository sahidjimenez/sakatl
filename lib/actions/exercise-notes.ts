"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveExerciseNote } from "@/lib/exercise-notes";
import { ApiError } from "@/lib/errors";

export async function saveExerciseNoteAction(exerciseId: string, note: string) {
  const userId = await requireUser();
  try {
    const saved = await saveExerciseNote(userId, exerciseId, note);
    revalidatePath("/app", "layout");
    return { note: saved };
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    return { error: "No se pudo guardar la nota. Intenta de nuevo." };
  }
}
