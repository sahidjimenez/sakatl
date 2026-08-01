"use client";

import RoutineForm from "@/app/app/RoutineForm";
import { saveGuestRoutine } from "@/lib/guest/storage";

export default function NuevaRutinaInvitadoPage() {
  return (
    <div className="px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold">Nueva rutina</h1>
          <p className="mt-1 text-[#9099a3]">Se guarda solo en este navegador.</p>
        </div>
        <RoutineForm
          mode="create"
          onSave={async (input) => saveGuestRoutine(input)}
          resultHref={(id) => `/invitado/rutinas/${id}`}
        />
      </div>
    </div>
  );
}
