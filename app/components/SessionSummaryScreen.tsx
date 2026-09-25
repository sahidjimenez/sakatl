"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { updateSessionNotesAction } from "@/lib/actions/routines";
import { summaryDuration, type SessionSummary } from "@/lib/session-summary";
import { createSessionShareImage } from "@/lib/session-share";

export function SessionSummaryScreen({ sessionId, summary, onFinish }: {
  sessionId: string;
  summary: SessionSummary;
  onFinish: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(summary.notes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    heading.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let cancelled = false;
    let url = "";
    createSessionShareImage(summary).then((blob) => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setPreview(url);
      setShareFile(new File([blob], "sakatl-entrenamiento.png", { type: "image/png" }));
    }).catch(() => { if (!cancelled) setImageError(true); });
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
      document.body.style.overflow = previous;
    };
  }, [summary]);

  async function share() {
    if (!shareFile || sharing) return;
    setSharing(true);
    try {
      if (navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title: "Mi entrenamiento en Sakatl" });
      } else {
        download();
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage("No se pudo compartir. Puedes descargar la imagen y subirla a Instagram.");
      }
    } finally { setSharing(false); }
  }

  function download() {
    const link = document.createElement("a");
    link.href = preview;
    link.download = "sakatl-entrenamiento.png";
    link.click();
  }

  const button = "min-h-12 rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50";
  return (
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="session-summary-title" onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href]');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }} className="fixed inset-0 z-[100] overflow-y-auto bg-[#0d0f12] text-[#f1f3f4]">
      <div className="mx-auto max-w-lg px-5 py-10">
        <div className="mb-6 flex items-center gap-2"><Image src="/icons/icon-192.png" alt="" width={44} height={44} /><span className="text-xl font-black tracking-widest">SAKATL</span></div>
        <p className="text-sm font-bold text-[#4ade80]">ENTRENAMIENTO COMPLETADO</p>
        <h1 ref={heading} tabIndex={-1} id="session-summary-title" className="mt-2 text-3xl font-extrabold outline-none">¡Cada sesión cuenta!</h1>
        <p className="mt-2 text-[#9099a3]">{summary.name} · {summary.routineName}</p>
        <dl className="my-7 grid grid-cols-2 gap-3">
          {[
            ["Volumen cargado", `${summary.volumeKg.toLocaleString("es-MX", { maximumFractionDigits: 1 })} kg`],
            ["Ejercicios realizados", String(summary.exercises)],
            ["Tiempo activo (min:seg)", summaryDuration(summary.activeSeconds)],
            ["Meta de la semana", `${summary.sessionsCount}/${summary.weeklyGoal}`],
          ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#2a2f37] bg-[#191e24] p-4"><dt className="text-xs text-[#9099a3]">{label}</dt><dd className="mt-2 text-2xl font-extrabold">{value}</dd></div>)}
        </dl>
        <p className="mb-3 text-xs text-[#9099a3]">Volumen = peso × repeticiones de los sets guardados.</p>
        <progress aria-label="Avance de la meta semanal" className="h-2 w-full accent-[#4ade80]" max={summary.weeklyGoal} value={Math.min(summary.sessionsCount, summary.weeklyGoal)} />
        <p className="mt-2 text-sm text-[#4ade80]">{summary.sessionsCount >= summary.weeklyGoal ? "¡Meta semanal alcanzada!" : `Faltan ${summary.weeklyGoal - summary.sessionsCount} entrenamientos para tu meta.`}</p>
        <div className="mt-7 flex flex-col gap-3">
          <button disabled={saving} onClick={onFinish} className={`${button} bg-[#22c55e] text-[#08150d]`}>Finalizar entrenamiento</button>
          <button onClick={() => setEditing(!editing)} aria-expanded={editing} aria-controls="session-comments" className={`${button} border border-[#2a2f37]`}>Agregar comentarios de la sesión</button>
        </div>
        {editing && <form id="session-comments" className="mt-4 flex flex-col gap-3" onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setMessage("");
          try {
            const data = new FormData();
            data.set("notes", notes);
            await updateSessionNotesAction(sessionId, data);
            setMessage("Comentarios guardados.");
            setEditing(false);
          } catch { setMessage("No se pudieron guardar los comentarios. Intenta de nuevo."); }
          finally { setSaving(false); }
        }}>
          <label htmlFor="summary-notes" className="text-sm">¿Cómo te sentiste? Tus comentarios son privados.</label>
          <textarea autoFocus id="summary-notes" maxLength={2000} rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="rounded-xl border border-[#2a2f37] bg-[#191e24] p-3" />
          <button disabled={saving} className={`${button} bg-[#22c55e] text-[#08150d]`}>{saving ? "Guardando…" : "Guardar comentarios"}</button>
        </form>}
        <section className="mt-9 border-t border-[#2a2f37] pt-6">
          <h2 className="text-lg font-bold">Comparte tu progreso</h2>
          <p className="mt-1 text-sm text-[#9099a3]">Tu tarjeta para historias de Instagram.</p>
          {preview && <Image unoptimized src={preview} alt="Tarjeta con tu nombre, estadísticas de entrenamiento y logo de Sakatl" width={1080} height={1920} className="mx-auto my-5 w-52 rounded-2xl border border-[#2a2f37]" />}
          {imageError && <p role="alert" className="my-3 text-sm">No se pudo crear la tarjeta en este navegador. Tu entrenamiento está guardado.</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button disabled={!shareFile || sharing} onClick={share} className={`${button} bg-[#f1f3f4] text-[#0d0f12]`}>{sharing ? "Compartiendo…" : "Compartir imagen"}</button>
            <button disabled={!shareFile} onClick={download} className={`${button} border border-[#2a2f37]`}>Descargar</button>
          </div>
          <p className="mt-3 text-xs text-[#9099a3]">Elige Instagram si aparece entre tus aplicaciones, o descarga la imagen para subirla.</p>
        </section>
        <p role="status" className="mt-4 text-sm text-[#4ade80]">{message}</p>
      </div>
    </div>
  );
}
