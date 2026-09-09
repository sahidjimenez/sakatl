import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { ApiError } from "../errors";
import { FREE_AI_MESSAGES, PRO_AI_MESSAGES, grantsPro, usageWindow } from "./plans";
import { billingEnabled } from "./stripe";

export type BillingDb = Pick<ReturnType<typeof getDb>, "execute">;
export type SubscriptionRow = { id: string; status: string; paid: boolean; period_end: Date | null; cancel_at_period_end: boolean; price_id: string };
export async function lockAccount(db: BillingDb, userId: string) {
  await db.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 7211))`);
  await db.execute(sql`insert into billing_accounts(user_id) values(${userId}) on conflict do nothing`);
}
export async function subscriptionFor(db: BillingDb, userId: string) {
  const result = await db.execute(sql`select id,status,paid,period_end,cancel_at_period_end,price_id from billing_subscriptions where user_id=${userId} order by (status='active' and paid and period_end>now()) desc, updated_at desc limit 1`);
  return (result.rows[0] as SubscriptionRow | undefined) ?? null;
}
export async function getBillingSummary(userId: string) {
  if (!billingEnabled()) return { enabled: false, pro: false, subscription: null, used: 0, voiceUsed: 0, limit: FREE_AI_MESSAGES, routineLimit: 4 };
  const db = getDb();
  const subscription = await subscriptionFor(db, userId);
  const pro = !!subscription && grantsPro(subscription.status, subscription.paid, subscription.period_end);
  const key = pro ? usageWindow() : "lifetime";
  const usage = await db.execute(sql`select capability,used from billing_usage where user_id=${userId} and window_key=${key}`);
  const account = await db.execute(sql`select routine_limit from billing_accounts where user_id=${userId}`);
  return { enabled: true, pro, subscription, used: Number(usage.rows.find(row => row.capability === "assistant")?.used ?? 0), voiceUsed: Number(usage.rows.find(row => row.capability === "voice")?.used ?? 0), limit: pro ? PRO_AI_MESSAGES : FREE_AI_MESSAGES, routineLimit: pro ? null : Number(account.rows[0]?.routine_limit ?? 4) };
}
export async function assertRoutineCapacity(db: BillingDb, userId: string) {
  if (!billingEnabled()) return;
  await lockAccount(db, userId);
  const sub = await subscriptionFor(db, userId);
  if (sub && grantsPro(sub.status, sub.paid, sub.period_end)) return;
  const result = await db.execute(sql`select a.routine_limit, (select count(*) from routines where owner_id=${userId}) as count from billing_accounts a where user_id=${userId}`);
  if (Number(result.rows[0].count) >= Number(result.rows[0].routine_limit)) throw new ApiError(403, "Alcanzaste las rutinas incluidas en Gratis. Conservas las que ya tienes; conoce Pro en Planes.");
}
export async function consumeUsage(userId: string, capability: "assistant" | "voice") {
  if (!billingEnabled()) return null;
  return getDb().transaction(async tx => {
    await lockAccount(tx, userId);
    const sub = await subscriptionFor(tx, userId);
    const pro = !!sub && grantsPro(sub.status, sub.paid, sub.period_end);
    const window = pro ? usageWindow() : "lifetime";
    const limit = pro ? PRO_AI_MESSAGES : FREE_AI_MESSAGES;
    const result = await tx.execute(sql`insert into billing_usage(user_id,capability,window_key,used) values(${userId},${capability},${window},1) on conflict(user_id,capability,window_key) do update set used=billing_usage.used+1 where billing_usage.used<${limit} returning used`);
    if (!result.rows.length) throw new ApiError(429, pro ? "Alcanzaste el cupo de este mes. Se renueva el día 1 (UTC)." : "Terminaste la muestra gratuita. Consulta Pro en Planes para continuar.");
    return { userId, capability, window };
  });
}
export async function refundUsage(reservation: Awaited<ReturnType<typeof consumeUsage>>) {
  if (!reservation) return;
  await getDb().execute(sql`update billing_usage set used=greatest(0,used-1) where user_id=${reservation.userId} and capability=${reservation.capability} and window_key=${reservation.window}`);
}
