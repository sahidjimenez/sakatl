"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGuestDaysRemaining, touchGuestMeta } from "@/lib/guest/storage";

export function GuestBanner() {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    touchGuestMeta();
    // localStorage solo existe en el cliente: se lee tras montar para no
    // desincronizar el HTML del servidor (que no puede saber este valor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaysRemaining(getGuestDaysRemaining());
  }, []);

  return (
    <div className="border-b border-[#2a2f37] bg-[#1c2026] px-[clamp(20px,5vw,56px)] py-3 text-sm text-[#9099a3]">
      <p>
        Modo invitado — tus rutinas se guardan solo en este navegador
        {daysRemaining != null && ` durante ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""} más`}.{" "}
        <Link href="/sign-up" className="font-bold text-[#4ade80] hover:underline">
          Crea una cuenta
        </Link>{" "}
        para conservarlas.
      </p>
    </div>
  );
}
