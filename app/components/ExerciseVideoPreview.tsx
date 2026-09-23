import { parseExerciseVideo } from "@/lib/exercise-video";

export function ExerciseVideoPreview({ url }: { url: string }) {
  const video = parseExerciseVideo(url);
  if (!video) return null;
  return <div className="space-y-2 overflow-hidden rounded-xl border border-[#2a2f37] p-3">
    <iframe
      key={video.embedUrl}
      title={`Vista previa del video de ${video.provider}`}
      src={video.embedUrl}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      className={`w-full rounded-lg border-0 ${video.provider === "YouTube" ? "aspect-video min-h-[200px]" : "h-[460px]"}`}
    />
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-sm font-semibold text-[#4ade80]">Abrir en {video.provider} ↗</a>
    <p className="text-xs text-[#9099a3]">Si no aparece la vista previa, abre el enlace. Algunos videos privados o restringidos no se pueden mostrar aquí.</p>
  </div>;
}
