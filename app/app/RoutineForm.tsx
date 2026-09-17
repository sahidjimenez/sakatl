"use client";

import { useEffect, useId, useState } from "react";
import { CreateExerciseButton } from "@/app/components/CreateExerciseButton";
import { useRouter } from "next/navigation";
import { MUSCLE_GROUPS, muscleGroupLabel } from "@/lib/exercise-muscles";
import type { ExerciseSummary } from "@/lib/exercises";
import { createRoutineAction, updateRoutineAction } from "@/lib/actions/routines";
import type { BlockInput, RoutineInput } from "@/lib/routines";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

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

// Superset de RoutineInput: incluye exerciseName/exerciseImage por bloque para
// que consumidores sin base de datos (modo invitado) puedan mostrar el
// ejercicio sin volver a resolverlo contra el catálogo. Los campos extra no
// afectan a los server actions, que solo leen las claves que conocen.
export type RoutineFormSubmitInput = RoutineInput & {
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

type RoutineFormSaveResult = { error: string } | { ok: true; id: string };

export default function RoutineForm({
  mode,
  routineId,
  initial,
  onSave,
  resultHref,
}: {
  mode: "create" | "edit";
  routineId?: string;
  initial?: RoutineFormInitial;
  /** Por defecto llama a createRoutineAction/updateRoutineAction. Pasar para guardar en otro lado (p.ej. modo invitado). */
  onSave?: (input: RoutineFormSubmitInput) => Promise<RoutineFormSaveResult>;
  /** Por defecto `/app/rutinas/${id}`. */
  resultHref?: (id: string) => string;
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
      setError("Ponle un nombre a la rutina.");
      return;
    }
    if (blocks.length === 0) {
      setError("Agrega al menos un bloque.");
      return;
    }
    for (const block of blocks) {
      if (block.exercises.some((ex) => !ex.exerciseId)) {
        setError("Todos los ejercicios de cada bloque deben estar elegidos.");
        return;
      }
    }

    const input: RoutineFormSubmitInput = {
      name: name.trim(),
      description: description.trim() || null,
      scheduledDays,
      blocks: blocks.map((b) => ({
        type: b.type,
        exercises: b.exercises.map((ex) => ({
          exerciseId: ex.exerciseId!,
          exerciseName: ex.exerciseName,
          exerciseImage: ex.exerciseImage,
          plannedSets: ex.plannedSets,
          targetRepsMin: ex.targetRepsMin,
          targetRepsMax: ex.targetRepsMax,
          targetWeight: ex.targetWeight,
        })),
      })),
    };

    setSubmitting(true);
    const result = onSave
      ? await onSave(input)
      : mode === "edit" && routineId
        ? await updateRoutineAction(routineId, input)
        : await createRoutineAction(input);
    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push(resultHref ? resultHref(result.id) : `/app/rutinas/${result.id}`);
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
            ¿Qué días la entrenas? (opcional)
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

  const [muscleGroup, setMuscleGroup] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ q, muscleGroup, offset: String(offset), limit: "24" });
        const res = await fetch(`/api/exercises?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (controller.signal.aborted) return;
        setResults((previous) => offset === 0 ? data.items : [...previous, ...data.items]);
        setTotal(data.total);
      } catch {
        if (!controller.signal.aborted) setError("No se pudieron cargar los ejercicios.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q, muscleGroup, offset, open, retry]);

  function changeSearch(value: string, group: string) {
    setQ(value);
    setMuscleGroup(group);
    setOffset(0);
    setResults([]);
    setTotal(0);
    setLoading(true);
    setOpen(true);
  }

  return (
    <div className="relative rounded-xl border border-dashed border-[#2a2f37] p-4">
      <input
        value={q}
        onChange={(e) => changeSearch(e.target.value, muscleGroup)}
        onFocus={() => { if (!open) { setLoading(true); setOpen(true); } }}
        aria-label="Buscar ejercicio por nombre o músculo"
        placeholder="Buscar ejercicio o músculo…"
        className="min-h-[48px] w-full rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
      />
      <CreateExerciseButton forRoutine onCreated={onSelect} />
      <label className="mt-3 block text-sm text-[#9099a3]">
        Grupo muscular
        <select
          value={muscleGroup}
          onChange={(e) => changeSearch(q, e.target.value)}
          className="mt-1 min-h-[48px] w-full rounded-[10px] border border-[#2a2f37] bg-[#1c2026] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%239099a3%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-size-[20px_20px] bg-position-[right_14px_center] bg-no-repeat pl-3 pr-12 text-base text-[#f1f3f4]"
        >
          <option value="">Todos los grupos musculares</option>
          {MUSCLE_GROUPS.map((group) => <option key={group.label} value={group.label}>{group.label}</option>)}
        </select>
      </label>
      {!open && <button type="button" onClick={() => { setLoading(true); setOpen(true); }} className="mt-3 min-h-[44px] text-sm text-[#4ade80]">Explorar ejercicios</button>}
      {open && (
        <div aria-busy={loading} className="mt-3 max-h-96 overflow-y-auto rounded-[10px] border border-[#2a2f37] bg-[#1c2026] shadow-lg">
          {loading && <p className="p-3 text-xs text-[#9099a3]">Buscando…</p>}
          {error && <p role="alert" className="p-3 text-sm text-red-400">{error} <button type="button" onClick={() => { setLoading(true); setRetry((value) => value + 1); }}>Reintentar</button></p>}
          {!loading && !error && results.length === 0 && (
            <p className="p-3 text-xs text-[#9099a3]">Sin resultados.</p>
          )}
          {results.map((ex) => (
            <div key={ex.id} className="flex w-full items-center gap-3 px-3 py-2 hover:bg-[#23272e]">
              <ExerciseThumb
                exerciseId={ex.id}
                image={ex.image}
                name={ex.name}
                imgClassName="h-14 w-14 shrink-0 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  onSelect(ex);
                  setOpen(false);
                  setQ("");
                }}
                className="flex-1 text-left"
              >
                <span className="block text-sm font-semibold text-[#f1f3f4]">{ex.name}</span>
                <span className="block text-xs text-[#9099a3] capitalize">
                  {muscleGroupLabel(ex.muscle_group)} · {ex.equipment}
                </span>
              </button>
            </div>
          ))}
          {!error && total > 0 && <p aria-live="polite" className="px-3 py-2 text-xs text-[#9099a3]">{results.length} de {total} ejercicios</p>}
          {!error && results.length < total && <button type="button" disabled={loading} onClick={() => { setLoading(true); setOffset(results.length); }} className="min-h-[48px] w-full text-sm font-semibold text-[#4ade80] disabled:opacity-50">{loading ? "Cargando…" : "Ver más ejercicios"}</button>}

        </div>
      )}
    </div>
  );
}
