"use client";

import { useEffect, useId, useRef, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Guide = "safari" | "ios" | "android" | "desktop";

export function InstallAppButton() {
  const promptRef = useRef<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [address, setAddress] = useState("");
  const guideId = useId();

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => {
      const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
      setInstalled(displayMode.matches || standalone === true);
    };
    const frame = requestAnimationFrame(checkInstalled);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as InstallPromptEvent;
    };
    const onInstalled = () => {
      promptRef.current = null;
      setInstalled(true);
      setGuide(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener("change", checkInstalled);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", checkInstalled);
    };
  }, []);

  async function install() {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/i.test(ua) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const safari = /Version\/[\d.]+.*Safari/i.test(ua) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|GSA\/|FBAN|FBAV|Instagram/i.test(ua);
    setAddress(window.location.origin);
    if (ios) {
      setGuide(safari ? "ios" : "safari");
      return;
    }

    const fallback = /Android/i.test(ua) ? "android" : "desktop";
    const pending = promptRef.current;
    if (!pending) {
      setGuide(fallback);
      return;
    }
    promptRef.current = null;
    setBusy(true);
    setGuide(null);
    try {
      await pending.prompt();
      const { outcome } = await pending.userChoice;
      if (outcome === "dismissed") setGuide(fallback);
    } catch {
      setGuide(fallback);
    } finally {
      setBusy(false);
    }
  }

  if (installed) return null;

  return (
    <div className="install-app">
      <button
        type="button"
        className="btn btn-ghost install-app-button"
        onClick={install}
        disabled={busy}
        aria-expanded={guide !== null}
        aria-controls={guideId}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
        </svg>
        {busy ? "Abriendo instalación…" : "Descargar app"}
      </button>
      <div id={guideId} className="install-app-guide" hidden={!guide} aria-live="polite">
        {guide === "safari" && <>
          <h3>Abre Sakatl en Safari</h3>
          <p>Para descargar la app en tu iPhone o iPad, abre esta dirección en Safari y toca de nuevo «Descargar app».</p>
          <p className="install-app-address">{address}</p>
        </>}
        {guide === "ios" && <>
          <h3>Agrega Sakatl a tu pantalla de inicio</h3>
          <ol>
            <li>En Safari, abre el menú y toca <strong>Compartir</strong>.</li>
            <li>Elige <strong>Agregar a pantalla de inicio</strong> (o «Añadir a pantalla de inicio»).</li>
            <li>Si aparece, activa <strong>Abrir como app</strong> y toca <strong>Agregar</strong>.</li>
          </ol>
        </>}
        {guide === "android" && <>
          <h3>Instala Sakatl en tu Android</h3>
          <p>Abre el menú del navegador (⋮) y elige <strong>Instalar app</strong> o <strong>Agregar a pantalla de inicio</strong>.</p>
          <p>Si no aparece la opción, abre esta página en Chrome. Si ya la instalaste, busca Sakatl entre tus apps.</p>
        </>}
        {guide === "desktop" && <>
          <h3>Lleva Sakatl contigo</h3>
          <p>Abre esta página en tu celular para descargar la app. En una computadora, busca la opción de instalar en el menú de Chrome o Edge, si está disponible.</p>
        </>}
        {guide && <button type="button" className="btn btn-ghost" onClick={() => setGuide(null)}>Entendido</button>}
      </div>
    </div>
  );
}
