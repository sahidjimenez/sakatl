"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

const TRANSITION_MS = 180;

export function Modal({
  open,
  onClose,
  variant = "sheet",
  children,
}: {
  open: boolean;
  onClose: () => void;
  variant?: "sheet" | "dialog";
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <ModalInner onClose={onClose} variant={variant}>
      {children}
    </ModalInner>
  );
}

function ModalInner({
  onClose,
  variant,
  children,
}: {
  onClose: () => void;
  variant: "sheet" | "dialog";
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  // Se monta desde cero cada vez que se abre (Modal solo lo renderiza cuando
  // open es true), así que este efecto corre una vez por apertura: arranca
  // oculto y en el siguiente frame activa la transición de entrada.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function requestClose() {
    setClosing(true);
    setTimeout(onClose, TRANSITION_MS);
  }

  const visible = entered && !closing;

  const panelClass =
    variant === "sheet"
      ? `w-full max-w-lg rounded-t-2xl border border-[#2a2f37] bg-[#1c2026] p-5 transition-all duration-200 ease-out sm:rounded-2xl ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 sm:translate-y-2"
        }`
      : `w-full max-w-xs rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 text-center transition-all duration-200 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`;

  return createPortal(
    // Se porta a document.body: si el disparador vive dentro de un header con
    // backdrop-blur (como en la sesión de entrenamiento en mobile), ese filtro
    // crea un containing block que atraparía "fixed" ahí en vez de cubrir
    // toda la pantalla.
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-200 ${
        variant === "sheet" ? "items-end p-0 sm:items-center sm:p-4" : "p-4"
      } ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={requestClose}
    >
      <div className={panelClass} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
