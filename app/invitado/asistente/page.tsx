import Link from "next/link";
import { GuestAsistenteChat } from "../AsistenteChat";
import { billingEnabled } from "@/lib/billing/stripe";

export default function InvitadoAsistentePage() {
  const needsAccount = billingEnabled();
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
            {needsAccount ? "Crea una cuenta para probar el asistente con 5 mensajes gratuitos. Puedes seguir creando rutinas manuales como invitado." : "Chatea con el asistente y te propone una rutina lista para guardar. Como invitado tienes 1 rutina con IA por semana."}
          </p>
        </div>
        {needsAccount ? <Link href="/sign-up" className="rounded-xl bg-[#22c55e] px-5 py-3 text-center font-bold text-[#08150d]">Crear cuenta gratuita</Link> : <GuestAsistenteChat />}
      </div>
    </div>
  );
}
