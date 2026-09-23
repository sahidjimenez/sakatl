"use client";

import { useState } from "react";
import { ExerciseThumb } from "./ExerciseThumb";
import { progressPeriods, progressStart, type ExerciseProgress, type ProgressPeriod } from "@/lib/exercise-progress";

const number = (value: number) => value.toLocaleString("es-MX", { maximumFractionDigits: 1 });
const dateLabel = (date: string) => new Date(date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const panel = "rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 sm:p-6";

function ProgressChart({ points, unit, title, average }: {
  points: { id: string; date: string; value: number }[];
  unit: string;
  title: string;
  average?: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  if (!points.length) return <p className="py-12 text-center text-sm text-[#9099a3]">No hay pesos registrados en este periodo.</p>;
  const maximum = points.reduce((max, point) => Math.max(max, point.value), 1) * 1.1;
  const first = Date.parse(points[0].date);
  const span = Date.parse(points[points.length - 1].date) - first;
  const x = (date: string) => span ? 62 + (Date.parse(date) - first) / span * 512 : 318;
  const y = (value: number) => 190 - value / maximum * 166;
  const selected = points.find((point) => point.id === active);
  return (
    <div>
      <p aria-live="polite" className="min-h-6 text-xs text-[#9099a3]">
        {selected ? `${dateLabel(selected.date)} · ${number(selected.value)} ${unit}` : "Toca un punto para ver la sesión"}
      </p>
      <svg viewBox="0 0 600 230" className="w-full" role="group" aria-label={`${title} por sesión en ${unit}`}>
        {[0, maximum / 2, maximum].map((tick) => <g key={tick}>
          <line x1="62" x2="574" y1={y(tick)} y2={y(tick)} stroke="#2a2f37" />
          <text x="54" y={y(tick) + 4} textAnchor="end" fill="#9099a3" fontSize="12">{number(tick)}</text>
        </g>)}
        {average !== undefined && <line x1="62" x2="574" y1={y(average)} y2={y(average)} stroke="#9099a3" strokeDasharray="6 6"><title>{`Promedio: ${number(average)} ${unit}`}</title></line>}
        <polyline points={points.map((point) => `${x(point.date)},${y(point.value)}`).join(" ")} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((point) => <g key={point.id}>
          <circle cx={x(point.date)} cy={y(point.value)} r={active === point.id ? 6 : 4} fill={active === point.id ? "#4ade80" : "#1c2026"} stroke="#4ade80" strokeWidth="2.5" />
          <circle cx={x(point.date)} cy={y(point.value)} r="12" fill="transparent" role="button" tabIndex={0}
            aria-label={`${dateLabel(point.date)}: ${number(point.value)} ${unit}`}
            className="cursor-pointer outline-none focus:stroke-[#f1f3f4]"
            onFocus={() => setActive(point.id)} onPointerEnter={() => setActive(point.id)} onClick={() => setActive(point.id)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActive(point.id); } }}>
            <title>{`${dateLabel(point.date)}: ${number(point.value)} ${unit}`}</title>
          </circle>
        </g>)}
        <text x="62" y="220" fill="#9099a3" fontSize="12">{dateLabel(points[0].date)}</text>
        {points.length > 1 && <text x="574" y="220" textAnchor="end" fill="#9099a3" fontSize="12">{dateLabel(points[points.length - 1].date)}</text>}
      </svg>
    </div>
  );
}

