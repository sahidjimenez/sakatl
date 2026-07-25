"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseSummary } from "@/lib/exercises";
import { createRoutineAction, updateRoutineAction } from "@/lib/actions/routines";
import type { BlockInput, RoutineInput } from "@/lib/routines";

type BlockType = BlockInput["type"];

const BLOCK_LABELS: Record<BlockType, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

const BLOCK_EXERCISE_COUNT: Record<BlockType, number> = {
  single: 1,
  bi_series: 2,
  tri_series: 3,
};

const WEEKDAYS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

type ExerciseSlot = {
  exerciseId: string | null;
  exerciseName: string | null;
  exerciseImage: string | null;
  plannedSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeight: number | null;
};

type FormBlock = {
  key: string;
  type: BlockType;
  exercises: ExerciseSlot[];
};

function emptySlot(): ExerciseSlot {
  return {
    exerciseId: null,
    exerciseName: null,
    exerciseImage: null,
    plannedSets: 3,
    targetRepsMin: null,
    targetRepsMax: null,
    targetWeight: null,
  };
}

function newBlock(type: BlockType): FormBlock {
  return {
    key: crypto.randomUUID(),
    type,
    exercises: Array.from({ length: BLOCK_EXERCISE_COUNT[type] }, emptySlot),
  };
}

export type RoutineFormInitial = {
  name: string;
  description: string | null;
  scheduledDays: number[];
  blocks: Array<{
    type: BlockType;
    exercises: Array<{
      exerciseId: string;
      exerciseName: string | null;
      exerciseImage: string | null;
      plannedSets: number;
      targetRepsMin: number | null;
      targetRepsMax: number | null;
      targetWeight: number | null;
    }>;
  }>;
};

