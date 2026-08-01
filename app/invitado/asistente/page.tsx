import Link from "next/link";
import { GuestAsistenteChat } from "../AsistenteChat";

export default function InvitadoAsistentePage() {
  return (
    <div className="px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <div>
          <Link
            href="/invitado"
            className="mb-2 inline-block text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← Mis rutinas
          </Link>
          <h1 className="text-3xl font-extrabold">Crear rutina con IA</h1>
          <p className="mt-1 text-[#9099a3]">
            Chatea con el asistente y te propone una rutina lista para guardar. Como invitado tenés 1
            rutina con IA por semana.
          </p>
        </div>
        <GuestAsistenteChat />
      </div>
    </div>
  );
}
