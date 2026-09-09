"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { PLANS, type BillingInterval } from "@/lib/billing/plans";
export function BillingButton({ interval, portal = false, enabled = true }: { interval?: BillingInterval; portal?: boolean; enabled?: boolean }) {
  const { isLoaded, isSignedIn } = useUser();
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/billing/${portal ? "portal" : "checkout"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: portal ? undefined : JSON.stringify({ interval, consent, attemptId: crypto.randomUUID() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo abrir la suscripción.");
      const url = new URL(data.url);
      if (url.protocol !== "https:" || !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)) throw new Error("El enlace de pago no es válido.");
      window.location.assign(url.href);
    } catch (err) { setError(err instanceof Error ? err.message : "Intenta de nuevo."); setBusy(false); }
  }
  if (!enabled) return <p className="text-sm text-[#9099a3]">Próximamente disponible.</p>;
  if (!isLoaded) return <button disabled className="w-full rounded-xl border border-[#2a2f37] px-4 py-3">Cargando…</button>;
  if (!isSignedIn) return <Link href="/sign-up?redirect_url=%2Fplanes" className="block rounded-xl bg-[#22c55e] px-4 py-3 text-center font-bold text-[#08150d]">Crear cuenta para continuar</Link>;
  return <div className="space-y-3">
    {!portal && interval && <label className="flex gap-3 text-xs leading-relaxed text-[#9099a3]"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" /><span>Acepto el cobro recurrente de ${PLANS[interval].amount / 100} MXN por {interval === "month" ? "mes" : "año"}, impuestos incluidos, hasta cancelar. Leí los <Link href="/terminos" className="underline">términos</Link> y el <Link href="/privacidad" className="underline">aviso de privacidad</Link>.</span></label>}
    <button type="button" onClick={submit} disabled={busy || (!portal && !consent)} className="w-full rounded-xl bg-[#22c55e] px-4 py-3 font-bold text-[#08150d] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Abriendo…" : portal ? "Administrar o cancelar suscripción" : "Continuar al pago"}</button>
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
  </div>;
}
