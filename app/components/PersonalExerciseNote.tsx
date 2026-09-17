"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { saveExerciseNoteAction } from "@/lib/actions/exercise-notes";

export function PersonalExerciseNote({ exerciseId, name, note }: { exerciseId: string; name: string; note: string }) {
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
  return <div className="mb-3 rounded-xl border border-[#2a2f37] bg-[#0d0f12] p-3">
    <button type="button" aria-expanded={open} aria-controls={id} disabled={busy} onClick={() => { setOpen(!open); setMessage(""); }}
      className={`min-h-10 text-left text-sm font-semibold ${note ? "text-amber-300" : "text-[#9099a3]"}`}>
      {note ? "● Tienes una nota personal · Ver / editar" : "+ Agregar nota personal"}
      <span className="sr-only"> sobre {name}</span>
    </button>
    {note && !open && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#9099a3]">{note}</p>}
    {open && <form id={id} onSubmit={event => { event.preventDefault(); void save(String(new FormData(event.currentTarget).get("note") ?? "")); }} className="mt-2 space-y-3">
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
    </form>}
    {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    <p role="status" className="text-xs text-[#4ade80]">{message}</p>
  </div>;
}
