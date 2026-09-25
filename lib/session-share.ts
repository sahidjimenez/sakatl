import { summaryDuration, type SessionSummary } from "@/lib/session-summary";

export async function createSessionShareImage(summary: SessionSummary): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear la imagen.");
  const logo = new Image();
  logo.src = "/icons/icon-512.png";
  await logo.decode();
  ctx.fillStyle = "#0d0f12";
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = "#203b2d";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(1080, 0, 250 + i * 110, 0, Math.PI * 2);
    ctx.stroke();
  }
  const text = (value: string, x: number, y: number, size: number, color = "#f1f3f4", maxWidth = 888) => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.fillText(value, x, y, maxWidth);
  };
  ctx.drawImage(logo, 66, 150, 150, 150);
  text("SAKATL", 230, 245, 58);
  text("ENTRENAMIENTO COMPLETADO", 96, 410, 28, "#4ade80");
  text("HOY ME", 96, 535, 100);
  text("SUPERÉ.", 96, 650, 100, "#4ade80");
  text(summary.name, 96, 755, 42);
  text(summary.routineName, 96, 820, 32, "#a7afb8");
  const metrics = [
    [summary.volumeKg.toLocaleString("es-MX", { maximumFractionDigits: 1 }), "KG CARGADOS"],
    [String(summary.exercises), "EJERCICIOS"],
    [summaryDuration(summary.activeSeconds), "TIEMPO ACTIVO · MIN:SEG"],
    [`${summary.sessionsCount}/${summary.weeklyGoal}`, "META SEMANAL"],
  ];
  metrics.forEach(([value, label], index) => {
    const x = 96 + (index % 2) * 456;
    const y = 920 + Math.floor(index / 2) * 255;
    ctx.fillStyle = "#191e24";
    ctx.beginPath();
    ctx.roundRect(x, y, 432, 230, 28);
    ctx.fill();
    text(value, x + 28, y + 106, 66, "#f1f3f4", 376);
    text(label, x + 28, y + 166, 22, "#a7afb8", 376);
  });
  ctx.fillStyle = "#25312b";
  ctx.fillRect(96, 1510, 888, 12);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(96, 1510, 888 * Math.min(1, summary.sessionsCount / Math.max(1, summary.weeklyGoal)), 12);
  text("Cada sesión cuenta.", 96, 1625, 38, "#4ade80");
  text(new Date(summary.completedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }), 96, 1750, 27, "#a7afb8");
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen.")), "image/png"));
}
