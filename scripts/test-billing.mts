import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { sql } from 'drizzle-orm';
dotenv.config({ path: '.env.local', quiet: true });
assert(process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'), 'Test credentials required');
process.env.BILLING_ENABLED = 'true';
const { getDb } = await import('../lib/db/index');
const { grantsPro, usageWindow } = await import('../lib/billing/plans');
const { consumeUsage, refundUsage, assertRoutineCapacity, getBillingSummary } = await import('../lib/billing/store');
const { startCheckout, processBillingEvent, openPortal } = await import('../lib/billing/service');
const db = getDb();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const user = `sakatl_test_${randomUUID()}`;
let customer: string | undefined;
const eventIds: string[] = [];
async function deliver(type: Stripe.Event.Type, object: unknown) {
  const event = { id: `evt_sakatl_test_${randomUUID()}`, type, data: { object }, livemode: false } as Stripe.Event;
  eventIds.push(event.id);
  await processBillingEvent(event);
  return event;
}
try {
  assert.equal(grantsPro('active', true, new Date(Date.now()+60000)), true);
  for (const status of ['past_due','unpaid','canceled','incomplete','trialing']) assert.equal(grantsPro(status, true, new Date(Date.now()+60000)), false);
  assert.equal(grantsPro('active', false, new Date(Date.now()+60000)), false);
  assert.equal(grantsPro('active', true, new Date(0)), false);
  assert.equal(usageWindow(new Date('2026-10-01T00:00:00Z')), '2026-10');
  await db.execute(sql`insert into users(id,display_name) values(${user},'Sakatl automated test')`);
  const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => consumeUsage(user, 'assistant')));
  assert.equal(attempts.filter(x => x.status === 'fulfilled').length, 5);
  assert.equal(attempts.filter(x => x.status === 'rejected').length, 7);
  const reservation = attempts.find(x => x.status === 'fulfilled');
  if (reservation?.status === 'fulfilled') await refundUsage(reservation.value);
  await consumeUsage(user, 'assistant');
  await assert.rejects(() => consumeUsage(user, 'assistant'));
  const routines = await Promise.allSettled(Array.from({ length: 8 }, () => db.transaction(async tx => {
    await assertRoutineCapacity(tx,user);
    await tx.execute(sql`insert into routines(owner_id,name) values(${user},'Quota test')`);
  })));
  assert.equal(routines.filter(x => x.status === 'fulfilled').length,4);
  console.log('PASS: concurrent free quotas and refund; routine capacity.');
  const checkout = await startCheckout(user,'month',randomUUID());
  const same = await startCheckout(user,'month',randomUUID());
  assert.equal(checkout,same);
  const account = await db.execute(sql`select customer_id from billing_accounts where user_id=${user}`);
  customer = String(account.rows[0].customer_id);
  assert.equal((await getBillingSummary(user)).pro,false);
  const session = (await stripe.checkout.sessions.list({customer,status:'open'})).data[0];
  assert.equal(session.amount_total,5900);
  assert.equal(session.currency,'mxn');
  await stripe.checkout.sessions.expire(session.id);
  const pm = await stripe.paymentMethods.attach('pm_card_visa',{customer});
  await stripe.customers.update(customer,{invoice_settings:{default_payment_method:pm.id}});
  const sub = await stripe.subscriptions.create({customer,items:[{price:process.env.STRIPE_PRICE_MONTHLY!}],default_tax_rates:[process.env.STRIPE_TAX_RATE!],metadata:{sakatl_user_id:user}});
  assert.equal(sub.status,'active');
  const paidEvent = await deliver('customer.subscription.created',sub);
  assert.equal((await getBillingSummary(user)).pro,true);
  await processBillingEvent(paidEvent);
  await assert.rejects(() => startCheckout(user,'year',randomUUID()));
  assert.match(await openPortal(user),/^https:\/\/billing.stripe.com\//);
  await assert.rejects(() => openPortal(`${user}_other`));
  const proAttempts = await Promise.allSettled(Array.from({length:45},()=>consumeUsage(user,'assistant')));
  assert.equal(proAttempts.filter(x=>x.status==='fulfilled').length,40);
  const scheduled = await stripe.subscriptions.update(sub.id,{cancel_at_period_end:true});
  await deliver('customer.subscription.updated',scheduled);
  assert.equal((await getBillingSummary(user)).pro,true);
  const canceled = await stripe.subscriptions.cancel(sub.id);
  await deliver('customer.subscription.deleted',canceled);
  assert.equal((await getBillingSummary(user)).pro,false);
  await deliver('customer.subscription.created',sub); // Old payload must not restore access.
  assert.equal((await getBillingSummary(user)).pro,false);
  assert.equal(Number((await db.execute(sql`select count(*) as n from routines where owner_id=${user}`)).rows[0].n),4);
  console.log('PASS: test subscription payment, portal isolation, duplicate and stale events, Pro quota, cancellation and data retention.');
  const body = JSON.stringify({id:`evt_sakatl_test_${randomUUID()}`,type:'product.updated',data:{object:{id:'prod_test'}},livemode:false});
  const signature = stripe.webhooks.generateTestHeaderString({payload:body,secret:process.env.STRIPE_WEBHOOK_SECRET!});
  const ok = await fetch('http://localhost:3015/api/billing/webhook',{method:'POST',headers:{'stripe-signature':signature},body});
  assert.equal(ok.status,200);
  const bad = await fetch('http://localhost:3015/api/billing/webhook',{method:'POST',headers:{'stripe-signature':signature},body:body+' '});
  assert.equal(bad.status,400);
  console.log('PASS: HTTP webhook accepts signed events and rejects changed payloads.');
} finally {
  if (!customer) {
    const account = await db.execute(sql`select customer_id from billing_accounts where user_id=${user}`);
    customer = account.rows[0]?.customer_id ? String(account.rows[0].customer_id) : undefined;
  }
  if (customer) await stripe.customers.del(customer);
  await db.execute(sql`delete from users where id=${user}`);
  for (const id of eventIds) await db.execute(sql`delete from billing_events where id=${id}`);
  await db.$client.end();
}
