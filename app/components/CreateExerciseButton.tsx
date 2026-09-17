"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NewExerciseForm from "@/app/ejercicios/nuevo/NewExerciseForm";
import type { ExerciseSummary } from "@/lib/exercises";

export function CreateExerciseButton({ onCreated, forRoutine = false }: {
  onCreated?: (exercise: ExerciseSummary) => void;
  forRoutine?: boolean;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);

  if (!isLoaded || !isSignedIn) return null;

  return <>
    <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#4ade80]/40 px-4 text-sm font-semibold text-[#4ade80]">
      + Crear ejercicio nuevo
    </button>
    {open && <CreateExerciseDialog forRoutine={forRoutine} onClose={() => setOpen(false)} onCreated={(exercise) => {
      setOpen(false);
      onCreated?.(exercise);
    }} />}
  </>;
}

function CreateExerciseDialog({ onClose, onCreated, forRoutine }: {
  onClose: () => void;
  onCreated: (exercise: ExerciseSummary) => void;
  forRoutine: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#0d0f12] p-0 text-[#f1f3f4] shadow-2xl backdrop:bg-black/75"
    >
      <div className="p-5 sm:p-7">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-extrabold">Crear ejercicio</h2>
            <p className="mt-2 text-sm text-[#9099a3]">{forRoutine
              ? "Al publicarlo, se agregará a este espacio de tu rutina y estará disponible en la biblioteca."
              : "Comparte un ejercicio con toda la comunidad."}</p>
          </div>
          <button type="button" disabled={saving} onClick={onClose} aria-label="Cerrar creación de ejercicio" className="min-h-11 shrink-0 rounded-lg border border-[#2a2f37] px-3 text-sm disabled:opacity-40">Cerrar</button>
        </header>
        <NewExerciseForm onCreated={onCreated} onSavingChange={setSaving} />
      </div>
    </dialog>,
    document.body,
  );
}
