import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBillingSummary } from "@/lib/billing/store";
import { BillingButton } from "@/app/components/BillingButton";
export const dynamic = "force-dynamic";
export default async function PlanPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const [summary, query] = await Promise.all([requireUser().then(getBillingSummary), searchParams]);
  return <main className="mx-auto w-full max-w-2xl px-5 py-12"><p className="mb-3 text-sm text-[#4ade80]">Tu cuenta</p><h1 className="text-4xl font-extrabold">Mi plan</h1>
    {query.checkout === "success" && <p role="status" className="mt-6 rounded-xl border border-[#2a2f37] p-4 text-sm text-[#9099a3]">Recibimos tu regreso del pago. El plan se actualiza cuando Stripe confirma la operación. Si aún no aparece, recarga esta página en unos segundos.</p>}
    <section className="mt-6 space-y-5 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-7"><h2 className="text-2xl font-bold">Sakatl {summary.pro ? "Pro" : "Gratis"}</h2><p className="text-[#9099a3]">{summary.used} de {summary.limit} mensajes de IA utilizados{summary.pro ? " este mes" : " de la muestra gratuita"}.</p><p className="text-sm text-[#9099a3]">{summary.routineLimit === null ? "Rutinas sin límite de cantidad." : `Puedes guardar hasta ${summary.routineLimit} rutinas. Tu historial se conserva.`}</p>
    <p className="text-[#9099a3]">{summary.voiceUsed} de {summary.limit} transcripciones utilizadas{summary.pro ? " este mes" : " de la muestra gratuita"}.</p>
    {summary.subscription?.period_end && <p className="text-sm">{summary.subscription.cancel_at_period_end ? "Acceso hasta" : "Fin del período"}: {new Date(summary.subscription.period_end).toLocaleDateString("es-MX", { dateStyle: "long", timeZone: "America/Mexico_City" })}.</p>}
    {summary.subscription && !summary.pro && <p className="text-sm text-amber-200">Tu suscripción no tiene acceso Pro activo. Consulta su estado o actualiza el medio de pago en el portal.</p>}
    {summary.subscription ? <BillingButton portal enabled={summary.enabled} /> : <Link href="/planes" className="block rounded-xl bg-[#22c55e] p-3 text-center font-bold text-[#08150d]">Conocer planes</Link>}</section><p className="mt-5 text-sm text-[#9099a3]">Cancelar la renovación conserva tu acceso durante el período ya pagado. Las rutinas y el historial no se borran.</p></main>;
}
