import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/routines";
import { listBodyWeightHistory } from "@/lib/body-metrics";
import { updateWeeklyGoalAction } from "@/lib/actions/routines";
import { logBodyWeightAction } from "@/lib/actions/body-metrics";
import { PushNotificationToggle } from "@/app/components/PushNotificationToggle";
import { listMyCustomExercises } from "@/lib/custom-exercises";
import { MyExercises } from "./MyExercises";
import { saveAutoPauseAction } from "@/lib/actions/session-timing";

export const metadata: Metadata = {
  title: "Perfil — Sakatl",
};

export default async function PerfilPage() {
  const userId = await requireUser();
  const [user, profile, weightHistory, exercises] = await Promise.all([
    currentUser(),
    getUserProfile(userId),
    listBodyWeightHistory(userId, 5),
    listMyCustomExercises(userId),
  ]);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[600px] flex-col gap-6">
        <h1 className="text-3xl font-extrabold">Perfil</h1>
        <Link href="/app/plan" className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 font-bold text-[#4ade80]">Mi plan y suscripción →</Link>

        <div className="flex items-center gap-4 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          <UserButton />
          <div>
            <p className="text-base font-bold text-[#f1f3f4]">
              {profile?.displayName ?? user?.fullName ?? "Sin nombre"}
            </p>
            <p className="text-sm text-[#9099a3]">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          <p className="mb-1 text-base font-bold text-[#f1f3f4]">Meta semanal</p>
          <p className="mb-4 text-sm text-[#9099a3]">
            Cuántos entrenamientos por semana quieres completar. Se usa en &quot;Tu progreso&quot; del Inicio.
          </p>
          <form action={updateWeeklyGoalAction} className="flex items-center gap-3">
            <input
              type="number"
              name="weeklyGoal"
              min={1}
              max={14}
              defaultValue={profile?.weeklyGoal ?? 4}
              className="min-h-[48px] w-28 rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-4 text-base text-[#f1f3f4] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
            />
            <button
              type="submit"
              className="min-h-[48px] rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d]"
            >
              Guardar
            </button>
          </form>
        </div>

        <PushNotificationToggle />
        <section className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          <h2 className="font-bold">Pausa automática</h2>
          <p className="mt-2 text-sm text-[#9099a3]">El contador se pausa después de este tiempo sin registrar una serie. Funciona aunque cierres la aplicación y conserva tu avance.</p>
          <form action={saveAutoPauseAction} className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm">Tiempo de inactividad
              <select name="minutes" defaultValue={profile?.autoPauseMinutes ?? 15} className="ml-2 rounded-lg bg-[#0d0f12] p-3">
                <option value="0">Desactivada</option>
                {[5, 10, 15, 20, 30, 60].map(minutes => <option key={minutes} value={minutes}>{minutes} minutos</option>)}
              </select>
            </label>
            <button className="rounded-lg bg-[#22c55e] px-4 py-3 text-sm font-bold text-black">Guardar</button>
          </form>
        </section>
        <MyExercises exercises={exercises} />

        <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          <p className="mb-1 text-base font-bold text-[#f1f3f4]">Peso corporal</p>
          <p className="mb-4 text-sm text-[#9099a3]">
            Registra tu peso para ver tu progreso físico en el tiempo.
          </p>
          <form action={logBodyWeightAction} className="flex items-center gap-3">
            <input
              type="number"
              name="weightKg"
              step="0.1"
              min={0}
              max={500}
              required
              placeholder="kg"
              className="min-h-[48px] w-28 rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-4 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
            />
            <button
              type="submit"
              className="min-h-[48px] rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d]"
            >
              Registrar
            </button>
          </form>

          {weightHistory.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 border-t border-[#2a2f37] pt-4">
              {weightHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#9099a3]">
                    {new Date(entry.recordedAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-semibold text-[#f1f3f4]">{entry.weightKg} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
