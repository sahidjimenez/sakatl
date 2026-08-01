import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { PublicNav } from "@/app/components/PublicNav";
import { ComunidadPublicBrowse } from "./ComunidadPublicBrowse";

export const metadata: Metadata = {
  title: "Comunidad — Sakatl",
  description: "Explora rutinas que otras personas armaron en Sakatl.",
};

export default async function ComunidadPublicPage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f1f3f4]">
      <PublicNav isSignedIn={isSignedIn} active="comunidad" />

      <div className="px-[clamp(20px,5vw,56px)] py-10">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
          <div>
            <h1 className="text-3xl font-extrabold">Rutinas de la comunidad</h1>
            <p className="mt-1 text-[#9099a3]">
              Explora y sigue rutinas sin cuenta. Como invitado se guardan solo en este navegador.
            </p>
          </div>
          <ComunidadPublicBrowse isSignedIn={isSignedIn} />
        </div>
      </div>
    </div>
  );
}
