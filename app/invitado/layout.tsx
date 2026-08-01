import type { Metadata } from "next";
import { PublicNav } from "@/app/components/PublicNav";
import { GuestBanner } from "./GuestBanner";

export const metadata: Metadata = {
  title: "Modo invitado — Sakatl",
};

export default function InvitadoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f1f3f4]">
      <PublicNav active="invitado" />
      <GuestBanner />
      {children}
    </div>
  );
}
