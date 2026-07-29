"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { logBodyWeight } from "@/lib/body-metrics";

export async function logBodyWeightAction(formData: FormData) {
  const userId = await requireUser();
  const weightKg = Number(formData.get("weightKg"));
  await logBodyWeight(userId, weightKg);
  revalidatePath("/app/perfil");
}
