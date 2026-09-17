import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listAllMySessions } from "@/lib/routines";
import { formatDuration } from "@/lib/format";
import { historyDayKey, historyMonth } from "@/lib/history-calendar";
import { HistoryCalendar } from "./HistoryCalendar";

export const metadata: Metadata = {
  title: "Registro — Sakatl",
};

export default async function RegistroPage({ searchParams }: {
  searchParams: Promise<{ view?: string; month?: string }>;
}) {
  const userId = await requireUser();
  const params = await searchParams;
  const calendar = params.view === "calendar";
  const today = historyDayKey(new Date());
  const month = typeof params.month === "string" && /^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/.test(params.month) ? params.month : today.slice(0, 7);
  const dates = historyMonth(month);
  const sessions = await listAllMySessions(userId, 50, calendar ? month : undefined);
  const buttonClass = "rounded-lg border border-[#2a2f37] px-3 py-2.5 text-sm font-semibold";

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold">Registro</h1>
            <nav aria-label="Vista del registro" className="flex gap-2">
              <Link href={`/app/registro?view=calendar&month=${month}`} aria-current={calendar ? "page" : undefined} className={`${buttonClass} ${calendar ? "bg-[#22c55e] text-[#08150d]" : "bg-[#1c2026]"}`}>Calendario</Link>
              <Link href={`/app/registro?view=list&month=${month}`} aria-current={!calendar ? "page" : undefined} className={`${buttonClass} ${!calendar ? "bg-[#22c55e] text-[#08150d]" : "bg-[#1c2026]"}`}>Lista</Link>
            </nav>
          </div>
          <p className="mt-1 text-[#9099a3]">Historial de todos tus entrenamientos.</p>
        </div>

        {calendar ? <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold capitalize">{dates.label}</h2>
            <nav aria-label="Mes del registro" className="flex gap-2">
              <Link className={buttonClass} aria-label="Mes anterior" href={`/app/registro?view=calendar&month=${dates.previous}`}>←</Link>
              <Link className={buttonClass} href={`/app/registro?view=calendar&month=${today.slice(0, 7)}`}>Hoy</Link>
              <Link className={buttonClass} aria-label="Mes siguiente" href={`/app/registro?view=calendar&month=${dates.next}`}>→</Link>
            </nav>
          </div>
          <HistoryCalendar key={month} cells={dates.cells} today={today}
            initialDay={today.startsWith(month) ? today : `${month}-01`}
            sessions={sessions.map(session => ({ id: session.id, routineName: session.routineName,
              day: historyDayKey(session.startedAt), paused: session.paused,
              time: session.startedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" }),
              duration: session.completedAt ? session.activeSeconds * 1000 : null,
            }))} />
        </> : sessions.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
            Todavía no registraste ningún entrenamiento.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const durationMs = s.completedAt ? s.activeSeconds * 1000 : null;
              return (
                <Link
                  key={s.id}
                  href={`/app/sesiones/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3.5 hover:border-[#4ade80]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#f1f3f4]">{s.routineName}</p>
                    <p className="text-xs text-[#9099a3]">
                      {new Date(s.startedAt).toLocaleDateString("es", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        timeZone: "America/Mexico_City",
                      })}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    {durationMs != null ? (
                      <span className="font-semibold text-[#4ade80]">
                        {formatDuration(durationMs)}
                      </span>
                    ) : (
                      <span className="font-semibold text-[#9099a3]">{s.paused ? "Pausada" : "En curso"}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
