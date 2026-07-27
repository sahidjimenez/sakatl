import type { Metadata } from "next";
import RoutineForm from "../RoutineForm";

export const metadata: Metadata = {
  title: "Nueva rutina — Sakatl",
};

export default function NuevaRutinaPage() {
  return (
    <div className="flex-1 px-[clamp(20px,5vw,72px)] py-10">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 text-xs font-semibold tracking-wide text-[#9099a3] uppercase">
          Nueva rutina
        </p>
        <h1 className="mb-8 text-3xl font-extrabold">Arma tu rutina</h1>
        <RoutineForm mode="create" />
      </div>
    </div>
  );
}
