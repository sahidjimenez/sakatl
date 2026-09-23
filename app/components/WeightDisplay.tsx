"use client";

import { useWeightUnit } from "@/app/components/WeightInput";
import { formatWeight } from "@/lib/weight-units";

export function WeightDisplay({ value, exerciseId }: { value: number; exerciseId: string }) {
  const [unit] = useWeightUnit(exerciseId);
  return <>{formatWeight(value, unit)} {unit}</>;
}
