import { currentUser } from "@clerk/nextjs/server";
import { ApiError, ensureUser } from "./routines";

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "No autenticado.");

  const displayName =
    user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  await ensureUser(user.id, displayName, user.imageUrl ?? null);

  return user.id;
}
