export type WeightUnit = "kg" | "lb";

const KG_PER_LB = 0.45359237;

// All persisted weights and volume calculations remain in kilograms.
export function weightToKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : value * KG_PER_LB;
}

export function weightFromKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : value / KG_PER_LB;
}

export function formatWeight(value: number, unit: WeightUnit): string {
  return String(Number(weightFromKg(value, unit).toFixed(2)));
}
