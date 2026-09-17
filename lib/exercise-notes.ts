import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { exerciseNotes } from "./db/schema";
import { ApiError } from "./errors";
import { getExerciseLookup } from "./exercises";

export async function getExerciseNotes(userId: string, exerciseIds: string[]) {
  if (!exerciseIds.length) return {} as Record<string, string>;
  const rows = await getDb().select({ id: exerciseNotes.exerciseId, note: exerciseNotes.note }).from(exerciseNotes)
    .where(and(eq(exerciseNotes.userId, userId), inArray(exerciseNotes.exerciseId, [...new Set(exerciseIds)])));
  return Object.fromEntries(rows.map(row => [row.id, row.note])) as Record<string, string>;
}

export async function saveExerciseNote(userId: string, exerciseId: string, input: unknown) {
  if (typeof input !== "string" || input.trim().length > 2000) throw new ApiError(400, "La nota debe tener un máximo de 2000 caracteres.");
  const lookup = await getExerciseLookup();
  if (!lookup(exerciseId)) throw new ApiError(404, "Ejercicio no encontrado.");
  const note = input.trim();
  const db = getDb();
  if (!note) {
    await db.delete(exerciseNotes).where(and(eq(exerciseNotes.userId, userId), eq(exerciseNotes.exerciseId, exerciseId)));
  } else {
    await db.insert(exerciseNotes).values({ userId, exerciseId, note }).onConflictDoUpdate({
      target: [exerciseNotes.userId, exerciseNotes.exerciseId], set: { note, updatedAt: new Date() },
    });
  }
  return note;
}
