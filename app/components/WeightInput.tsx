"use client";

import { useState, useSyncExternalStore } from "react";
import { formatWeight, weightToKg, type WeightUnit } from "@/lib/weight-units";

const STORAGE_KEY = "sakatl:exercise-weight-unit:v2:";
const CHANGE_EVENT = "sakatl:weight-unit-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const fallbackUnits = new Map<string, WeightUnit>();
function getUnit(exerciseId: string): WeightUnit {
  const fallbackUnit = fallbackUnits.get(exerciseId) ?? "kg";
  try {
    const stored = localStorage.getItem(STORAGE_KEY + exerciseId);
    return stored === "lb" || stored === "kg" ? stored : fallbackUnit;
  } catch {
    return fallbackUnit;
  }
}

export function useWeightUnit(exerciseId: string) {
  const unit = useSyncExternalStore(subscribe, () => getUnit(exerciseId), () => "kg" as const);
  function setUnit(next: WeightUnit) {
    fallbackUnits.set(exerciseId, next);
    try { localStorage.setItem(STORAGE_KEY + exerciseId, next); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  return [unit, setUnit] as const;
}

export function WeightInput({ id, value, onChange, unit, onUnitChange, targetWeight, className = "" }: {
  id?: string;
  value: number | null;
  onChange: (weightKg: number | null) => void;
  unit: WeightUnit;
  onUnitChange?: (unit: WeightUnit) => void;
  targetWeight?: number | null;
  className?: string;
}) {
  // Keep exactly what the user typed; changing units only changes presentation.
  const [draft, setDraft] = useState<{ text: string; kg: number | null; unit: WeightUnit } | null>(null);
  const text = draft && draft.kg === value && draft.unit === unit
    ? draft.text : value == null ? "" : formatWeight(value, unit);
  return (
    <div className={`flex min-w-0 items-center rounded-[10px] border border-[#2a2f37] bg-[#1c2026] focus-within:ring-1 focus-within:ring-[#4ade80] ${className}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        aria-label={`Peso en ${unit}`}
        value={text}
        placeholder={targetWeight != null ? formatWeight(targetWeight, unit) : "Peso"}
        onChange={(event) => {
          const text = event.target.value;
          const kg = text === "" ? null : weightToKg(Number(text), unit);
          setDraft({ text, kg, unit });
          onChange(kg);
        }}
        className="min-h-[48px] w-full min-w-0 bg-transparent px-2 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none"
      />
      {onUnitChange ? <select
        aria-label="Unidad de peso"
        value={unit}
        onChange={(event) => onUnitChange(event.target.value as WeightUnit)}
        className="min-h-[48px] shrink-0 rounded-r-[10px] bg-[#1c2026] text-sm font-semibold text-[#f1f3f4] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
      >
        <option value="kg">kg</option>
        <option value="lb">lb</option>
      </select> : <span className="pr-3 text-sm text-[#9099a3]">{unit}</span>}
    </div>
  );
}

export function ExerciseWeightUnitSelector({ exerciseId }: { exerciseId: string }) {
  const [unit, setUnit] = useWeightUnit(exerciseId);
  return (
    <div role="group" aria-label="Unidad de peso del ejercicio" className="flex shrink-0 items-center gap-1">
      {(["kg", "lb"] as const).map((item) => (
        <button key={item} type="button" aria-pressed={unit === item} onClick={() => setUnit(item)}
          className={`min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold ${unit === item ? "bg-[#323a43] text-[#f1f3f4]" : "text-[#9099a3]"}`}>
          {item}
        </button>
      ))}
    </div>
  );
}
