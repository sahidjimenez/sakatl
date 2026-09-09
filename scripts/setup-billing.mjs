import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import Stripe from "stripe";
import pg from "pg";
dotenv.config({ path: ".env.local", quiet: true });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
if (!process.env.STRIPE_SECRET_KEY?.includes("_test_")) throw new Error("This setup only creates test-mode resources.");
const account = await stripe.accounts.retrieve();
console.log(`Using Mexico test account ${account.id}; live charges enabled: ${account.charges_enabled}`);
if (account.country !== "MX") throw new Error("Expected a Mexican Stripe account.");
const products = await stripe.products.search({ query: "metadata['sakatl_plan']:'pro'", limit: 10 });
const product = products.data.find(p => p.active) ?? await stripe.products.create({ name: "Sakatl Pro", description: "Rutinas y asistente de entrenamiento. Suscripción en pesos mexicanos.", metadata: { sakatl_plan: "pro" } }, { idempotencyKey: "sakatl-pro-product-v1" });
const values = { APP_URL: "http://localhost:3015", BILLING_ENABLED: "true", BILLING_LIVE_READY: "false" };
for (const [interval, amount, env] of [["month",5900,"STRIPE_PRICE_MONTHLY"],["year",49900,"STRIPE_PRICE_ANNUAL"]]) {
  const lookup = `sakatl_pro_${interval}_mxn_v1`;
  const existing = await stripe.prices.list({ lookup_keys: [lookup], active: true });
  const price = existing.data[0] ?? await stripe.prices.create({ product: product.id, currency: "mxn", unit_amount: amount, recurring: { interval }, tax_behavior: "inclusive", lookup_key: lookup }, { idempotencyKey: lookup });
  if (price.unit_amount !== amount || price.currency !== "mxn") throw new Error("Unexpected existing price.");
  values[env] = price.id;
  console.log(`Configured Pro ${interval}: ${amount/100} MXN`);
}
const rates = await stripe.taxRates.list({ active: true, limit: 100 });
const tax = rates.data.find(r => r.inclusive && r.country === "MX" && r.percentage === 16) ?? await stripe.taxRates.create({ display_name: "IVA", description: "IVA México — configuración de prueba", percentage: 16, inclusive: true, country: "MX" }, { idempotencyKey: "sakatl-mx-iva-test-v1" });
values.STRIPE_TAX_RATE = tax.id;
const configs = await stripe.billingPortal.configurations.list({ limit: 100 });
const portal = configs.data.find(c => c.metadata?.sakatl === "v1") ?? await stripe.billingPortal.configurations.create({ metadata: { sakatl: "v1" }, business_profile: { headline: "Administra tu plan de Sakatl" }, features: { customer_update: { enabled: true, allowed_updates: ["email", "address", "tax_id"] }, invoice_history: { enabled: true }, payment_method_update: { enabled: true }, subscription_cancel: { enabled: true, mode: "at_period_end" } } });
values.STRIPE_PORTAL_CONFIGURATION = portal.id;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try { await client.query("BEGIN"); await client.query(fs.readFileSync(path.join("scripts","migrations","001-billing.sql"),"utf8")); await client.query("COMMIT"); console.log("Additive billing migration applied."); }
catch (error) { await client.query("ROLLBACK"); throw error; }
finally { client.release(); await pool.end(); }
let local = fs.readFileSync(".env.local","utf8");
for (const [key,value] of Object.entries(values)) local=local.split(/\r?\n/).filter(l=>!l.startsWith(`${key}=`)).join("\n")+`\n${key}=${JSON.stringify(value)}\n`;
fs.writeFileSync(".env.local",local);
console.log("Local configuration updated. No live prices or charges created.");
