import { desc } from "drizzle-orm";
import { getDb } from "./db";
import { customExercises } from "./db/schema";

export function customExercisesEnabled() {
  return Boolean(process.env.DATABASE_URL) && process.env.CUSTOM_EXERCISES_ENABLED !== "false";
}

export async function loadCustomExercises() {
  if (!customExercisesEnabled()) return [];
  return (await getDb().select({ record: customExercises.record }).from(customExercises).orderBy(desc(customExercises.createdAt))).map((row) => row.record);
}
