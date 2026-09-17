"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { startSessionAction, updateRoutineScheduleAction } from "@/lib/actions/routines";
import type { RoutineScheduleCard } from "@/lib/routines";

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const FULL_DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
type WeekdayRoutine = { id: string; name: string; description: string | null; blockCount: number };

export function WeekStrip({ weekDates, todayWeekday, scheduledWeekdays, routinesByWeekday, routines }: {
  weekDates: { key: string; day: number }[];
  todayWeekday: number;
  scheduledWeekdays: number[];
  routinesByWeekday: Record<number, WeekdayRoutine[]>;
  routines: RoutineScheduleCard[];
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDates.map((date, i) => {
          const iso = i + 1;
          const highlighted = iso === (selectedDay ?? todayWeekday);
          return (
            <button key={date.key} type="button" onClick={() => setSelectedDay(iso)}
              aria-label={`${FULL_DAY_LABELS[i]} ${date.day}${iso === todayWeekday ? ", hoy" : ""}: editar rutinas`}
              aria-haspopup="dialog"
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-colors ${highlighted ? "bg-[#22c55e] text-[#08150d]" : "bg-[#1c2026] text-[#f1f3f4] hover:bg-[#23272e]"}`}>
              <span className={`text-[11px] font-semibold tracking-wide ${highlighted ? "text-[#08150d]/70" : "text-[#9099a3]"}`}>{DAY_LABELS[i]}</span>
              <span className="text-lg font-extrabold">{date.day}</span>
              {scheduledWeekdays.includes(iso) && <span className={`h-1.5 w-1.5 rounded-full ${highlighted ? "bg-[#08150d]" : "bg-[#4ade80]"}`} />}
            </button>
          );
        })}
      </div>
      {selectedDay !== null && <DayRoutinesDialog
        day={selectedDay} date={weekDates[selectedDay - 1].day} isToday={selectedDay === todayWeekday}
        routines={routines} assigned={routinesByWeekday[selectedDay] ?? []}
        onClose={() => setSelectedDay(null)} />}
    </>
  );
}

function DayRoutinesDialog({ day, date, isToday, routines, assigned, onClose }: {
  day: number;
  date: number;
  isToday: boolean;
  routines: RoutineScheduleCard[];
  assigned: WeekdayRoutine[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const dialog = ref.current!;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  function toggle(routine: RoutineScheduleCard, checked: boolean) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const days = checked ? [...routine.scheduledDays, day] : routine.scheduledDays.filter(d => d !== day);
        const result = await updateRoutineScheduleAction(routine.id, days);
        if ("error" in result) setError(result.error);
        else setSaved(true);
      } catch {
        setError("No se pudo guardar el cambio. Intenta de nuevo.");
      }
    });
  }

  return (
    <dialog ref={ref} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={event => { if (event.target === event.currentTarget && !pending) onClose(); }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#0d0f12] p-0 text-[#f1f3f4] shadow-2xl backdrop:bg-black/75">
      <div className="p-5 sm:p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-extrabold">{FULL_DAY_LABELS[day - 1]} {date}{isToday && <span className="ml-2 text-xs font-normal text-[#4ade80]">Hoy</span>}</h2>
            <p className="mt-2 text-sm text-[#9099a3]">Marca las rutinas para este día de la semana. Los cambios se guardan automáticamente.</p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="min-h-11 rounded-lg border border-[#2a2f37] px-3 text-sm disabled:opacity-40">Cerrar</button>
        </header>
        {routines.length === 0 ? (
          <div className="rounded-xl border border-[#2a2f37] p-4 text-sm">
            <p className="text-[#9099a3]">Todavía no tienes rutinas para asignar.</p>
            <Link href="/app/rutinas" className="mt-3 inline-block font-semibold text-[#4ade80]">Crear una rutina</Link>
          </div>
        ) : (
          <fieldset disabled={pending} aria-busy={pending} className="flex flex-col gap-3 disabled:opacity-60">
            <legend className="sr-only">Rutinas asignadas al {FULL_DAY_LABELS[day - 1].toLowerCase()}</legend>
            {routines.map(routine => {
              const checked = routine.scheduledDays.includes(day);
              const details = assigned.find(item => item.id === routine.id);
              return (
                <div key={routine.id} className={`rounded-xl border p-4 ${checked ? "border-[#4ade80]/60 bg-[#22c55e]/10" : "border-[#2a2f37] bg-[#1c2026]"}`}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={checked} onChange={event => toggle(routine, event.target.checked)} className="h-5 w-5 shrink-0 accent-[#22c55e]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{routine.name}</span>
                      <span className="mt-1 block text-xs text-[#9099a3]">{checked ? "Asignada a este día" : "Sin asignar a este día"}{details ? ` · ${details.blockCount} ejercicios` : ""}</span>
                    </span>
                  </label>
                  <div className="mt-2 flex items-center justify-between gap-3 pl-8">
                    <Link href={`/app/rutinas/${routine.id}`} className="text-xs text-[#9099a3] hover:text-[#4ade80]">Ver ejercicios</Link>
                    {checked && isToday && <form action={startSessionAction.bind(null, routine.id)}><button disabled={pending} className="rounded-lg bg-[#22c55e] px-3 py-2 text-xs font-bold text-[#08150d]">Empezar</button></form>}
                  </div>
                </div>
              );
            })}
          </fieldset>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <p role="status" className="mt-4 min-h-5 text-sm text-[#4ade80]">{pending ? "Guardando…" : saved ? "Cambios guardados" : ""}</p>
      </div>
    </dialog>
  );
}
