"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { updateRoutineScheduleAction } from "@/lib/actions/routines";
import type { RoutineScheduleCard } from "@/lib/routines";
import { RoutineDetailModal } from "./RoutineDetailModal";

const WEEKDAYS: Array<{ value: number; label: string; short: string }> = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
];

export function CalendarBoard({ routines }: { routines: RoutineScheduleCard[] }) {
  const [items, setItems] = useState(routines);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openRoutineId, setOpenRoutineId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeRoutine = items.find((r) => r.id === activeId) ?? null;

  function persist(routineId: string, scheduledDays: number[]) {
    setSavingIds((prev) => new Set(prev).add(routineId));
    startTransition(async () => {
      const result = await updateRoutineScheduleAction(routineId, scheduledDays);
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(routineId);
        return next;
      });
      if ("error" in result) setError(result.error);
    });
  }

  function addDay(routineId: string, day: number) {
    setError(null);
    const routine = items.find((r) => r.id === routineId);
    if (!routine || routine.scheduledDays.includes(day)) return;
    const next = [...routine.scheduledDays, day].sort((a, b) => a - b);
    setItems((prev) => prev.map((r) => (r.id === routineId ? { ...r, scheduledDays: next } : r)));
    persist(routineId, next);
  }

  function removeDay(routineId: string, day: number) {
    setError(null);
    const routine = items.find((r) => r.id === routineId);
    if (!routine) return;
    const next = routine.scheduledDays.filter((d) => d !== day);
    setItems((prev) => prev.map((r) => (r.id === routineId ? { ...r, scheduledDays: next } : r)));
    persist(routineId, next);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const day = Number(over.id);
    if (!Number.isFinite(day)) return;
    addDay(String(active.id), day);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
        Todavía no tienes rutinas para agendar.
      </p>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
      >
        {error && (
          <div className="rounded-[10px] border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#9099a3]">
            Arrastra una rutina al día que quieras entrenarla, o toca una para ver el detalle
          </span>
          <div className="flex flex-wrap gap-2">
            {items.map((r) => (
              <RoutineChip
                key={r.id}
                routine={r}
                saving={savingIds.has(r.id)}
                onOpen={() => setOpenRoutineId(r.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {WEEKDAYS.map((day) => (
            <DayColumn
              key={day.value}
              day={day}
              routines={items.filter((r) => r.scheduledDays.includes(day.value))}
              onRemove={(routineId) => removeDay(routineId, day.value)}
              onOpen={(routineId) => setOpenRoutineId(routineId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeRoutine ? (
            <div className="rounded-[10px] border border-[#22c55e] bg-[#22c55e] px-3 py-2 text-sm font-bold text-[#08150d] shadow-lg">
              {activeRoutine.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {openRoutineId && (
        <RoutineDetailModal routineId={openRoutineId} onClose={() => setOpenRoutineId(null)} />
      )}
    </>
  );
}

function RoutineChip({
  routine,
  saving,
  onOpen,
}: {
  routine: RoutineScheduleCard;
  saving: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: routine.id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={`flex cursor-grab touch-none flex-col items-start gap-2 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3 py-2.5 text-left active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      } ${saving ? "opacity-70" : ""}`}
    >
      <span className="max-w-[92px] truncate text-sm font-bold text-[#f1f3f4] sm:max-w-none">
        {routine.name}
      </span>
      {routine.exerciseThumbnails.length > 0 && (
        <div className="flex">
          {routine.exerciseThumbnails.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`/exercises/${img}`}
              alt=""
              className="h-7 w-7 -ml-2 rounded-full border-2 border-[#1c2026] object-cover first:ml-0"
            />
          ))}
        </div>
      )}
    </button>
  );
}

function DayColumn({
  day,
  routines,
  onRemove,
  onOpen,
}: {
  day: { value: number; label: string; short: string };
  routines: RoutineScheduleCard[];
  onRemove: (routineId: string) => void;
  onOpen: (routineId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: day.value });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[110px] flex-col gap-2 rounded-2xl border p-3 transition-colors sm:min-h-[140px] ${
        isOver ? "border-[#4ade80] bg-[#4ade80]/5" : "border-[#2a2f37] bg-[#1c2026]"
      }`}
    >
      <span className="text-xs font-bold tracking-wide text-[#9099a3] uppercase">{day.short}</span>
      <div className="flex flex-1 flex-col gap-1.5">
        {routines.length === 0 ? (
          <span className="text-xs text-[#6b7280]">Sin rutina</span>
        ) : (
          routines.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-1.5 rounded-lg bg-[#22c55e]/10 px-2 py-1.5 text-xs font-semibold text-[#4ade80]"
            >
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="min-w-0 flex-1 truncate text-left hover:underline"
              >
                {r.name}
              </button>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={`Quitar ${r.name} de ${day.label}`}
                className="shrink-0 text-[#9099a3] hover:text-[#f1f3f4]"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
