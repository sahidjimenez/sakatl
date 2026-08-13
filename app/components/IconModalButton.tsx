"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/app/components/Modal";

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

      <Modal open={open} onClose={() => setOpen(false)}>
        {/* El submit de un <form> hijo burbujea hasta aquí, así que el modal se
            cierra al guardar sin que este componente conozca la acción usada. */}
        <div onSubmit={() => setOpen(false)}>
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
      </Modal>
    </>
  );
}
