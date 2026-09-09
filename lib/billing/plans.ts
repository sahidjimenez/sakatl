export const PLANS = {
  month: { label: "Mensual", amount: 5900, interval: "month" },
  year: { label: "Anual", amount: 49900, interval: "year" },
} as const;
export type BillingInterval = keyof typeof PLANS;
export const FREE_ROUTINES = 4;
export const FREE_AI_MESSAGES = 5;
export const PRO_AI_MESSAGES = 40;
export const CONSENT_VERSION = "2026-09-09";
export function isInterval(value: unknown): value is BillingInterval { return value === "month" || value === "year"; }
export function usageWindow(now = new Date()) { return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`; }
export function grantsPro(status: string, paid: boolean, end: Date | string | null, now = new Date()) {
  return status === "active" && paid && !!end && new Date(end).getTime() > now.getTime();
}
