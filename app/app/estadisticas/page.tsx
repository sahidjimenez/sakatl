import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import {
  getBestStreak,
  getExercisePRs,
  getMuscleDistribution,
  getStreakHistory,
  getVolumeHistory,
} from "@/lib/stats";
import { listBodyWeightHistory } from "@/lib/body-metrics";
import { BarChart, HorizontalBarList, LineChart, Sparkline } from "@/app/components/Charts";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

export const metadata: Metadata = {
  title: "Estadísticas — Sakatl",
};

export default async function EstadisticasPage() {
  const userId = await requireUser();
  const [streakHistory, bestStreak, volumeHistory, prs, muscleDistribution, weightHistory] =
    await Promise.all([
      getStreakHistory(userId, 14),
      getBestStreak(userId),
      getVolumeHistory(userId, 8),
      getExercisePRs(userId),
      getMuscleDistribution(userId),
      listBodyWeightHistory(userId, 12),
    ]);

  const volumeChartData = volumeHistory.map((w) => ({
    label: new Date(w.weekStart).toLocaleDateString("es", { day: "numeric", month: "short" }),
    value: w.volumeKg,
  }));

  const weightChartData = [...weightHistory]
    .reverse()
    .map((w) => ({
      label: new Date(w.recordedAt).toLocaleDateString("es", { day: "numeric", month: "short" }),
      value: w.weightKg,
    }));

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold">Estadísticas</h1>
          <p className="mt-1 text-[#9099a3]">Tu progreso a través del tiempo.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
            <p className="mb-1 text-xs text-[#9099a3]">Racha</p>
            <Sparkline data={streakHistory} />
          </div>
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
            <p className="text-xs text-[#9099a3]">Mejor racha</p>
            <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">🏆 {bestStreak}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
            <p className="text-xs text-[#9099a3]">Entrenamientos (8 sem.)</p>
            <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">
              {volumeHistory.reduce((sum, w) => sum + w.sessionsCount, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
            <p className="text-xs text-[#9099a3]">Volumen (8 sem.)</p>
            <p className="mt-1 text-2xl font-extrabold text-[#f1f3f4]">
              {Math.round(volumeHistory.reduce((sum, w) => sum + w.volumeKg, 0)).toLocaleString("es")} kg
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6">
          <p className="mb-4 text-base font-bold text-[#f1f3f4]">Volumen por semana</p>
          <BarChart data={volumeChartData} formatValue={(v) => `${Math.round(v)}`} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6">
            <p className="mb-4 text-base font-bold text-[#f1f3f4]">Peso corporal</p>
            {weightChartData.length > 0 ? (
              <LineChart data={weightChartData} />
            ) : (
              <p className="text-sm text-[#9099a3]">
                Todavía no registraste tu peso. Hazlo desde tu Perfil para ver tu progreso aquí.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6">
            <p className="mb-4 text-base font-bold text-[#f1f3f4]">Distribución muscular (90 días)</p>
            {muscleDistribution.length > 0 ? (
              <HorizontalBarList
                data={muscleDistribution.map((m) => ({ label: m.muscleGroup, value: m.setsCount }))}
              />
            ) : (
              <p className="text-sm text-[#9099a3]">
                Todavía no hay series registradas en los últimos 90 días.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-extrabold">Récords personales</h2>
          {prs.length === 0 ? (
            <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-8 text-center text-sm text-[#9099a3]">
              Todavía no tienes récords registrados. Marca series con peso durante un entrenamiento
              para empezar a verlos aquí.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {prs.map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="flex items-center gap-3 rounded-xl border border-[#2a2f37] bg-[#1c2026] p-4"
                >
                  <ExerciseThumb
                    exerciseId={pr.exerciseId}
                    image={pr.image}
                    name={pr.name}
                    imgClassName="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#f1f3f4]">{pr.name}</p>
                    <p className="text-xs text-[#9099a3]">
                      {pr.maxWeight} kg{pr.reps != null ? ` × ${pr.reps}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
