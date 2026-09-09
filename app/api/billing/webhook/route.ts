import { stripeClient } from "@/lib/billing/stripe";
import { processBillingEvent } from "@/lib/billing/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook sin configurar." }, { status: 503 });
  if (!signature) return Response.json({ error: "Firma requerida." }, { status: 400 });
  const raw = await request.text();
  if (raw.length > 1000000) return Response.json({ error: "Evento demasiado grande." }, { status: 413 });
  let event;
  try { event = stripeClient().webhooks.constructEvent(raw, signature, secret); }
  catch { return Response.json({ error: "Firma no válida." }, { status: 400 }); }
  const live = process.env.STRIPE_SECRET_KEY?.includes("_live_") ?? false;
  if (event.livemode !== live) return Response.json({ error: "Entorno incorrecto." }, { status: 400 });
  try { await processBillingEvent(event); }
  catch { console.error("No se pudo procesar el evento de facturación", event.id); return Response.json({ error: "Reintentar entrega." }, { status: 500 }); }
  return Response.json({ received: true });
}
