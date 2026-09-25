"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createSessionShareImage, SESSION_SHARE_STYLES, type SessionShareStyle } from "@/lib/session-share";
import type { SessionSummary } from "@/lib/session-summary";

export function ShareIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></svg>;
}

type Card = { url: string; file: File };

export function SessionShareModal({ summary, onClose }: { summary: SessionSummary; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SessionShareStyle>("original");
  const [cards, setCards] = useState<Partial<Record<SessionShareStyle, Card>>>({});
  const [failed, setFailed] = useState<SessionShareStyle[]>([]);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const selectedIndex = SESSION_SHARE_STYLES.findIndex((style) => style.id === selected);
  const card = cards[selected];

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => {
      element?.close();
      trigger?.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    for (const style of SESSION_SHARE_STYLES) {
      createSessionShareImage(summary, style.id).then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        const file = new File([blob], `sakatl-${style.id}.png`, { type: "image/png" });
        setCards((current) => ({ ...current, [style.id]: { url, file } }));
      }).catch(() => {
        if (!cancelled) setFailed((current) => [...current, style.id]);
      });
    }
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [summary, retry]);

  function select(index: number) {
    const style = SESSION_SHARE_STYLES[index];
    if (!style) return;
    setSelected(style.id);
    setMessage("");
    const item = carousel.current?.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "center" });
    item?.focus({ preventScroll: true });
  }

  function download() {
    if (!card) return;
    const link = document.createElement("a");
    link.href = card.url;
    link.download = card.file.name;
    link.click();
    setMessage("Imagen descargada. Ya puedes subirla a tu historia.");
  }

  async function share() {
    if (!card || sharing) return;
    setSharing(true);
    setMessage("");
    try {
      if (navigator.canShare?.({ files: [card.file] })) {
        await navigator.share({ files: [card.file], title: "Mi entrenamiento en Sakatl" });
      } else {
        download();
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage("No se pudo compartir. Descarga la tarjeta para subirla a Instagram.");
      }
    } finally { setSharing(false); }
  }

  return (
    <dialog ref={dialog} aria-labelledby="share-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[#2a2f37] bg-[#191e24] p-0 text-[#f1f3f4] backdrop:bg-black/80">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div><h2 id="share-title" className="text-xl font-extrabold">Tu tarjeta para compartir</h2><p className="mt-1 text-sm text-[#9099a3]">Desliza y elige tu estilo.</p></div>
          <button type="button" onClick={onClose} aria-label="Cerrar opciones para compartir" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#3a424c] text-xl">×</button>
        </div>
        <div ref={carousel} role="radiogroup" aria-label="Estilo de tarjeta" aria-orientation="horizontal" onKeyDown={(event) => {
          let next: number;
          if (event.key === "ArrowRight") next = (selectedIndex + 1) % SESSION_SHARE_STYLES.length;
          else if (event.key === "ArrowLeft") next = (selectedIndex + SESSION_SHARE_STYLES.length - 1) % SESSION_SHARE_STYLES.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = SESSION_SHARE_STYLES.length - 1;
          else return;
          event.preventDefault();
          select(next);
        }} className="-mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-1">
          {SESSION_SHARE_STYLES.map((style, index) => (
            <button key={style.id} type="button" role="radio" aria-checked={selected === style.id} tabIndex={selected === style.id ? 0 : -1} onClick={() => select(index)} className={`w-[min(70%,24dvh)] max-w-[240px] shrink-0 snap-center rounded-2xl border-2 p-2 text-left outline-offset-2 transition-colors ${selected === style.id ? "border-[#4ade80] bg-[#4ade80]/5" : "border-[#343d47]"}`}>
              <div className="relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: style.id === "black" ? "#e5e7eb" : "#343b44", backgroundImage: style.id === "original" ? undefined : "conic-gradient(#00000012 25%, transparent 0 50%, #00000012 0 75%, transparent 0)", backgroundSize: "16px 16px" }}>
                {cards[style.id] ? <Image unoptimized src={cards[style.id]!.url} alt={`Vista previa: ${style.label}`} width={1080} height={1920} className="h-full w-full" /> : <span className="p-3 text-center text-sm">{failed.includes(style.id) ? "No se pudo crear la tarjeta" : "Preparando tarjeta…"}</span>}
              </div>
              <span className="mt-3 flex items-center justify-between gap-2 px-1 pb-1 text-sm font-bold"><span>{index + 1}. {style.label}</span><span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected === style.id ? "border-[#4ade80] bg-[#4ade80] text-[#08150d]" : "border-[#687480]"}`}>{selected === style.id ? "✓" : ""}</span></span>
            </button>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <button type="button" disabled={selectedIndex === 0} onClick={() => select(selectedIndex - 1)} aria-label="Estilo anterior" className="h-11 w-11 rounded-full border border-[#3a424c] disabled:opacity-30">←</button>
          <span className="text-sm text-[#9099a3]">{selectedIndex + 1} / {SESSION_SHARE_STYLES.length}</span>
          <button type="button" disabled={selectedIndex === SESSION_SHARE_STYLES.length - 1} onClick={() => select(selectedIndex + 1)} aria-label="Siguiente estilo" className="h-11 w-11 rounded-full border border-[#3a424c] disabled:opacity-30">→</button>
        </div>
        {failed.includes(selected) && <button type="button" onClick={() => { setCards({}); setFailed([]); setRetry((value) => value + 1); }} className="mt-3 min-h-11 text-sm underline">Volver a crear las tarjetas</button>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" disabled={!card || sharing} onClick={share} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4ade80] px-3 py-3 text-sm font-bold text-[#08150d] disabled:opacity-50"><ShareIcon />{sharing ? "Compartiendo…" : "Compartir"}</button>
          <button type="button" disabled={!card || sharing} onClick={download} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#3a424c] px-3 py-3 text-sm font-bold disabled:opacity-50">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
            Descargar
          </button>
        </div>
        {message && <div role="status" className="mt-3 text-sm text-[#a7afb8]">{message}</div>}
      </div>
    </dialog>
  );
}
