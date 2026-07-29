"use client";

import { useState } from "react";
import Link from "next/link";
import { startSessionAction } from "@/lib/actions/routines";

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const FULL_DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type WeekdayRoutine = { id: string; name: string; description: string | null; blockCount: number };

function isoWeekdayOf(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

export function WeekStrip({
  weekDates,
  scheduledWeekdays,
  routinesByWeekday,
}: {
  weekDates: Date[];
  scheduledWeekdays: number[];
  routinesByWeekday: Record<number, WeekdayRoutine[]>;
}) {
  const today = new Date();
  const todayIso = today.toDateString();
  const [selectedDay, setSelectedDay] = useState<number>(isoWeekdayOf(today));

  const selectedDate = weekDates[selectedDay - 1];
  const selectedRoutines = routinesByWeekday[selectedDay] ?? [];
  const isSelectedToday = selectedDate.toDateString() === todayIso;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDates.map((date, i) => {
          const iso = i + 1;
          const isToday = date.toDateString() === todayIso;
          const isSelected = selectedDay === iso;
          const hasRoutine = scheduledWeekdays.includes(iso);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(iso)}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-colors ${
                isSelected
                  ? "bg-[#22c55e] text-[#08150d]"
                  : isToday
                    ? "border border-[#4ade80] text-[#f1f3f4]"
                    : "bg-[#1c2026] text-[#f1f3f4] hover:bg-[#23272e]"
              }`}
            >
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  isSelected ? "text-[#08150d]/70" : "text-[#9099a3]"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <span className="text-lg font-extrabold">{date.getDate()}</span>
              {hasRoutine && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-[#08150d]" : "bg-[#4ade80]"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
        <p className="mb-3 text-sm font-bold text-[#f1f3f4]">
          {FULL_DAY_LABELS[selectedDay - 1]}
          {isSelectedToday && <span className="ml-2 text-xs font-normal text-[#4ade80]">Hoy</span>}
        </p>

        {selectedRoutines.length === 0 ? (
          <p className="text-sm text-[#9099a3]">No tienes rutinas agendadas este día.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedRoutines.map((routine) => (
              <div
                key={routine.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#23272e] bg-[#0d0f12] px-4 py-3"
              >
                <div>
                  <Link
                    href={`/app/rutinas/${routine.id}`}
                    className="text-sm font-semibold text-[#f1f3f4] hover:text-[#4ade80]"
                  >
                    {routine.name}
                  </Link>
                  <p className="text-xs text-[#9099a3]">
                    {routine.blockCount} ejercicio{routine.blockCount !== 1 ? "s" : ""}
                    {routine.description ? ` · ${routine.description}` : ""}
                  </p>
                </div>
                {isSelectedToday && (
                  <form action={startSessionAction.bind(null, routine.id)}>
                    <button
                      type="submit"
                      className="shrink-0 rounded-[10px] bg-[#22c55e] px-3 py-2 text-xs font-bold text-[#08150d]"
                    >
                      Empezar
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
