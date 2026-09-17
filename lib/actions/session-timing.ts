"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { sessionClock, pendingSessions } from "@/lib/session-timing";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function clockAction(id: string, operation: "read" | "pause" | "resume" | "duration", minutes?: number) {
  if (!["read", "pause", "resume", "duration"].includes(operation)) throw new Error("Operación inválida.");
  const result = await sessionClock(await requireUser(), id, operation, minutes);
  if (operation !== "read") revalidatePath("/app", "layout");
  return result;
}

export async function pendingSessionsAction() { return pendingSessions(await requireUser()); }

export async function saveAutoPauseAction(form: FormData) {
  const userId = await requireUser();
  const minutes = Number(form.get("minutes"));
  if (![0, 5, 10, 15, 20, 30, 60].includes(minutes)) throw new Error("Tiempo inválido.");
  // Settle expired clocks under the previous setting before changing the timeout.
  for (const session of await pendingSessions(userId)) await sessionClock(userId, session.id);
  await getDb().update(users).set({ autoPauseMinutes: minutes }).where(eq(users.id, userId));
  revalidatePath("/app", "layout");
}
