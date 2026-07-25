import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listCommunityRoutines } from "@/lib/routines";
import { followRoutineAction } from "@/lib/actions/routines";

export const metadata: Metadata = {
  title: "Comunidad — Sakatl",
};

export default async function ComunidadPage() {
  const userId = await requireUser();
  const community = await listCommunityRoutines(userId, 0, 24);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold">Comunidad</h1>
          <p className="mt-1 text-[#9099a3]">Rutinas de otros usuarios — seguí la que te sirva.</p>
        </div>

        {community.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
            Todavía no hay rutinas de otros usuarios para seguir.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((routine) => (
              <div
                key={routine.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5"
              >
                <div>
                  <Link
                    href={`/app/rutinas/${routine.id}`}
                    className="text-base font-bold text-[#f1f3f4] hover:text-[#4ade80]"
                  >
                    {routine.name}
                  </Link>
                  <p className="mt-1 text-xs text-[#9099a3]">
                    de {routine.ownerDisplayName ?? "otro usuario"}
                  </p>
                </div>
                {routine.description && (
                  <p className="line-clamp-2 text-sm text-[#9099a3]">{routine.description}</p>
                )}
                <form action={followRoutineAction.bind(null, routine.id)}>
                  <button
                    type="submit"
                    className="w-full rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] transition-colors hover:border-[#4ade80]"
                  >
                    Seguir esta rutina
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
