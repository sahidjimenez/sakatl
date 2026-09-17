"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseRecord } from "@/lib/exercises";
import NewExerciseForm from "@/app/ejercicios/nuevo/NewExerciseForm";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

export function MyExercises({ exercises }: { exercises: ExerciseRecord[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<{ exercise: ExerciseRecord; mode: "edit" | "delete" } | null>(null);
  const [message, setMessage] = useState("");
  return <section className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
    <h2 className="text-base font-bold">Mis ejercicios creados</h2>
    <p className="mt-1 text-sm text-[#9099a3]">Administra los ejercicios que has compartido con la comunidad.</p>
    {exercises.length === 0 ? <p className="mt-4 text-sm text-[#9099a3]">Todavía no tienes ejercicios creados.</p> :
      <ul className="mt-4 space-y-3">{exercises.map(exercise => <li key={exercise.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2a2f37] bg-[#0d0f12] p-3">
        <ExerciseThumb exerciseId={exercise.id} image={exercise.image} name={exercise.name} />
        <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold">{exercise.name}</h3><p className="text-xs text-[#9099a3]">{exercise.category} · {exercise.equipment}</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setMessage(""); setSelected({ exercise, mode: "edit" }); }} aria-label={`Editar ${exercise.name}`} className="min-h-11 rounded-lg border border-[#2a2f37] px-3 text-sm text-[#4ade80]">Editar</button>
          <button type="button" onClick={() => { setMessage(""); setSelected({ exercise, mode: "delete" }); }} aria-label={`Eliminar ${exercise.name}`} className="min-h-11 rounded-lg border border-[#2a2f37] px-3 text-sm text-red-400">Eliminar</button>
        </div>
      </li>)}</ul>}
    <p role="status" className="mt-3 text-sm text-[#4ade80]">{message}</p>
    {selected && <ExerciseManagementDialog exercise={selected.exercise} mode={selected.mode} onClose={() => setSelected(null)} onSaved={() => {
      setMessage(selected.mode === "edit" ? "Ejercicio actualizado." : "Ejercicio eliminado de la biblioteca.");
      setSelected(null);
      router.refresh();
    }} />}
  </section>;
}

function ExerciseManagementDialog({ exercise, mode, onClose, onSaved }: {
  exercise: ExerciseRecord; mode: "edit" | "delete"; onClose: () => void; onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = ref.current!;
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
  async function remove() {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/exercises/manage/${exercise.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo eliminar el ejercicio.");
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo eliminar el ejercicio."); }
    finally { setSaving(false); }
  }
  return <dialog ref={ref} aria-labelledby={titleId}
    onCancel={event => { if (event.target !== event.currentTarget) return; event.preventDefault(); if (!saving) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !saving) onClose(); }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#0d0f12] p-0 text-[#f1f3f4] shadow-2xl backdrop:bg-black/75">
    <div className="p-5 sm:p-7">
      <header className="mb-5 flex items-start justify-between gap-4"><h2 id={titleId} className="text-xl font-bold">{mode === "edit" ? "Editar ejercicio" : "Eliminar ejercicio"}</h2><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-lg border border-[#2a2f37] px-3 text-sm disabled:opacity-40">Cerrar</button></header>
      {mode === "edit" ? <NewExerciseForm initialExercise={exercise} onCreated={onSaved} onSavingChange={setSaving} /> : <>
        <p>¿Eliminar «{exercise.name}»?</p>
        <p className="mt-3 text-sm text-[#9099a3]">Dejará de aparecer en tu perfil y en la biblioteca. Las rutinas y sesiones que ya lo usan conservarán el ejercicio y su historial.</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="min-h-11 rounded-xl border border-[#2a2f37] px-4 disabled:opacity-40">Cancelar</button><button type="button" disabled={saving} onClick={remove} className="min-h-11 rounded-xl bg-red-500 px-4 font-semibold text-white disabled:opacity-40">{saving ? "Eliminando…" : "Eliminar ejercicio"}</button></div>
      </>}
    </div>
  </dialog>;
}
