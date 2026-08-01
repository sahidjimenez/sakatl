"use client";

import { ConfirmButton } from "@/app/components/ConfirmButton";
import { ICON_BUTTON_CLASS } from "@/app/components/IconModalButton";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CancelSessionButton({ action }: { action: () => Promise<void> | void }) {
  return (
    <ConfirmButton
      action={action}
      label={<TrashIcon className="h-5 w-5" />}
      ariaLabel="Cancelar y descartar esta sesión"
      title="Cancelar sesión"
      confirmLabel="¿Descartar esta sesión?"
      confirmActionLabel="Sí, descartar"
      className={`${ICON_BUTTON_CLASS} text-[#9099a3] hover:border-red-500 hover:text-red-400`}
    />
  );
}
