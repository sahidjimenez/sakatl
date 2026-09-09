import "server-only";
import Stripe from "stripe";
import { ApiError } from "../errors";
import type { BillingInterval } from "./plans";

let client: Stripe | undefined;
export function billingEnabled() { return process.env.BILLING_ENABLED === "true"; }
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new ApiError(503, "Las suscripciones aún no están disponibles.");
  return client ??= new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}
export function priceId(interval: BillingInterval) {
  const id = process.env[interval === "month" ? "STRIPE_PRICE_MONTHLY" : "STRIPE_PRICE_ANNUAL"];
  if (!id) throw new ApiError(503, "Este plan aún no está disponible.");
  return id;
}
export function appOrigin() {
  const raw = process.env.APP_URL;
  if (!raw) throw new ApiError(503, "Falta configurar el sitio de suscripciones.");
  const url = new URL(raw);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new ApiError(503, "La URL del sitio no es válida.");
  return url.origin;
}
export function assertBillingRequest(request: Request) {
  if (!billingEnabled()) throw new ApiError(503, "Las suscripciones aún no están disponibles.");
  if (request.headers.get("origin") !== appOrigin()) throw new ApiError(403, "Solicitud no permitida.");
  if (process.env.STRIPE_SECRET_KEY?.includes("_live_") && process.env.BILLING_LIVE_READY !== "true") throw new ApiError(503, "Los cobros reales todavía no están habilitados.");
}
