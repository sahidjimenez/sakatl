"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";

const iosSteps = [
  { title: "Toca Compartir", description: "En Safari, abre el menú y toca Compartir.", image: "compartir", width: 714, height: 1155 },
  { title: "Toca Ver más", description: "Si no aparecen todas las opciones, toca Ver más.", image: "ver-mas", width: 319, height: 394 },
  { title: "Elige Agregar a Inicio", description: "Busca y toca Agregar a Inicio en la lista de opciones.", image: "agregar-inicio", width: 1290, height: 180 },
  { title: "Confirma con Agregar", description: "Deja activado Abrir como app web y toca Agregar. Encontrarás Sakatl en tu pantalla de inicio.", image: "agregar", width: 1290, height: 1048 },
];

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iosGuide = guide === "ios" || guide === "safari";

  useEffect(() => {
    if (!iosGuide || installed) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [iosGuide, installed]);

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
      {iosGuide && <dialog
        ref={dialogRef}
        id={guideId}
        className="install-ios-modal"
        aria-labelledby={`${guideId}-title`}
        onCancel={(event) => { event.preventDefault(); setGuide(null); }}
        onClick={(event) => { if (event.target === event.currentTarget) setGuide(null); }}
      >
        <div className="install-ios-content">
          <header className="install-ios-header">
            <h2 id={`${guideId}-title`}>Agrega Sakatl a Inicio</h2>
            <button type="button" className="btn btn-ghost" aria-label="Cerrar instrucciones" onClick={() => setGuide(null)}>✕</button>
          </header>
          <p>Sigue estos cuatro pasos en Safari para tener Sakatl en tu iPhone o iPad.</p>
          {guide === "safari" && <div className="install-ios-notice">
            <strong>Primero abre esta dirección en Safari:</strong>
            <p className="install-app-address">{address}</p>
          </div>}
          <ol className="install-ios-steps">
            {iosSteps.map((step, index) => <li key={step.image}>
              <h3><span>{index + 1}</span>{step.title}</h3>
              <p>{step.description}</p>
              <Image src={`/install/ios/${step.image}.jpeg`} alt={`Paso ${index + 1}: ${step.title}`} width={step.width} height={step.height} sizes="(max-width: 600px) 85vw, 480px" className="install-ios-image" />
            </li>)}
          </ol>
          <button type="button" className="btn btn-ghost" onClick={() => setGuide(null)}>Entendido</button>
        </div>
      </dialog>}
      <div id={iosGuide ? undefined : guideId} className="install-app-guide" hidden={!guide || iosGuide} aria-live="polite">
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
