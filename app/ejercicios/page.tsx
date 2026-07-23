import type { Metadata } from "next";
import { getFilterOptions } from "@/lib/exercises";
import ExerciseLibrary from "./ExerciseLibrary";

export const metadata: Metadata = {
  title: "Biblioteca de ejercicios — Sakatl",
  description: "Busca entre 1,324 ejercicios por músculo, equipo o nombre.",
};

export default function EjerciciosPage() {
  const { categories, equipments } = getFilterOptions();
  return <ExerciseLibrary categories={categories} equipments={equipments} />;
}
