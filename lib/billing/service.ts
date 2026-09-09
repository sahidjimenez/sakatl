import "server-only";
import { sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "../db";
import { ApiError } from "../errors";
import { CONSENT_VERSION, PLANS, type BillingInterval } from "./plans";
import { appOrigin, priceId, stripeClient } from "./stripe";
import { lockAccount, type BillingDb } from "./store";

async function customerFor(db: BillingDb, userId: string, email?: string) {
  const existing = await db.execute(sql`select customer_id from billing_accounts where user_id=${userId}`);
  if (existing.rows[0]?.customer_id) return String(existing.rows[0].customer_id);
  const customer = await stripeClient().customers.create({ email, metadata: { sakatl_user_id: userId } }, { idempotencyKey: `sakatl-customer-v1-${userId}` });
  await db.execute(sql`update billing_accounts set customer_id=${customer.id} where user_id=${userId}`);
  return customer.id;
}
export async function startCheckout(userId: string, interval: BillingInterval, attemptId: string, email?: string) {
  const stripe = stripeClient();
  const price = await stripe.prices.retrieve(priceId(interval));
  if (!price.active || price.currency !== "mxn" || price.unit_amount !== PLANS[interval].amount || price.recurring?.interval !== interval || price.recurring.interval_count !== 1 || price.tax_behavior !== "inclusive") throw new ApiError(503, "El precio del plan necesita revisión.");
  return getDb().transaction(async tx => {
    await lockAccount(tx, userId);
    const customer = await customerFor(tx, userId, email);
    const subscriptions = await stripe.subscriptions.list({ customer, status: "all", limit: 100 });
    if (subscriptions.data.some(s => !["canceled", "incomplete_expired"].includes(s.status))) throw new ApiError(409, "Ya tienes una suscripción. Puedes administrarla desde Mi plan.");
    const open = await stripe.checkout.sessions.list({ customer, status: "open", limit: 100 });
    for (const session of open.data) {
      if (session.mode !== "subscription") continue;
      if (session.metadata?.sakatl_interval === interval && session.url) {
        await tx.execute(sql`insert into billing_consents(checkout_id,user_id,version,amount,interval) values(${session.id},${userId},${CONSENT_VERSION},${price.unit_amount},${interval}) on conflict do nothing`);
        return session.url;
      }
      await stripe.checkout.sessions.expire(session.id);
    }
    const origin = appOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", customer, client_reference_id: userId,
      line_items: [{ price: price.id, quantity: 1 }], locale: "es",
      integration_identifier: "sakatl-subscriptions-jqmwpkza",
      metadata: { sakatl_interval: interval, consent_version: CONSENT_VERSION },
      subscription_data: { metadata: { sakatl_user_id: userId }, default_tax_rates: process.env.STRIPE_TAX_RATE ? [process.env.STRIPE_TAX_RATE] : undefined },
      success_url: `${origin}/app/plan?checkout=success`, cancel_url: `${origin}/planes?checkout=cancelled`,
      custom_text: { submit: { message: `Sakatl Pro: ${PLANS[interval].amount / 100} MXN por ${interval === "month" ? "mes" : "año"}, impuestos incluidos. Renovación automática. Cancela desde Mi plan.` } },
    }, { idempotencyKey: `sakatl-checkout-${userId}-${attemptId}` });
    if (!session.url) throw new ApiError(502, "No se pudo abrir el pago. Intenta de nuevo.");
    await tx.execute(sql`insert into billing_consents(checkout_id,user_id,version,amount,interval) values(${session.id},${userId},${CONSENT_VERSION},${price.unit_amount},${interval}) on conflict do nothing`);
    return session.url;
  });
}
export async function openPortal(userId: string) {
  const result = await getDb().execute(sql`select customer_id from billing_accounts where user_id=${userId}`);
  const customer = result.rows[0]?.customer_id;
  if (!customer) throw new ApiError(404, "Todavía no tienes una suscripción.");
  const session = await stripeClient().billingPortal.sessions.create({ customer: String(customer), configuration: process.env.STRIPE_PORTAL_CONFIGURATION || undefined, return_url: `${appOrigin()}/app/plan`, locale: "es" });
  return session.url;
}
export async function reconcileCustomer(db: BillingDb, userId: string, customer: string) {
  const stripe = stripeClient();
  const subscriptions = await stripe.subscriptions.list({ customer, status: "all", limit: 100, expand: ["data.latest_invoice"] }).autoPagingToArray({ limit: 1000 });
  const allowed = new Set([process.env.STRIPE_PRICE_MONTHLY, process.env.STRIPE_PRICE_ANNUAL].filter(Boolean));
  // Rebuild from current Stripe state while holding the account lock. Delivery order cannot restore stale access.
  await db.execute(sql`update billing_subscriptions set paid=false,updated_at=now() where user_id=${userId}`);
  for (const sub of subscriptions) {
    const item = sub.items.data.find(i => allowed.has(i.price.id));
    if (!item) continue;
    const invoice = typeof sub.latest_invoice === "object" ? sub.latest_invoice as Stripe.Invoice | null : null;
    const paid = invoice?.status === "paid" && sub.status === "active";
    const end = new Date(item.current_period_end * 1000);
    await db.execute(sql`insert into billing_subscriptions(id,user_id,customer_id,price_id,status,paid,period_end,cancel_at_period_end) values(${sub.id},${userId},${customer},${item.price.id},${sub.status},${paid},${end},${sub.cancel_at_period_end}) on conflict(id) do update set status=excluded.status,paid=excluded.paid,period_end=excluded.period_end,cancel_at_period_end=excluded.cancel_at_period_end,price_id=excluded.price_id,updated_at=now()`);
  }
}
export async function processBillingEvent(event: Stripe.Event) {
  const supported = event.type.startsWith("customer.subscription.") || ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "invoice.paid", "invoice.payment_failed", "invoice.marked_uncollectible", "invoice.voided"].includes(event.type);
  if (!supported) return;
  const object = event.data.object as { customer?: string | { id: string } | null };
  const customer = typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customer) return;
  await getDb().transaction(async tx => {
    const account = await tx.execute(sql`select user_id from billing_accounts where customer_id=${customer}`);
    if (!account.rows[0]) return; // Another product in the same Stripe account.
    const userId = String(account.rows[0].user_id);
    await lockAccount(tx, userId);
    const seen = await tx.execute(sql`select id from billing_events where id=${event.id}`);
    if (seen.rows.length) return;
    await reconcileCustomer(tx, userId, customer);
    await tx.execute(sql`insert into billing_events(id,type) values(${event.id},${event.type}) on conflict do nothing`);
  });
}
