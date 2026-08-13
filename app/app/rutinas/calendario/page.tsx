import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listMyRoutinesSchedule } from "@/lib/routines";
import { CalendarBoard } from "./CalendarBoard";

export const metadata: Metadata = {
  title: "Calendario de rutinas — Sakatl",
};

export default async function CalendarioPage() {
  const userId = await requireUser();
  const routines = await listMyRoutinesSchedule(userId);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div>
          <Link
            href="/app/rutinas"
            className="text-sm font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← Mis rutinas
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold">Calendario</h1>
        </div>

        <CalendarBoard routines={routines} />
      </div>
    </div>
  );
}
