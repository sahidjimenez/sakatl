"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ExerciseVideoPreview } from "@/app/components/ExerciseVideoPreview";
import { parseExerciseVideo } from "@/lib/exercise-video";
import { ASSISTING_MUSCLES, MUSCLE_GROUPS, assistingMuscleLabel, canAssist } from "@/lib/exercise-muscles";
import type { ExerciseRecord, ExerciseSummary } from "@/lib/exercises";

const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3 text-[#f1f3f4] focus:outline-none focus:ring-2 focus:ring-[#4ade80]";

export default function NewExerciseForm({ onCreated, onSavingChange, initialExercise }: {
  initialExercise?: ExerciseRecord;
  onCreated?: (exercise: ExerciseSummary) => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const assistantsId = useId();
  const [muscleGroup, setMuscleGroup] = useState(initialExercise?.category ?? "");
  const [assistingMuscles, setAssistingMuscles] = useState<string[]>(initialExercise?.secondary_muscles.map(assistingMuscleLabel) ?? []);
  const [assistantsOpen, setAssistantsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialExercise?.video_url ?? "");
  const video = parseExerciseVideo(videoUrl);
  const [files, setFiles] = useState<File[]>([]);
  const [gif, setGif] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const conversion = useRef<AbortController | null>(null);

  useEffect(() => () => conversion.current?.abort(), []);
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  async function convert() {
    const controller = new AbortController();
    conversion.current = controller;
    setConverting(true); setError(""); setProgress(0); setGif(null); setPreview("");
    try {
      const { createExerciseGif } = await import("@/lib/exercise-gif");
      const result = await createExerciseGif(files, setProgress, controller.signal);
      if (!controller.signal.aborted) { setGif(result); setPreview(URL.createObjectURL(result)); }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "No se pudo convertir el archivo.");
    } finally { setConverting(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if ((!gif && !initialExercise && !video) || (files.length > 0 && !gif) || saving || converting) return;
    const fields = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.set("exercise", JSON.stringify({
      name: fields.get("name"), description: fields.get("description"),
      assistingMuscles, videoUrl: video?.url ?? videoUrl.trim(),
      muscleGroup: fields.get("muscleGroup"), equipment: fields.get("equipment"),
      steps: String(fields.get("steps")).split("\n").map((step) => step.trim()).filter(Boolean),
    }));
    if (gif) payload.set("gif", gif, "exercise.gif");
    setSaving(true); setError("");
    onSavingChange?.(true);
    try {
      const response = await fetch(initialExercise ? `/api/exercises/manage/${initialExercise.id}` : "/api/exercises/create", { method: initialExercise ? "PATCH" : "POST", body: payload });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo guardar el ejercicio.");
      setCreatedId(result.id);
      onCreated?.(result.exercise);
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo guardar el ejercicio."); }
    finally { setSaving(false); onSavingChange?.(false); }
  }

  if (createdId) return <section role="status" className="rounded-2xl border border-[#4ade80]/40 bg-[#1c2026] p-6">
    <h2 className="text-xl font-bold">{initialExercise ? "Cambios guardados" : "Tu ejercicio ya está en la biblioteca"}</h2>
    <p className="mt-3 text-[#9099a3]">Toda la comunidad puede encontrarlo y agregarlo a sus rutinas.</p>
    <Link className="mt-6 inline-block font-semibold text-[#4ade80]" href="/ejercicios">Ver biblioteca →</Link>
  </section>;

  return <form onSubmit={submit} className="space-y-6">
    <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
      <label className="block text-sm font-semibold">Nombre del ejercicio<input name="name" defaultValue={initialExercise?.name} required minLength={2} maxLength={120} placeholder="Ej. Sentadilla con banda" className={fieldClass} /></label>
      <label className="block text-sm font-semibold">Descripción<textarea name="description" defaultValue={initialExercise?.instructions.es} required minLength={10} maxLength={2000} rows={3} placeholder="Explica en qué consiste el ejercicio." className={fieldClass} /></label>
        <label className="block text-sm font-semibold">Grupo muscular<select name="muscleGroup" required value={muscleGroup} onChange={(event) => { setMuscleGroup(event.target.value); setAssistingMuscles(previous => previous.filter(group => canAssist(group, event.target.value))); setAssistantsOpen(false); }} className={fieldClass}><option value="" disabled>Selecciona un grupo</option>{MUSCLE_GROUPS.map((group) => <option key={group.label}>{group.label}</option>)}</select></label>

      <div>
        <p id={assistantsId} className="text-sm font-semibold">Músculos que asisten <span className="font-normal text-[#9099a3]">(opcional)</span></p>
        <button type="button" disabled={!muscleGroup} aria-labelledby={assistantsId} aria-expanded={assistantsOpen} aria-controls={`${assistantsId}-options`}
          onClick={() => setAssistantsOpen(open => !open)} className={`${fieldClass} flex items-center justify-between gap-2 text-left disabled:opacity-40`}>
          <span>{assistingMuscles.length ? assistingMuscles.join(", ") : "Selecciona uno o varios"}</span><span aria-hidden="true">⌄</span>
        </button>
        {!muscleGroup && <p className="mt-1 text-xs text-[#9099a3]">Primero selecciona el grupo muscular principal.</p>}
        {muscleGroup && assistantsOpen && <fieldset id={`${assistantsId}-options`} aria-labelledby={assistantsId} className="mt-2 grid max-h-64 gap-1 overflow-y-auto rounded-xl border border-[#2a2f37] bg-[#1c2026] p-3 sm:grid-cols-2">
          {ASSISTING_MUSCLES.filter(group => canAssist(group.label, muscleGroup)).map(group => (
            <label key={group.label} className="flex min-h-11 items-center gap-3 px-2 text-sm">
              <input type="checkbox" checked={assistingMuscles.includes(group.label)} onChange={event => setAssistingMuscles(previous => event.target.checked ? [...previous, group.label] : previous.filter(value => value !== group.label))} className="h-4 w-4 accent-[#4ade80]" />
              {group.label}
            </label>
          ))}
        </fieldset>}
      </div>
      <label className="block text-sm font-semibold">Equipo<input name="equipment" defaultValue={initialExercise?.equipment} required maxLength={80} placeholder="Ej. Mancuernas o sin equipo" className={fieldClass} /></label>
      <label className="block text-sm font-semibold">Cómo hacerlo<textarea name="steps" defaultValue={initialExercise?.instruction_steps.es.join("\n")} required maxLength={7500} rows={5} placeholder={"Colócate en la posición inicial.\nRealiza el movimiento.\nVuelve a la posición inicial."} className={fieldClass} /><span className="mt-1 block font-normal text-[#9099a3]">Un paso por línea, hasta 15 pasos de 500 caracteres.</span></label>
      {initialExercise?.gif_url && !preview && <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/exercises/${initialExercise.gif_url}`} alt={`GIF actual de ${initialExercise.name}`} className="mx-auto aspect-square w-full max-w-64 rounded-xl" />
        <p className="mt-2 text-sm text-[#9099a3]">Puedes conservar el GIF actual o generar uno nuevo.</p>
      </div>}
      <section className="space-y-4 rounded-2xl border border-dashed border-[#39424e] p-5">
        <label className="block font-semibold" htmlFor="exercise-files">Video o imágenes del ejercicio</label>
        <p id="media-help" className="text-sm leading-relaxed text-[#9099a3]">Un video de hasta 8 segundos y 50 MB (MP4, WebM o MOV compatible con tu navegador), o de 1 a 12 imágenes JPG, PNG o WebP de hasta 10 MB cada una. Se creará un GIF sin audio; una sola imagen será estática.</p>
        <input id="exercise-files" aria-describedby="media-help" type="file" multiple accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp" disabled={converting} onChange={(event) => { setFiles(Array.from(event.target.files ?? [])); setGif(null); setPreview(""); setError(""); }} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2a2f37] file:px-4 file:py-3 file:text-[#f1f3f4]" />
        {files.length > 1 && <ol className="space-y-1 text-sm text-[#9099a3]">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{index + 1}. {file.name}</span><button type="button" disabled={converting || index === 0} aria-label={`Mover ${file.name} antes`} onClick={() => { setFiles((previous) => { const next = [...previous]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; }); setGif(null); setPreview(""); }} className="rounded border border-[#39424e] px-3 py-2 disabled:opacity-30">↑</button></li>)}</ol>}
        <button type="button" disabled={!files.length || converting} onClick={convert} className="min-h-12 rounded-xl border border-[#4ade80] px-5 font-semibold text-[#4ade80] disabled:opacity-40">{converting ? `Convirtiendo… ${progress}%` : "Generar vista previa GIF"}</button>
        {converting && <button type="button" onClick={() => conversion.current?.abort()} className="ml-4 text-sm text-[#9099a3]">Cancelar conversión</button>}
        {converting && <progress aria-label="Conversión a GIF" value={progress} max={100} className="block w-full accent-[#4ade80]" />}
        {gif && preview && <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa del ejercicio convertido en GIF" className="mx-auto aspect-square w-full max-w-80 rounded-xl" />
          <p className="mt-2 text-center text-xs text-[#9099a3]">GIF listo · {(gif.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>}
      </section>
      <div className="space-y-3">
        <label className="block text-sm font-semibold">Enlace de video (opcional)
          <input type="url" name="videoUrl" value={videoUrl} maxLength={2048} onChange={event => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={fieldClass} />
        </label>
        <p className="text-xs text-[#9099a3]">Pega el enlace completo de un video público de YouTube, Instagram o TikTok. Puedes usarlo en lugar de subir archivos.</p>
        {videoUrl.trim() && !video && <p role="alert" className="text-sm text-amber-300">Usa el enlace completo del video; no un perfil ni un enlace acortado de TikTok.</p>}
        {video && <ExerciseVideoPreview url={video.url} />}
      </div>

      <label className="flex items-start gap-3 text-sm text-[#9099a3]"><input required defaultChecked={Boolean(initialExercise)} type="checkbox" className="mt-1 accent-[#4ade80]" />Tengo permiso para compartir este contenido y entiendo que será visible para toda la comunidad.</label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={(!gif && !initialExercise && !video) || (files.length > 0 && !gif) || converting || saving || Boolean(videoUrl.trim() && !video)} className="min-h-12 w-full rounded-xl bg-[#4ade80] px-5 font-bold text-[#0d0f12] disabled:opacity-40">{saving ? "Guardando ejercicio…" : initialExercise ? "Guardar cambios" : "Publicar ejercicio"}</button>
    </fieldset>
  </form>;
}
