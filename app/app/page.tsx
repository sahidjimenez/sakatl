import Link from "next/link";
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/auth";
import { getStreak, getTodayAndUpcoming, getWeeklyProgress } from "@/lib/routines";
import { startSessionAction } from "@/lib/actions/routines";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = {
  title: "Inicio — Sakatl",
};

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

function getWeekDates(): Date[] {
  const now = new Date();
  const isoDay = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (isoDay - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default async function AppDashboard() {
  const userId = await requireUser();
  const [user, progress, schedule, streak] = await Promise.all([
    currentUser(),
    getWeeklyProgress(userId),
    getTodayAndUpcoming(userId),
    getStreak(userId),
  ]);

  const firstName = user?.firstName ?? "";
  const weekDates = getWeekDates();
  const todayIso = new Date().toDateString();
  const progressPct = Math.min(100, Math.round((progress.sessionsCount / progress.weeklyGoal) * 100));

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold">
              ¡Hola{firstName ? `, ${firstName}` : ""}! 👋
            </h1>
            {streak > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-[#2a2f37] bg-[#1c2026] px-3 py-1.5 text-sm font-bold text-[#f97316]">
                🔥 {streak}
              </span>
            )}
          </div>
          <p className="mt-1 text-[#9099a3]">Listo para seguir superándote hoy</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === todayIso;
            const iso = i + 1;
            const hasRoutine = schedule.scheduledWeekdays.includes(iso);
            return (
              <div
                key={i}
                className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2.5 ${
                  isToday ? "bg-[#22c55e] text-[#08150d]" : "bg-[#1c2026] text-[#f1f3f4]"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold tracking-wide ${isToday ? "text-[#08150d]/70" : "text-[#9099a3]"}`}
                >
                  {DAY_LABELS[i]}
                </span>
                <span className="text-lg font-extrabold">{date.getDate()}</span>
                {hasRoutine && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-[#08150d]" : "bg-[#4ade80]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6">
            <p className="mb-4 text-base font-bold text-[#f1f3f4]">
              Tu progreso <span className="font-normal text-[#9099a3]">Esta semana</span>
            </p>
            <div className="mb-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#9099a3]">Entrenamientos</p>
                <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">
                  {progress.sessionsCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9099a3]">Volumen</p>
                <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">
                  {Math.round(progress.volumeKg).toLocaleString("es")} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9099a3]">Tiempo</p>
                <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">
                  {formatDuration(progress.totalMs)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9099a3]">Meta semanal</span>
              <span className="text-[#9099a3]">
                {progress.sessionsCount}/{progress.weeklyGoal}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#2a2f37]">
              <div
                className="h-full rounded-full bg-[#22c55e]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6">
            {schedule.today ? (
              <>
                <p className="text-sm text-[#9099a3]">Rutina de hoy</p>
                <p className="mt-1 text-xl font-extrabold text-[#f1f3f4]">{schedule.today.name}</p>
                <p className="mt-1 text-sm text-[#9099a3]">
                  {schedule.today.blockCount} ejercicio{schedule.today.blockCount !== 1 ? "s" : ""}
                </p>
                <form action={startSessionAction.bind(null, schedule.today.id)} className="mt-5">
                  <button
                    type="submit"
                    className="w-full rounded-[10px] bg-[#22c55e] px-5 py-3 text-sm font-bold text-[#08150d]"
                  >
                    Comenzar rutina
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-[#9099a3]">Hoy no tienes rutina agendada</p>
                <p className="mt-2 text-sm text-[#6b7280]">
                  Agenda días para tus rutinas y aquí te va a aparecer la de hoy.
                </p>
                <Link
                  href="/app/rutinas"
                  className="mt-5 rounded-[10px] border border-[#2a2f37] px-5 py-3 text-center text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
                >
                  Ver mis rutinas
                </Link>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Próximos entrenamientos</h2>
            <Link href="/app/rutinas" className="text-sm font-semibold text-[#9099a3] hover:text-[#f1f3f4]">
              Ver todos
            </Link>
          </div>
          {schedule.upcoming.length === 0 ? (
            <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-8 text-center text-sm text-[#9099a3]">
              No tienes más entrenamientos agendados esta semana.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {schedule.upcoming.map((r) => (
                <Link
                  key={`${r.id}-${r.dayLabel}`}
                  href={`/app/rutinas/${r.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3.5 hover:border-[#4ade80]"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[#23272e]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#f1f3f4]">{r.name}</p>
                    <p className="text-xs text-[#9099a3]">{r.dayLabel}</p>
                  </div>
                  <span className="text-[#6b7280]">›</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
