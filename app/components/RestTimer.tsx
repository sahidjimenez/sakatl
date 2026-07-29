"use client";

import { useEffect, useState } from "react";

const REST_TIMER_EVENT = "sakatl:rest-timer:start";
const DEFAULT_SECONDS = 90;

export function startRestTimer(seconds: number = DEFAULT_SECONDS) {
  window.dispatchEvent(new CustomEvent(REST_TIMER_EVENT, { detail: { seconds } }));
}

export function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    function handleStart(e: Event) {
      const seconds = (e as CustomEvent<{ seconds?: number }>).detail?.seconds ?? DEFAULT_SECONDS;
      setSecondsLeft(seconds);
    }
    window.addEventListener(REST_TIMER_EVENT, handleStart);
    return () => window.removeEventListener(REST_TIMER_EVENT, handleStart);
  }, []);

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0) return;
    const id = setTimeout(() => {
      setSecondsLeft((s) => (s == null ? null : Math.max(0, s - 1)));
    }, 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    try {
      const AudioCtx = window.AudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      osc.frequency.value = 880;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Autoplay de audio bloqueado o no soportado; el aviso visual sigue funcionando.
    }
    if (navigator.vibrate) navigator.vibrate(200);
    const timeout = setTimeout(() => setSecondsLeft(null), 1500);
    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  if (secondsLeft == null) return null;

  const isDone = secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-x-0 bottom-[76px] z-40 flex justify-center px-4 md:bottom-6">
      <div className="flex items-center gap-3 rounded-full border border-[#2a2f37] bg-[#1c2026]/95 px-5 py-2.5 shadow-lg backdrop-blur">
        <span className={`text-sm font-bold ${isDone ? "text-[#4ade80]" : "text-[#f1f3f4]"}`}>
          {isDone ? "¡Descanso terminado!" : `Descanso ${minutes}:${String(seconds).padStart(2, "0")}`}
        </span>
        <button
          type="button"
          onClick={() => setSecondsLeft(null)}
          className="text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
        >
          {isDone ? "Cerrar" : "Saltar"}
        </button>
      </div>
    </div>
  );
}
