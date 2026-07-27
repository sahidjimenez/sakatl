"use client";

import { useState, type ReactNode } from "react";
import { AsistenteChat } from "./AsistenteChat";

export function ComunidadTabs({ communityContent }: { communityContent: ReactNode }) {
  const [tab, setTab] = useState<"descubrir" | "asistente">("descubrir");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-[#2a2f37]">
        {(
          [
            ["descubrir", "Descubrir"],
            ["asistente", "Asistente IA"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "border-b-2 border-[#4ade80] px-4 py-2 text-sm font-bold text-[#f1f3f4]"
                : "px-4 py-2 text-sm font-bold text-[#9099a3] hover:text-[#f1f3f4]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "descubrir" ? communityContent : <AsistenteChat />}
    </div>
  );
}
