import type { Metadata } from "next";
import { getFilterOptions } from "@/lib/exercises";
import ExerciseLibrary from "./ExerciseLibrary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biblioteca de ejercicios — Sakatl",
  description: "Explora ejercicios por músculo, equipo o nombre y comparte los tuyos con la comunidad.",
};

export default async function EjerciciosPage() {
  const { categories, equipments } = await getFilterOptions();
  return <ExerciseLibrary categories={categories} equipments={equipments} />;
}
