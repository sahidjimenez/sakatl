export type ExerciseHistorySession = {
  sessionId: string;
  date: string;
  routineName: string;
  sets: { id: string; setNumber: number; weight: number | null; reps: number | null }[];
};

export type ExerciseHistoryRow = ExerciseHistorySession["sets"][number] & {
  exerciseId: string;
  sessionId: string;
  date: string;
  routineName: string;
};

export function groupExerciseHistory(rows: ExerciseHistoryRow[]): Record<string, ExerciseHistorySession[]> {
  const exercises = new Map<string, Map<string, ExerciseHistorySession>>();
  for (const row of rows) {
    let sessions = exercises.get(row.exerciseId);
    if (!sessions) exercises.set(row.exerciseId, sessions = new Map());
    let session = sessions.get(row.sessionId);
    if (!session) sessions.set(row.sessionId, session = {
      sessionId: row.sessionId, date: row.date, routineName: row.routineName, sets: [],
    });
    session.sets.push({ id: row.id, setNumber: row.setNumber, weight: row.weight, reps: row.reps });
  }
  return Object.fromEntries(Array.from(exercises, ([exerciseId, sessions]) => [exerciseId,
    Array.from(sessions.values()).sort((a, b) => b.date.localeCompare(a.date) || a.sessionId.localeCompare(b.sessionId))
      .map(session => ({ ...session, sets: session.sets.sort((a, b) => a.setNumber - b.setNumber || a.id.localeCompare(b.id)) })),
  ]));
}
