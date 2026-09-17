import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { users, workoutSessions, routines } from "./db/schema";
import { ApiError } from "./errors";
import { calculateSessionClock } from "./session-clock";

export async function sessionClock(userId: string, id: string, operation: "read" | "pause" | "resume" | "activity" | "finish" | "reopen" | "duration" = "read", minutes?: number) {
  if (operation === "duration" && (minutes === undefined || !Number.isFinite(minutes) || minutes < 0 || minutes > 1440)) throw new ApiError(400, "Indica una duración entre 0 y 1440 minutos.");
  return getDb().transaction(async tx => {
    const [session] = await tx.select().from(workoutSessions).where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId))).for("update");
    if (!session) throw new ApiError(404, "Sesión no encontrada.");
    const [user] = await tx.select({ minutes: users.autoPauseMinutes }).from(users).where(eq(users.id, userId));
    const now = new Date();
    const clock = calculateSessionClock(session, user.minutes, now);
    const changes: Partial<typeof workoutSessions.$inferInsert> = {};
    if (clock.paused && session.runningSince) { changes.activeSeconds = clock.activeSeconds; changes.runningSince = null; }
    if (operation === "pause" && !session.completedAt) { changes.activeSeconds = clock.activeSeconds; changes.runningSince = null; }
    if ((operation === "resume" && clock.paused) || (operation === "reopen" && session.completedAt)) {
      changes.activeSeconds = clock.activeSeconds; changes.runningSince = now; changes.lastActivityAt = now; changes.completedAt = null;
    }
    if (operation === "activity" && !session.completedAt && !clock.paused) changes.lastActivityAt = now;
    if (operation === "finish" && !session.completedAt) { changes.activeSeconds = clock.activeSeconds; changes.runningSince = null; changes.completedAt = now; }
    if (operation === "duration") { changes.activeSeconds = Math.round(minutes! * 60); changes.runningSince = null; }
    if (Object.keys(changes).length) await tx.update(workoutSessions).set(changes).where(eq(workoutSessions.id, id));
    const result = { ...session, ...changes } as typeof session;
    return { ...calculateSessionClock(result, user.minutes, now), autoPauseMinutes: user.minutes, serverNow: now.getTime() };
  });
}

export async function pendingSessions(userId: string) {
  const rows = await getDb().select({ id: workoutSessions.id, name: routines.name }).from(workoutSessions)
    .innerJoin(routines, eq(workoutSessions.routineId, routines.id))
    .where(and(eq(workoutSessions.userId, userId), isNull(workoutSessions.completedAt)))
    .orderBy(desc(workoutSessions.startedAt));
  return rows;
}
