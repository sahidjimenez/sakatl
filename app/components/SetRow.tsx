"use client";

import { useState, useTransition } from "react";
import { startRestTimer } from "@/app/components/RestTimer";
import { SetMarkButton } from "@/app/components/SetMarkButton";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function SetRow({
  blockExerciseId,
  setNumber,
  weight,
  reps,
  completed,
  targetWeight,
  prevWeight,
  prevReps,
  prevCompleted,
  logSetAction,
  onUndo,
}: {
  blockExerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  targetWeight: number | null;
  prevWeight: number | null;
  prevReps: number | null;
  prevCompleted: boolean;
  logSetAction: (formData: FormData) => Promise<void>;
  onUndo: () => Promise<void> | void;
}) {
  const canQuickCopy =
    !completed &&
    prevCompleted &&
    weight == null &&
    reps == null &&
    (prevWeight != null || prevReps != null);

  const [manualMode, setManualMode] = useState(!canQuickCopy);
  const [optimisticDone, setOptimisticDone] = useState(false);
  const [optimisticValues, setOptimisticValues] = useState<{
    weight: number | null;
    reps: number | null;
  } | null>(null);
  const [, startTransition] = useTransition();

  const isDone = completed || optimisticDone;
  const displayWeight = optimisticValues?.weight ?? weight;
  const displayReps = optimisticValues?.reps ?? reps;

  if (!manualMode && !isDone) {
    return (
      <div className="flex flex-nowrap items-center gap-2 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3 sm:gap-3 sm:p-3.5">
        <span className="w-5 shrink-0 text-sm font-semibold text-[#9099a3] sm:w-14">
          <span className="hidden sm:inline">Set </span>
          {setNumber}
        </span>
        <button
          type="button"
          onClick={() => {
            startRestTimer();
            setOptimisticValues({ weight: prevWeight, reps: prevReps });
            setOptimisticDone(true);
            startTransition(async () => {
              const formData = new FormData();
              formData.set("blockExerciseId", blockExerciseId);
              formData.set("setNumber", String(setNumber));
              if (prevWeight != null) formData.set("weight", String(prevWeight));
              if (prevReps != null) formData.set("reps", String(prevReps));
              await logSetAction(formData);
            });
          }}
          className="min-h-[44px] flex-1 rounded-[10px] border border-dashed border-[#2a2f37] bg-[#1c2026] text-sm font-bold text-[#9099a3] transition-colors duration-75 hover:border-[#4ade80] hover:text-[#4ade80]"
        >
          Copiar todo del set anterior
          {prevWeight != null && prevReps != null ? ` (${prevWeight}kg × ${prevReps})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setManualMode(true)}
          aria-label="Llenar manualmente"
          title="Llenar manualmente"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#2a2f37] text-[#9099a3] hover:border-[#4ade80] hover:text-[#4ade80]"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <form
      action={logSetAction}
      className="flex flex-nowrap items-center gap-2 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3 sm:gap-3 sm:p-3.5"
    >
      <input type="hidden" name="blockExerciseId" value={blockExerciseId} />
      <input type="hidden" name="setNumber" value={setNumber} />
      <span className="w-5 shrink-0 text-sm font-semibold text-[#9099a3] sm:w-14">
        <span className="hidden sm:inline">Set </span>
        {setNumber}
      </span>
      <input
        type="number"
        name="weight"
        step="0.5"
        min={0}
        placeholder={targetWeight != null ? String(targetWeight) : "kg"}
        defaultValue={displayWeight ?? undefined}
        className="min-h-[48px] w-16 min-w-0 flex-1 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-2.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80] sm:w-24 sm:flex-none sm:px-3.5"
      />
      <input
        type="number"
        name="reps"
        min={0}
        placeholder="reps"
        defaultValue={displayReps ?? undefined}
        className="min-h-[48px] w-16 min-w-0 flex-1 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-2.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80] sm:w-24 sm:flex-none sm:px-3.5"
      />
      <SetMarkButton
        completed={isDone}
        onMark={() => setOptimisticDone(true)}
        onUndo={onUndo}
      />
    </form>
  );
}
