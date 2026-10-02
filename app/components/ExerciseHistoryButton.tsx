"use client";

import { useId, useRef } from "react";
import type { ExerciseHistorySession } from "@/lib/exercise-history";
import { formatWeight, weightFromKg } from "@/lib/weight-units";
import { ProgressChart } from "./ExerciseProgress";
import { useWeightUnit } from "./WeightInput";

export function ExerciseHistoryButton({ exerciseId, name, sessions }: {
  exerciseId: string;
  name: string;
  sessions: ExerciseHistorySession[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [unit] = useWeightUnit(exerciseId);
  if (!sessions.length) return null;
  const points = [...sessions].reverse().flatMap(session => {
    const weights = session.sets.flatMap(set => set.weight === null ? [] : [set.weight]);
    return weights.length ? [{ id: session.sessionId, date: session.date, value: weightFromKg(Math.max(...weights), unit) }] : [];
  });
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()}
      aria-label={`Ver historial de ${name}`} aria-haspopup="dialog"
      className="min-h-11 rounded-lg border border-[#2a2f37] px-3 text-xs font-semibold text-[#4ade80] hover:border-[#4ade80] focus-visible:outline-2 focus-visible:outline-[#4ade80]">
      Ver historial
    </button>
    <dialog ref={dialog} aria-labelledby={headingId}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-0 text-[#f1f3f4] backdrop:bg-black/70">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h2 id={headingId} className="text-lg font-bold">Historial del ejercicio</h2><p className="mt-1 text-sm text-[#9099a3]">{name}</p></div>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Cerrar historial"
            className="min-h-11 shrink-0 rounded-lg border border-[#2a2f37] px-3 text-sm hover:border-[#9099a3]">Cerrar</button>
        </div>
        <h3 className="font-semibold">Peso máximo por sesión ({unit})</h3>
        <p className="mb-3 mt-1 text-xs text-[#9099a3]">El mayor peso de las series completadas en cada entrenamiento anterior.</p>
        <ProgressChart key={unit} points={points} unit={unit} title="Peso máximo" />
        <h3 className="mb-3 mt-5 font-semibold">Registros anteriores · {sessions.length}</h3>
        <div className="space-y-3">
          {sessions.map(session => <section key={session.sessionId} className="rounded-xl border border-[#2a2f37] bg-[#0d0f12] p-3">
            <p className="text-sm font-semibold">{new Date(session.date).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</p>
            <p className="mb-2 text-xs text-[#9099a3]">{session.routineName}</p>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Series de {name} en esta sesión</caption>
              <thead className="text-xs text-[#9099a3]"><tr><th scope="col" className="py-1">Serie</th><th scope="col">Peso ({unit})</th><th scope="col">Reps</th></tr></thead>
              <tbody>{session.sets.map(set => <tr key={set.id} className="border-t border-[#2a2f37]"><td className="py-2">{set.setNumber}</td><td>{set.weight === null ? "Sin peso" : formatWeight(set.weight, unit)}</td><td>{set.reps ?? "—"}</td></tr>)}</tbody>
            </table>
          </section>)}
        </div>
      </div>
    </dialog>
  </>;
}
