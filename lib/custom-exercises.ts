import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { customExercises } from "./db/schema";

export function customExercisesEnabled() {
  return Boolean(process.env.DATABASE_URL) && process.env.CUSTOM_EXERCISES_ENABLED !== "false";
}

export async function loadCustomExercises(includeDeleted = false) {
  if (!customExercisesEnabled()) return [];
  return (await getDb().select({ record: customExercises.record }).from(customExercises)
    .where(includeDeleted ? undefined : sql`${customExercises.record}->>'deleted_at' IS NULL`)
    .orderBy(desc(customExercises.createdAt))).map((row) => row.record);
}

export async function listMyCustomExercises(ownerId: string) {
  if (!customExercisesEnabled()) return [];
  return (await getDb().select({ record: customExercises.record }).from(customExercises)
    .where(and(eq(customExercises.ownerId, ownerId), sql`${customExercises.record}->>'deleted_at' IS NULL`))
    .orderBy(desc(customExercises.createdAt))).map(row => row.record);
}
