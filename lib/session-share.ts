import { summaryDuration, type SessionSummary } from "@/lib/session-summary";

export type SessionShareStyle = "original" | "transparent" | "white" | "black";

export const SESSION_SHARE_STYLES: { id: SessionShareStyle; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "transparent", label: "Sin fondo" },
  { id: "white", label: "Todo en blanco" },
  { id: "black", label: "Todo en negro" },
];

export async function createSessionShareImage(summary: SessionSummary, style: SessionShareStyle = "original"): Promise<Blob> {
  const hasBackground = style === "original";
  const monochrome = style === "white" ? "#ffffff" : style === "black" ? "#000000" : null;
  const foreground = monochrome ?? "#f1f3f4";
  const accent = monochrome ?? "#4ade80";
  const muted = monochrome ?? "#a7afb8";
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear la imagen.");
  const logo = new Image();
  logo.src = "/icons/icon-512.png";
  await logo.decode();
  if (hasBackground) {
    ctx.fillStyle = "#0d0f12";
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.strokeStyle = "#203b2d";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(1080, 0, 250 + i * 110, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const text = (value: string, x: number, y: number, size: number, color = foreground, maxWidth = 888) => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.fillText(value, x, y, maxWidth);
  };
  if (hasBackground) {
    ctx.drawImage(logo, 66, 150, 150, 150);
  } else {
    // Extract the green brand mark from the opaque app icon, preserving edge alpha.
    const mark = document.createElement("canvas");
    mark.width = logo.naturalWidth;
    mark.height = logo.naturalHeight;
    const markContext = mark.getContext("2d");
    if (!markContext) throw new Error("No se pudo crear el logo.");
    markContext.drawImage(logo, 0, 0);
    const pixels = markContext.getImageData(0, 0, mark.width, mark.height);
    const color = style === "black" ? [0, 0, 0] : style === "white" ? [255, 255, 255] : [64, 222, 124];
    for (let i = 0; i < pixels.data.length; i += 4) {
      const alpha = Math.max(0, Math.min(1, (pixels.data[i + 1] - pixels.data[i] - 2) / 156));
      pixels.data[i] = color[0];
      pixels.data[i + 1] = color[1];
      pixels.data[i + 2] = color[2];
      pixels.data[i + 3] = Math.round(alpha * 255);
    }
    markContext.putImageData(pixels, 0, 0);
    ctx.drawImage(mark, 66, 150, 150, 150);
  }
  text("SAKATL", 230, 245, 58);
  text("ENTRENAMIENTO COMPLETADO", 96, 410, 28, accent);
  text("HOY ME", 96, 535, 100);
  text("SUPERÉ.", 96, 650, 100, accent);
  text(summary.name, 96, 755, 42);
  text(summary.routineName, 96, 820, 32, muted);
  const metrics = [
    [summary.volumeKg.toLocaleString("es-MX", { maximumFractionDigits: 1 }), "KG CARGADOS"],
    [String(summary.exercises), "EJERCICIOS"],
    [summaryDuration(summary.activeSeconds), "TIEMPO ACTIVO · MIN:SEG"],
    [`${summary.sessionsCount}/${summary.weeklyGoal}`, "META SEMANAL"],
  ];
  metrics.forEach(([value, label], index) => {
    const x = 96 + (index % 2) * 456;
    const y = 920 + Math.floor(index / 2) * 255;
    if (hasBackground) {
      ctx.fillStyle = "#191e24";
      ctx.beginPath();
      ctx.roundRect(x, y, 432, 230, 28);
      ctx.fill();
    }
    text(value, x + 28, y + 106, 66, foreground, 376);
    text(label, x + 28, y + 166, 22, muted, 376);
  });
  if (hasBackground) {
    ctx.fillStyle = "#25312b";
    ctx.fillRect(96, 1510, 888, 12);
  }
  ctx.fillStyle = accent;
  ctx.fillRect(96, 1510, 888 * Math.min(1, summary.sessionsCount / Math.max(1, summary.weeklyGoal)), 12);
  text("Cada sesión cuenta.", 96, 1625, 38, accent);
  text(new Date(summary.completedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }), 96, 1750, 27, muted);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen.")), "image/png"));
}
