"use client";

import { useId, useState, type ReactNode } from "react";
import Image from "next/image";
import { ExerciseDetailModal } from "@/app/components/ExerciseThumb";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CollapsibleBlock({
  label,
  exercises,
  progressLabel,
  defaultOpen = true,
  children,
}: {
  label: string;
  exercises: Array<{ id: string; exerciseId: string; name: string; image: string | null }>;
  progressLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const contentId = useId();
  const grouped = exercises.length > 1;

  return (
    <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
      <div className="flex items-center gap-3">
        {(!grouped || !open) && (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedExerciseId(exercise.exerciseId)}
                aria-label={`Ver animación e información de ${exercise.name}`}
                aria-haspopup="dialog"
                className="shrink-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#4ade80]"
              >
                {exercise.image ? (
                  <Image src={`/exercises/${exercise.image}`} alt="" width={56} height={56} unoptimized
                    className={`${grouped ? "h-11 w-11 sm:h-14 sm:w-14" : "h-14 w-14"} rounded-xl bg-white object-cover`} />
                ) : (
                  <span aria-hidden="true" className={`${grouped ? "h-11 w-11 sm:h-14 sm:w-14" : "h-14 w-14"} flex items-center justify-center rounded-xl bg-[#0d0f12] text-[#9099a3]`}>—</span>
                )}
              </button>
            ))}
          </div>
        )}
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 min-w-0 flex-1 items-center justify-end gap-2 text-left"
        aria-expanded={open}
        aria-controls={contentId}
        aria-label={`${open ? "Cerrar" : "Abrir"} registro de ${label}: ${exercises.map((exercise) => exercise.name).join(", ")}`}
      >
        {!grouped && <span className="min-w-0 flex-1 break-words text-sm font-semibold text-[#f1f3f4] sm:text-base">{exercises[0]?.name}</span>}
        {grouped && open && <span className="flex-1 text-xs font-semibold text-[#9099a3]">Cerrar registro</span>}
        <span className="flex items-center gap-2 shrink-0">
          {progressLabel && (
            <span className="rounded-full bg-[#0d0f12] px-2.5 py-1 text-[11px] font-bold text-[#9099a3]">
              {progressLabel}
            </span>
          )}
          <ChevronIcon
            className={`h-4 w-4 text-[#9099a3] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      </div>
      <div id={contentId} hidden={!open} className={open ? "mt-4 flex flex-col gap-5" : "hidden"}>{children}</div>
      {selectedExerciseId && <ExerciseDetailModal exerciseId={selectedExerciseId} onClose={() => setSelectedExerciseId(null)} />}
    </div>
  );
}