export default function RoutineForm({
  mode,
  routineId,
  initial,
}: {
  mode: "create" | "edit";
  routineId?: string;
  initial?: RoutineFormInitial;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [scheduledDays, setScheduledDays] = useState<number[]>(initial?.scheduledDays ?? []);
  const [blocks, setBlocks] = useState<FormBlock[]>(
    initial?.blocks.map((b) => ({
      key: crypto.randomUUID(),
      type: b.type,
      exercises: b.exercises.map((e) => ({ ...e })),
    })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleDay(day: number) {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, newBlock(type)]);
  }

  function removeBlock(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function updateSlot(blockKey: string, slotIndex: number, patch: Partial<ExerciseSlot>) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.key !== blockKey
          ? b
          : {
              ...b,
              exercises: b.exercises.map((ex, i) => (i === slotIndex ? { ...ex, ...patch } : ex)),
            },
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ponele un nombre a la rutina.");
      return;
    }
    if (blocks.length === 0) {
      setError("Agregá al menos un bloque.");
      return;
    }
    for (const block of blocks) {
      if (block.exercises.some((ex) => !ex.exerciseId)) {
        setError("Todos los ejercicios de cada bloque deben estar elegidos.");
        return;
      }
    }

    const input: RoutineInput = {
      name: name.trim(),
      description: description.trim() || null,
      scheduledDays,
      blocks: blocks.map((b) => ({
        type: b.type,
        exercises: b.exercises.map((ex) => ({
          exerciseId: ex.exerciseId!,
          plannedSets: ex.plannedSets,
          targetRepsMin: ex.targetRepsMin,
          targetRepsMax: ex.targetRepsMax,
          targetWeight: ex.targetWeight,
        })),
      })),
    };

    setSubmitting(true);
    const result =
      mode === "edit" && routineId
        ? await updateRoutineAction(routineId, input)
        : await createRoutineAction(input);
    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(`/app/rutinas/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#9099a3]">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Empuje / Tirón / Pierna"
            className="min-h-[48px] w-full rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#9099a3]">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Notas sobre la rutina…"
            className="w-full rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 py-3 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#9099a3]">
            ¿Qué días la entrenás? (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`min-h-[44px] min-w-[52px] rounded-[10px] border px-3 text-sm font-bold ${
                  scheduledDays.includes(day.value)
                    ? "border-[#22c55e] bg-[#22c55e] text-[#08150d]"
                    : "border-[#2a2f37] bg-[#1c2026] text-[#f1f3f4] hover:border-[#4ade80]"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block) => (
          <div key={block.key} className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-[#4ade80]">{BLOCK_LABELS[block.type]}</span>
              <button
                type="button"
                onClick={() => removeBlock(block.key)}
                className="text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
              >
                Quitar bloque
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {block.exercises.map((slot, slotIndex) => (
                <ExerciseSlotEditor
                  key={slotIndex}
                  slot={slot}
                  onChange={(patch) => updateSlot(block.key, slotIndex, patch)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => addBlock("single")}
            className="rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
          >
            + Ejercicio suelto
          </button>
          <button
            type="button"
            onClick={() => addBlock("bi_series")}
            className="rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
          >
            + Bi-serie
          </button>
          <button
            type="button"
            onClick={() => addBlock("tri_series")}
            className="rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
          >
            + Tri-serie
          </button>
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-[#f87171]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-[10px] bg-[#22c55e] px-6 py-3 text-sm font-bold text-[#08150d] disabled:opacity-50"
      >
        {submitting ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Crear rutina"}
      </button>
    </form>
  );
}

function ExerciseSlotEditor({
  slot,
  onChange,
}: {
  slot: ExerciseSlot;
  onChange: (patch: Partial<ExerciseSlot>) => void;
}) {
  const inputId = useId();

  if (!slot.exerciseId) {
    return (
      <ExercisePicker
        onSelect={(ex) =>
          onChange({ exerciseId: ex.id, exerciseName: ex.name, exerciseImage: ex.image })
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#23272e] bg-[#0d0f12] p-4">
      <div className="mb-3 flex items-center gap-3">
        {slot.exerciseImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/exercises/${slot.exerciseImage}`}
            alt={slot.exerciseName ?? ""}
            className="h-12 w-12 rounded-lg object-cover"
          />
        )}
        <span className="flex-1 text-sm font-semibold text-[#f1f3f4]">{slot.exerciseName}</span>
        <button
          type="button"
          onClick={() => onChange({ exerciseId: null, exerciseName: null, exerciseImage: null })}
          className="text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
        >
          Cambiar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#9099a3]" htmlFor={`${inputId}-sets`}>
          Series
          <input
            id={`${inputId}-sets`}
            type="number"
            min={1}
            max={20}
            value={slot.plannedSets}
            onChange={(e) => onChange({ plannedSets: Number(e.target.value) || 1 })}
            className="min-h-[48px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#9099a3]" htmlFor={`${inputId}-repsmin`}>
          Reps min
          <input
            id={`${inputId}-repsmin`}
            type="number"
            min={1}
            value={slot.targetRepsMin ?? ""}
            onChange={(e) =>
              onChange({ targetRepsMin: e.target.value ? Number(e.target.value) : null })
            }
            className="min-h-[48px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#9099a3]" htmlFor={`${inputId}-repsmax`}>
          Reps max
          <input
            id={`${inputId}-repsmax`}
            type="number"
            min={1}
            value={slot.targetRepsMax ?? ""}
            onChange={(e) =>
              onChange({ targetRepsMax: e.target.value ? Number(e.target.value) : null })
            }
            className="min-h-[48px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#9099a3]" htmlFor={`${inputId}-weight`}>
          Peso (kg)
          <input
            id={`${inputId}-weight`}
            type="number"
            min={0}
            step="0.5"
            value={slot.targetWeight ?? ""}
            onChange={(e) =>
              onChange({ targetWeight: e.target.value ? Number(e.target.value) : null })
            }
            className="min-h-[48px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4]"
          />
        </label>
      </div>
    </div>
  );
}

function ExercisePicker({ onSelect }: { onSelect: (ex: ExerciseSummary) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ExerciseSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function search(value: string) {
    setQ(value);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/exercises?q=${encodeURIComponent(value)}&limit=6`);
    const data = await res.json();
    setResults(data.items);
    setOpen(true);
    setLoading(false);
  }

  return (
    <div className="relative rounded-xl border border-dashed border-[#2a2f37] p-4">
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        onFocus={() => q && setOpen(true)}
        placeholder="Buscar ejercicio…"
        className="min-h-[48px] w-full rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
      />
      {open && (
        <div className="absolute inset-x-4 top-[calc(100%-4px)] z-10 max-h-64 overflow-y-auto rounded-[10px] border border-[#2a2f37] bg-[#1c2026] shadow-lg">
          {loading && <p className="p-3 text-xs text-[#9099a3]">Buscando…</p>}
          {!loading && results.length === 0 && (
            <p className="p-3 text-xs text-[#9099a3]">Sin resultados.</p>
          )}
          {results.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                onSelect(ex);
                setOpen(false);
                setQ("");
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#23272e]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/exercises/${ex.image}`}
                alt={ex.name}
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="text-sm text-[#f1f3f4]">{ex.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
