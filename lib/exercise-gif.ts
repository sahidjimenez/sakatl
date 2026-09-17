import { MAX_GIF_BYTES } from "./exercise-input";

function waitForMedia(video: HTMLVideoElement, event: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(event, ready);
      video.removeEventListener("error", failed);
      signal.removeEventListener("abort", failed);
    };
    const ready = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error("No se pudo leer el video. Prueba con un archivo MP4 o WebM compatible.")); };
    const timer = setTimeout(failed, 15_000);
    video.addEventListener(event, ready, { once: true });
    video.addEventListener("error", failed, { once: true });
    signal.addEventListener("abort", failed, { once: true });
    if (signal.aborted) failed();
  });
}

export async function createExerciseGif(files: File[], onProgress: (value: number) => void, signal: AbortSignal): Promise<Blob> {
  const isVideo = files.length === 1 && ["video/mp4", "video/webm", "video/quicktime"].includes(files[0].type);
  if (!files.length || files.length > 12 || (!isVideo && files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)))) {
    throw new Error("Selecciona un video MP4, WebM o MOV, o entre 1 y 12 imágenes JPG, PNG o WebP.");
  }
  if (files.some((file) => file.size > (isVideo ? 50 : 10) * 1024 * 1024)) throw new Error("El límite es 50 MB por video o 10 MB por imagen.");
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const encoder = GIFEncoder();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 320;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Tu navegador no permite convertir estas imágenes.");
  async function frame(source: CanvasImageSource, width: number, height: number, delay: number) {
    signal.throwIfAborted();
    const scale = Math.min(320 / width, 320 / height);
    context!.fillStyle = "#0d0f12";
    context!.fillRect(0, 0, 320, 320);
    context!.drawImage(source, (320 - width * scale) / 2, (320 - height * scale) / 2, width * scale, height * scale);
    const rgba = context!.getImageData(0, 0, 320, 320).data;
    const palette = quantize(rgba, 128);
    encoder.writeFrame(applyPalette(rgba, palette), 320, 320, { palette, delay, repeat: 0 });
    if (encoder.bytes().length > MAX_GIF_BYTES) throw new Error("El GIF supera 3 MB. Usa un video más corto o menos imágenes.");
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (isVideo) {
    const video = document.createElement("video");
    const url = URL.createObjectURL(files[0]);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    try {
      const loaded = waitForMedia(video, "loadeddata", signal);
      video.src = url;
      await loaded;
      if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 8.1) throw new Error("Usa un video de hasta 8 segundos. Recorta el fragmento antes de seleccionarlo.");
      const count = Math.max(1, Math.ceil(video.duration * 8));
      for (let index = 0; index < count; index++) {
        signal.throwIfAborted();
        if (index > 0) {
          const seeked = waitForMedia(video, "seeked", signal);
          video.currentTime = index / 8;
          await seeked;
        }
        await frame(video, video.videoWidth, video.videoHeight, 125);
        onProgress(Math.round((index + 1) / count * 100));
      }
    } finally { video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url); }
  } else {
    for (let index = 0; index < files.length; index++) {
      signal.throwIfAborted();
      const bitmap = await createImageBitmap(files[index]);
      try { await frame(bitmap, bitmap.width, bitmap.height, 700); }
      finally { bitmap.close(); }
      onProgress(Math.round((index + 1) / files.length * 100));
    }
  }
  signal.throwIfAborted();
  encoder.finish();
  return new Blob([Uint8Array.from(encoder.bytes())], { type: "image/gif" });
}
