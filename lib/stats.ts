import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import { routineBlockExercises, setLogs, workoutSessions } from "./db/schema";
import { getExerciseById } from "./exercises";
import { startOfWeekUTC } from "./routines";

export type WeeklyVolumePoint = {
  weekStart: string;
  volumeKg: number;
  sessionsCount: number;
};

export async function getVolumeHistory(userId: string, weeks = 12): Promise<WeeklyVolumePoint[]> {
  const db = getDb();
  const currentWeekStart = startOfWeekUTC(new Date());
  const rangeStart = new Date(currentWeekStart);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (weeks - 1) * 7);

  const sessions = await db
    .select({ id: workoutSessions.id, completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        isNotNull(workoutSessions.completedAt),
        gte(workoutSessions.completedAt, rangeStart),
      ),
    );

  const sessionIds = sessions.map((s) => s.id);
  const volumeBySession = new Map<string, number>();
  if (sessionIds.length > 0) {
    const rows = await db
      .select({
        sessionId: setLogs.sessionId,
        volume: sql<string>`coalesce(sum(${setLogs.weight} * ${setLogs.reps}), 0)`,
      })
      .from(setLogs)
      .where(and(inArray(setLogs.sessionId, sessionIds), eq(setLogs.completed, true)))
      .groupBy(setLogs.sessionId);
    for (const r of rows) volumeBySession.set(r.sessionId, Number(r.volume));
  }

  const buckets = new Map<string, { volumeKg: number; sessionsCount: number }>();
  for (let i = 0; i < weeks; i++) {
    const d = new Date(rangeStart);
    d.setUTCDate(d.getUTCDate() + i * 7);
    buckets.set(d.toISOString().slice(0, 10), { volumeKg: 0, sessionsCount: 0 });
  }

  for (const s of sessions) {
    if (!s.completedAt) continue;
    const weekKey = startOfWeekUTC(s.completedAt).toISOString().slice(0, 10);
    const bucket = buckets.get(weekKey);
    if (!bucket) continue;
    bucket.volumeKg += volumeBySession.get(s.id) ?? 0;
    bucket.sessionsCount += 1;
  }

  return Array.from(buckets.entries()).map(([weekStart, v]) => ({ weekStart, ...v }));
}

export type ExercisePR = {
  exerciseId: string;
  name: string;
  image: string;
  maxWeight: number;
  reps: number | null;
  achievedAt: Date;
};

export async function getExercisePRs(userId: string, limit = 8): Promise<ExercisePR[]> {
  const db = getDb();
  const rows = await db
    .select({
      exerciseId: routineBlockExercises.exerciseId,
      weight: setLogs.weight,
      reps: setLogs.reps,
      completedAt: setLogs.completedAt,
    })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(workoutSessions.id, setLogs.sessionId))
    .innerJoin(routineBlockExercises, eq(routineBlockExercises.id, setLogs.blockExerciseId))
    .where(
      and(
        eq(workoutSessions.userId, userId),
        eq(setLogs.completed, true),
        isNotNull(setLogs.weight),
      ),
    );

  const bestByExercise = new Map<string, { weight: number; reps: number | null; achievedAt: Date }>();
  for (const r of rows) {
    if (r.weight == null) continue;
    const current = bestByExercise.get(r.exerciseId);
    if (!current || r.weight > current.weight) {
      bestByExercise.set(r.exerciseId, {
        weight: r.weight,
        reps: r.reps,
        achievedAt: r.completedAt ?? new Date(0),
      });
    }
  }

  return Array.from(bestByExercise.entries())
    .map(([exerciseId, best]) => {
      const exercise = getExerciseById(exerciseId);
      if (!exercise) return null;
      return {
        exerciseId,
        name: exercise.name,
        image: exercise.image,
        maxWeight: best.weight,
        reps: best.reps,
        achievedAt: best.achievedAt,
      };
    })
    .filter((pr): pr is ExercisePR => pr !== null)
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, limit);
}

export type MuscleDistributionPoint = { muscleGroup: string; setsCount: number };

export async function getMuscleDistribution(
  userId: string,
  days = 90,
): Promise<MuscleDistributionPoint[]> {
  const db = getDb();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const rows = await db
    .select({ exerciseId: routineBlockExercises.exerciseId })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(workoutSessions.id, setLogs.sessionId))
    .innerJoin(routineBlockExercises, eq(routineBlockExercises.id, setLogs.blockExerciseId))
    .where(
      and(
        eq(workoutSessions.userId, userId),
        eq(setLogs.completed, true),
        gte(setLogs.completedAt, since),
      ),
    );

  const counts = new Map<string, number>();
  for (const r of rows) {
    const exercise = getExerciseById(r.exerciseId);
    const group = exercise?.muscle_group ?? "otro";
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([muscleGroup, setsCount]) => ({ muscleGroup, setsCount }))
    .sort((a, b) => b.setsCount - a.setsCount);
}

export async function getLifetimeVolume(userId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({
      volume: sql<string>`coalesce(sum(${setLogs.weight} * ${setLogs.reps}), 0)`,
    })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(workoutSessions.id, setLogs.sessionId))
    .where(and(eq(workoutSessions.userId, userId), eq(setLogs.completed, true)));
  return row ? Number(row.volume) : 0;
}

export async function getStreakHistory(userId: string, days = 14): Promise<number[]> {
  const db = getDb();
  const sessions = await db
    .select({ completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), isNotNull(workoutSessions.completedAt)));

  const trainedDays = new Set<string>();
  for (const s of sessions) {
    if (s.completedAt) trainedDays.add(s.completedAt.toISOString().slice(0, 10));
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);

    let streak = 0;
    const cursor = new Date(day);
    while (trainedDays.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    points.push(streak);
  }
  return points;
}

export async function getBestStreak(userId: string): Promise<number> {
  const db = getDb();
  const sessions = await db
    .select({ completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), isNotNull(workoutSessions.completedAt)));

  const days = new Set<string>();
  for (const s of sessions) {
    if (s.completedAt) days.add(s.completedAt.toISOString().slice(0, 10));
  }
  if (days.size === 0) return 0;

  const sortedDays = Array.from(days).sort();
  let best = 1;
  let current = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = Math.round(
      (new Date(sortedDays[i]).getTime() - new Date(sortedDays[i - 1]).getTime()) / 86400000,
    );
    current = diffDays === 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}
