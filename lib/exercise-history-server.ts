import "server-only";
import { and, eq, inArray, lt, ne } from "drizzle-orm";
import { getDb } from "./db";
import { routineBlockExercises, routines, setLogs, workoutSessions } from "./db/schema";
import { groupExerciseHistory } from "./exercise-history";

export async function getExerciseHistory(userId: string, exerciseIds: string[], sessionId: string, startedAt: Date) {
  if (!exerciseIds.length) return {};
  const rows = await getDb().select({
    id: setLogs.id, exerciseId: routineBlockExercises.exerciseId,
    sessionId: workoutSessions.id, date: workoutSessions.startedAt,
    routineName: routines.name, setNumber: setLogs.setNumber,
    weight: setLogs.weight, reps: setLogs.reps,
  }).from(setLogs)
    .innerJoin(workoutSessions, eq(workoutSessions.id, setLogs.sessionId))
    .innerJoin(routineBlockExercises, eq(routineBlockExercises.id, setLogs.blockExerciseId))
    .innerJoin(routines, eq(routines.id, workoutSessions.routineId))
    .where(and(eq(workoutSessions.userId, userId), eq(setLogs.completed, true),
      inArray(routineBlockExercises.exerciseId, [...new Set(exerciseIds)]),
      ne(workoutSessions.id, sessionId), lt(workoutSessions.startedAt, startedAt)));
  return groupExerciseHistory(rows.map(row => ({ ...row, date: row.date.toISOString() })));
}
