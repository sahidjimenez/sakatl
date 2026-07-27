import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ComunidadTabs } from "./ComunidadTabs";
import { ComunidadDiscover } from "./ComunidadDiscover";

export const metadata: Metadata = {
  title: "Comunidad — Sakatl",
};

export default async function ComunidadPage() {
  await requireUser();

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold">Comunidad</h1>
          <p className="mt-1 text-[#9099a3]">
            Rutinas de otros usuarios — sigue la que te sirva, o pídele una al asistente.
          </p>
        </div>

        <ComunidadTabs communityContent={<ComunidadDiscover />} />
      </div>
    </div>
  );
}