export function ExerciseProgressSection({ exercises, now }: { exercises: ExerciseProgress[]; now: string }) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.exerciseId ?? "");
  const [period, setPeriod] = useState<ProgressPeriod>("6M");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const exercise = exercises.find((item) => item.exerciseId === exerciseId) ?? exercises[0];
  const start = progressStart(period, now);
  const sessions = exercise?.sessions.filter((session) => (!start || session.date >= start) && session.date <= now) ?? [];
  const factor = unit === "kg" ? 1 : 2.2046226218;
  const weights = sessions.flatMap((session) => session.maxWeight === null ? [] : [{ id: session.sessionId, date: session.date, value: session.maxWeight * factor }]);
  const volumes = sessions.map((session) => ({ id: session.sessionId, date: session.date, value: session.volume * factor }));
  const total = volumes.reduce((sum, point) => sum + point.value, 0);
  const pr = exercise?.sessions.reduce<number | null>((best, session) => session.maxWeight === null ? best : Math.max(best ?? 0, session.maxWeight), null) ?? null;
  return (
    <section aria-labelledby="exercise-progress-heading" className="space-y-4">
      <div><h2 id="exercise-progress-heading" className="text-xl font-extrabold">Estadísticas por ejercicio</h2><p className="mt-1 text-sm text-[#9099a3]">Tus récords personales y tu avance en cada sesión.</p></div>
      {!exercise ? <p className={`${panel} text-center text-sm text-[#9099a3]`}>Todavía no tienes series registradas. Completa series durante un entrenamiento para ver tu avance aquí.</p> : <>
        <div className={`${panel} flex items-center gap-4`}>
          {exercise.image && <ExerciseThumb exerciseId={exercise.exerciseId} image={exercise.image} name={exercise.name} />}
          <div className="min-w-0 flex-1"><label htmlFor="progress-exercise" className="mb-1 block text-xs text-[#9099a3]">Ejercicio</label>
            <select id="progress-exercise" value={exercise.exerciseId} onChange={(event) => setExerciseId(event.target.value)} className="w-full rounded-lg bg-[#1c2026] py-2 text-base font-semibold text-[#f1f3f4] outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#4ade80]">
              {exercises.map((item) => <option key={item.exerciseId} value={item.exerciseId}>{item.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Periodo" className="flex rounded-xl bg-[#1c2026] p-1">
            {progressPeriods.map((item) => <button key={item} type="button" aria-pressed={period === item} onClick={() => setPeriod(item)} className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${period === item ? "bg-[#323a43] text-[#f1f3f4]" : "text-[#9099a3]"}`}>{item}</button>)}
          </div>
          <div role="group" aria-label="Unidad de peso" className="flex rounded-xl bg-[#1c2026] p-1">
            {(["kg", "lb"] as const).map((item) => <button key={item} type="button" aria-pressed={unit === item} onClick={() => setUnit(item)} className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${unit === item ? "bg-[#323a43] text-[#f1f3f4]" : "text-[#9099a3]"}`}>{item === "kg" ? "Kg" : "Lb"}</button>)}
          </div>
        </div>
        <p className="text-sm text-[#9099a3]">{dateLabel(start ?? exercise.sessions[0].date)} – {dateLabel(now)} · {sessions.length} {sessions.length === 1 ? "sesión" : "sesiones"}</p>
        {!sessions.length ? <p className={`${panel} text-center text-sm text-[#9099a3]`}>No hay sesiones en este periodo. Prueba otro rango o selecciona Todo.</p> : <div className="grid gap-4 lg:grid-cols-2">
          <div className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-[#9099a3]">Peso máximo</h3>{pr !== null && <span className="rounded-full bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold text-[#4ade80]">PR histórico · {number(pr * factor)} {unit}</span>}</div>
            <p className="mt-4 text-3xl font-extrabold">{weights.length ? number(weights[weights.length - 1].value) : "—"} <span className="text-lg font-normal text-[#9099a3]">{unit}</span></p>
            <p className="mb-4 mt-1 text-xs text-[#9099a3]">Última sesión con peso registrado · máximo de sus series</p>
            <ProgressChart key={`${exerciseId}-${period}-${unit}-weight`} points={weights} unit={unit} title="Peso máximo" />
          </div>
          <div className={panel}>
            <h3 className="font-semibold text-[#9099a3]">Volumen total</h3>
            <p className="mt-4 text-3xl font-extrabold">{number(total)} <span className="text-lg font-normal text-[#9099a3]">{unit}</span></p>
            <p className="mb-4 mt-1 text-xs text-[#9099a3]">Promedio por sesión: {number(total / sessions.length)} {unit}</p>
            <ProgressChart key={`${exerciseId}-${period}-${unit}-volume`} points={volumes} unit={unit} title="Volumen" average={total / sessions.length} />
          </div>
        </div>}
        <p className="text-xs leading-relaxed text-[#9099a3]">Solo se cuentan series marcadas como completadas, agrupadas por sesión. Volumen = peso × repeticiones; las series sin peso o repeticiones no suman volumen. La línea discontinua indica el promedio. PR es el mayor peso registrado en todo tu historial.</p>
      </>}
    </section>
  );
}
