"use client";

import { useEffect, useState } from "react";
import type { ExerciseDetail } from "@/lib/exercises";

export function ExerciseDetailModal({
  exerciseId,
  onClose,
}: {
  exerciseId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/exercises/${exerciseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDetail(data);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!detail ? (
          <p className="text-[#9099a3]">Cargando…</p>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#f1f3f4]">{detail.name}</h2>
                <p className="mt-1 text-sm text-[#9099a3] capitalize">
                  {detail.target} · {detail.equipment} · {detail.category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-[#2a2f37] px-3 py-1 text-sm text-[#9099a3] hover:text-[#f1f3f4]"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl bg-[#0d0f12]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/exercises/${detail.gif_url}`}
                alt={`Animación de ${detail.name}`}
                className="w-full"
              />
            </div>

            {detail.secondary_muscles.length > 0 && (
              <p className="mb-4 text-xs text-[#9099a3]">
                Músculos secundarios: {detail.secondary_muscles.join(", ")}
              </p>
            )}

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#f1f3f4]">
              {detail.instruction_steps_es.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="mt-4 text-xs text-[#6b7280]">{detail.attribution}</p>
          </>
        )}
      </div>
    </div>
  );
}

export function ExerciseThumb({
  exerciseId,
  image,
  name,
  imgClassName = "h-12 w-12 rounded-lg object-cover",
}: {
  exerciseId: string;
  image: string;
  name: string;
  imgClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver animación e información de ${name}`}
        className="shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/exercises/${image}`} alt={name} className={imgClassName} />
      </button>
      {open && <ExerciseDetailModal exerciseId={exerciseId} onClose={() => setOpen(false)} />}
    </>
  );
}
