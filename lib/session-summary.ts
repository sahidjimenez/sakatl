export type SessionSummary = {
  name: string;
  routineName: string;
  completedAt: string;
  volumeKg: number;
  exercises: number;
  activeSeconds: number;
  sessionsCount: number;
  weeklyGoal: number;
  notes: string;
};

export function summarizeSets(logs: { completed: boolean; blockExerciseId: string; weight: number | null; reps: number | null }[]) {
  const completed = logs.filter((log) => log.completed);
  return {
    volumeKg: completed.reduce((sum, log) => sum + (log.weight ?? 0) * (log.reps ?? 0), 0),
    exercises: new Set(completed.map((log) => log.blockExerciseId)).size,
  };
}

export function summaryDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
