"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const ICON_BUTTON_CLASS =
  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#2a2f37] bg-[#1c2026] text-[#f1f3f4] hover:border-[#4ade80]";

export function IconModalButton({
  icon,
  ariaLabel,
  badge,
  modalTitle,
  children,
}: {
  icon: ReactNode;
  ariaLabel: string;
  badge?: boolean;
  modalTitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={ICON_BUTTON_CLASS}
      >
        {icon}
        {badge && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#4ade80]" />}
      </button>

      {open &&
        createPortal(
          // El submit de un <form> hijo burbujea hasta aquí, así que el modal se
          // cierra al guardar sin que este componente conozca la acción usada.
          // Se porta a document.body: si el botón vive dentro de un header con
          // backdrop-blur (como en la sesión de entrenamiento en mobile), ese
          // filtro crea un containing block que atraparía "fixed" dentro del
          // header en vez de cubrir toda la pantalla.
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-lg rounded-t-2xl border border-[#2a2f37] bg-[#1c2026] p-5 sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              onSubmit={() => setOpen(false)}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#f1f3f4]">{modalTitle}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[#2a2f37] px-3 py-1 text-sm text-[#9099a3] hover:text-[#f1f3f4]"
                >
                  Cerrar
                </button>
              </div>
              {children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
