"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

const BLOCK_LABELS: Record<string, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

type RoutineDetail = {
  id: string;
  name: string;
  description: string | null;
  blocks: Array<{
    id: string;
    type: string;
    exercises: Array<{
      id: string;
      exerciseId: string;
      exercise: { name: string; image: string | null } | null;
      plannedSets: number;
      targetRepsMin: number | null;
      targetRepsMax: number | null;
      targetWeight: number | null;
    }>;
  }>;
};

export function RoutineDetailModal({
  routineId,
  onClose,
}: {
  routineId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<RoutineDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/routines/${routineId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("No se pudo cargar."))))
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar la rutina.");
      });
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <p className="text-[#9099a3]">{error}</p>
        ) : !detail ? (
          <p className="text-[#9099a3]">Cargando…</p>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#f1f3f4]">{detail.name}</h2>
                {detail.description && (
                  <p className="mt-1 text-sm text-[#9099a3]">{detail.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-[#2a2f37] px-3 py-1 text-sm text-[#9099a3] hover:text-[#f1f3f4]"
              >
                Cerrar
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {detail.blocks.map((block, i) => (
                <div key={block.id} className="rounded-xl border border-[#23272e] bg-[#0d0f12] p-4">
                  <p className="mb-3 text-xs font-bold tracking-wide text-[#4ade80] uppercase">
                    Bloque {i + 1} · {BLOCK_LABELS[block.type] ?? block.type}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {block.exercises.map((ex) => (
                      <div key={ex.id} className="flex items-center gap-3">
                        {ex.exercise?.image && (
                          <ExerciseThumb
                            exerciseId={ex.exerciseId}
                            image={ex.exercise.image}
                            name={ex.exercise.name}
                            imgClassName="h-11 w-11 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#f1f3f4]">
                            {ex.exercise?.name ?? ex.exerciseId}
                          </p>
                          <p className="text-xs text-[#9099a3]">
                            {ex.plannedSets} series
                            {(ex.targetRepsMin || ex.targetRepsMax) &&
                              ` · ${ex.targetRepsMin ?? "?"}-${ex.targetRepsMax ?? "?"} reps`}
                            {ex.targetWeight != null && ` · ${ex.targetWeight} kg`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`/app/rutinas/${detail.id}`}
              className="mt-4 inline-block text-sm font-semibold text-[#4ade80] hover:underline"
            >
              Ver página completa →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
