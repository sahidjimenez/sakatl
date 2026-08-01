"use client";

import type { ReactNode } from "react";
import { IconModalButton } from "@/app/components/IconModalButton";

function NotesIcon({ className }: { className?: string }) {
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
      <path d="M7 3.5h8.5L19 7v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M15 3.5V7a1 1 0 0 0 1 1h3" />
      <path d="M8.5 12h7M8.5 15.5h5" />
    </svg>
  );
}

export function SessionNotesModal({
  hasNotes,
  children,
}: {
  hasNotes: boolean;
  children: ReactNode;
}) {
  return (
    <IconModalButton
      icon={<NotesIcon className="h-5 w-5" />}
      ariaLabel="Notas de la sesión"
      badge={hasNotes}
      modalTitle="Notas de la sesión"
    >
      {children}
    </IconModalButton>
  );
}
