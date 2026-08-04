import { unstable_cache } from "next/cache";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { routineBlocks, routines, setLogs, workoutSessions } from "@/lib/db/schema";

export type HomeStats = {
  activeToday: number;
  routinesCount: number;
  setsThisWeek: number;
  avgBlocksPerRoutine: number;
};

async function fetchHomeStats(): Promise<HomeStats> {
  const db = getDb();

  const [[activeTodayRow], [routinesRow], [setsWeekRow], avgBlocksResult] = await Promise.all([
    db
      .select({ n: sql<number>`count(distinct ${workoutSessions.userId})` })
      .from(workoutSessions)
      .where(sql`${workoutSessions.startedAt} >= date_trunc('day', now())`),
    db.select({ n: sql<number>`count(*)` }).from(routines),
    db
      .select({ n: sql<number>`count(*)` })
      .from(setLogs)
      .where(and(eq(setLogs.completed, true), gte(setLogs.completedAt, sql`now() - interval '7 days'`))),
    db.execute<{ avg: number }>(sql`
      select coalesce(round(avg(cnt)), 0)::int as avg from (
        select count(*) as cnt from ${routineBlocks} group by routine_id
      ) t
    `),
  ]);

  return {
    activeToday: Number(activeTodayRow.n),
    routinesCount: Number(routinesRow.n),
    setsThisWeek: Number(setsWeekRow.n),
    avgBlocksPerRoutine: Number(avgBlocksResult.rows[0]?.avg ?? 0),
  };
}

// Numeros reales del home publico: se cachean 5 min para no pegarle a la DB
// en cada visita de un usuario no autenticado.
export const getHomeStats = unstable_cache(fetchHomeStats, ["home-stats"], {
  revalidate: 300,
});
