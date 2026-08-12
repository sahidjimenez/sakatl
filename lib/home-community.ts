import { unstable_cache } from "next/cache";
import { listCommunityRoutines } from "@/lib/routines";

export type HomeCommunityRoutine = {
  id: string;
  name: string;
  description: string | null;
  ownerDisplayName: string | null;
  createdAt: Date;
};

async function fetchHomeCommunityRoutines(): Promise<HomeCommunityRoutine[]> {
  // "" no coincide con ningun userId real de Clerk, igual que /api/community.
  return listCommunityRoutines("", 0, 3);
}

// Mismo cacheo de 5 min que getHomeStats: el home publico no debe pegarle a
// la DB en cada visita de un usuario no autenticado.
export const getHomeCommunityRoutines = unstable_cache(
  fetchHomeCommunityRoutines,
  ["home-community-routines"],
  { revalidate: 300 },
);
