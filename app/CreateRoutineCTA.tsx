"use client";

import { useState } from "react";
import { AuthChoiceModal } from "./AuthChoiceModal";

export function CreateRoutineCTA({ label, className }: { label: string; className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && <AuthChoiceModal onClose={() => setOpen(false)} />}
    </>
  );
}
