export type ExerciseSessionPoint = {
  sessionId: string;
  date: string;
  maxWeight: number | null;
  volume: number;
};

export type ExerciseProgress = {
  exerciseId: string;
  name: string;
  image: string;
  sessions: ExerciseSessionPoint[];
};

export const progressPeriods = ["1M", "2M", "6M", "1A", "Todo"] as const;
export type ProgressPeriod = (typeof progressPeriods)[number];

export function progressStart(period: ProgressPeriod, now: string): string | null {
  if (period === "Todo") return null;
  const date = new Date(now);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - ({ "1M": 1, "2M": 2, "6M": 6, "1A": 12 }[period]));
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
