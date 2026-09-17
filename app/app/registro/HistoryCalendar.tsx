"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDuration } from "@/lib/format";

export type CalendarSession = { id: string; routineName: string; day: string; time: string; duration: number | null; paused: boolean };

export function HistoryCalendar({ cells, sessions, initialDay, today }: {
  cells: (string | null)[]; sessions: CalendarSession[]; initialDay: string; today: string;
}) {
  const [selected, setSelected] = useState(initialDay);
  const grouped = new Map<string, CalendarSession[]>();
  for (const session of sessions) grouped.set(session.day, [...(grouped.get(session.day) ?? []), session]);
  const entries = grouped.get(selected) ?? [];
  return <>
    <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-3 sm:p-5">
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => <span key={day} className="py-2 text-xs text-[#9099a3]">{day}</span>)}
        {cells.map((day, index) => day ? <button key={day} type="button" onClick={() => setSelected(day)} aria-pressed={selected === day}
          aria-current={day === today ? "date" : undefined}
          aria-label={`${day}, ${grouped.get(day)?.length ?? 0} entrenamientos`}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border text-sm sm:min-h-20 ${selected === day ? "border-[#22c55e] bg-[#22c55e] text-[#08150d]" : day === today ? "border-[#4ade80]" : "border-transparent hover:bg-[#2a2f37]"}`}>
          <span>{Number(day.slice(-2))}</span>
          <span className="min-h-4 text-[10px]">{grouped.has(day) ? `${grouped.get(day)!.length} ses.` : ""}</span>
        </button> : <span key={`empty-${index}`} />)}
      </div>
    </div>
    <section aria-live="polite">
      <h2 className="mb-3 text-lg font-bold">{new Date(`${selected}T12:00:00Z`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</h2>
      {entries.length === 0 ? <p className="rounded-xl border border-[#2a2f37] p-5 text-sm text-[#9099a3]">No hay entrenamientos registrados este día.</p> : <div className="space-y-2">{entries.map(session =>
        <Link key={session.id} href={`/app/sesiones/${session.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#2a2f37] bg-[#1c2026] p-4 hover:border-[#4ade80]">
          <div><p className="font-semibold">{session.routineName}</p><p className="mt-1 text-xs text-[#9099a3]">{session.time} · Ver ejercicios y series →</p></div>
          <span className="text-xs text-[#4ade80]">{session.duration === null ? (session.paused ? "Pausada" : "En curso") : formatDuration(session.duration)}</span>
        </Link>)}</div>}
    </section>
  </>;
}
