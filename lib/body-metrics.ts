import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { bodyMetrics } from "./db/schema";
import { ApiError } from "./routines";

export async function logBodyWeight(userId: string, weightKg: number, recordedAt?: Date) {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
    throw new ApiError(400, "El peso debe ser un número válido en kg (0-500).");
  }
  const db = getDb();
  const [row] = await db
    .insert(bodyMetrics)
    .values({ userId, weightKg, recordedAt: recordedAt ?? new Date() })
    .returning();
  return row;
}

export async function listBodyWeightHistory(userId: string, limit = 20) {
  const db = getDb();
  return db
    .select({
      id: bodyMetrics.id,
      weightKg: bodyMetrics.weightKg,
      recordedAt: bodyMetrics.recordedAt,
    })
    .from(bodyMetrics)
    .where(eq(bodyMetrics.userId, userId))
    .orderBy(desc(bodyMetrics.recordedAt))
    .limit(limit);
}
