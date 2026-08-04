"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeStats } from "@/lib/home-stats";

export const STAT_ITEMS: { label: string; key: keyof HomeStats; spot?: boolean }[] = [
  { label: "Personas siguiendo rutinas hoy", key: "activeToday", spot: true },
  { label: "Rutinas creadas por usuarios", key: "routinesCount" },
  { label: "Series registradas esta semana", key: "setsThisWeek" },
  { label: "Bloques por rutina, en promedio", key: "avgBlocksPerRoutine" },
];

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

// Contador liviano (sin libreria externa): arranca en 0 y sube al valor real
// cuando la seccion entra en pantalla. 0 es el mismo valor en server y en el
// primer render del cliente, asi que no hay riesgo de mismatch de hidratacion.
function StatCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (played.current || !entries.some((e) => e.isIntersecting)) return;
        played.current = true;
        observer.disconnect();
        const duration = 900;
        const start = performance.now();
        function tick(now: number) {
          const t = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(easeOutCubic(t) * value));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={spanRef} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString("es")}
    </span>
  );
}

export function StatsRow({ stats }: { stats: HomeStats }) {
  return (
    <div className="index">
      {STAT_ITEMS.map((item) => (
        <div className="ix" key={item.key}>
          <span className="ix-label">{item.label}</span>
          <span className={item.spot ? "ix-num spot" : "ix-num"}>
            <StatCounter value={stats[item.key]} />
          </span>
        </div>
      ))}
    </div>
  );
}
