"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExerciseNoteAction } from "@/lib/actions/exercise-notes";

export function PersonalExerciseNote({ exerciseId, name, note }: { exerciseId: string; name: string; note: string }) {
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
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
  }, [open]);
  async function save(value: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await saveExerciseNoteAction(exerciseId, value);
      if ("error" in result) { setError(result.error ?? "No se pudo guardar."); return; }
      setMessage(result.note ? "Nota guardada para tus próximos entrenamientos." : "Nota eliminada.");
      setOpen(false); router.refresh();
    } catch { setError("No se pudo guardar. Tu texto sigue aquí para intentarlo de nuevo."); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" aria-haspopup="dialog" aria-expanded={open} disabled={busy}
      aria-label={`${note ? "Ver o editar nota personal" : "Agregar nota personal"} sobre ${name}`}
      title={note ? "Tienes una nota personal" : "Agregar nota personal"}
      onClick={() => { setOpen(true); setMessage(""); setError(""); }}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#2a2f37] bg-[#1c2026] hover:border-[#4ade80] ${note ? "text-amber-300" : "text-[#9099a3]"}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M7 3.5h8.5L19 7v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
        <path d="M15 3.5V7a1 1 0 0 0 1 1h3M8.5 12h7M8.5 15.5h5" />
      </svg>
      {note && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-300" />}
    </button>
    {open && <dialog ref={dialogRef} aria-labelledby={`${id}-title`}
      onCancel={event => { event.preventDefault(); if (!busy) setOpen(false); }}
      onClick={event => { if (event.target === event.currentTarget && !busy) setOpen(false); }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#0d0f12] p-0 text-[#f1f3f4] shadow-2xl backdrop:bg-black/75">
      <div className="p-5 sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="text-lg font-bold">Nota personal</h2>
        <button type="button" disabled={busy} onClick={() => setOpen(false)} className="min-h-10 rounded-lg border border-[#2a2f37] px-3 text-sm">Cerrar</button>
      </header>
      <form onSubmit={event => { event.preventDefault(); void save(String(new FormData(event.currentTarget).get("note") ?? "")); }} className="space-y-3">
      <label className="block text-sm" htmlFor={`${id}-text`}>Tu nota privada sobre {name}</label>
      <textarea id={`${id}-text`} name="note" defaultValue={note} maxLength={2000} rows={4} disabled={busy}
        placeholder="Escribe lo que quieres recordar la próxima vez que hagas este ejercicio."
        className="w-full rounded-lg border border-[#2a2f37] bg-[#1c2026] p-3 text-sm focus:ring-1 focus:ring-[#4ade80]" />
      <p className="text-xs text-[#9099a3]">Solo tú puedes verla. Se muestra en cualquier rutina que incluya este ejercicio.</p>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} className="min-h-10 rounded-lg bg-[#22c55e] px-4 text-sm font-bold text-black disabled:opacity-40">{busy ? "Guardando…" : "Guardar nota"}</button>
        <button type="button" disabled={busy} onClick={() => setOpen(false)} className="min-h-10 rounded-lg border border-[#2a2f37] px-4 text-sm">Cancelar</button>
        {note && <button type="button" disabled={busy} onClick={() => save("")} className="min-h-10 px-3 text-sm text-red-400">Eliminar nota</button>}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
      </form>
      </div>
    </dialog>}
    <span role="status" className="sr-only">{message}</span>
  </>;
}
