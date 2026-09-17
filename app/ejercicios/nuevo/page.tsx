import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { customExercisesEnabled } from "@/lib/custom-exercises";
import NewExerciseForm from "./NewExerciseForm";

export const metadata = { title: "Nuevo ejercicio — Sakatl" };

export default async function NewExercisePage() {
  const user = await currentUser();
  return <main className="min-h-screen bg-[#0d0f12] px-5 py-10 text-[#f1f3f4]">
    <div className="mx-auto max-w-2xl">
      <Link href="/ejercicios" className="text-sm text-[#9099a3]">← Biblioteca de ejercicios</Link>
      <h1 className="mt-6 text-3xl font-extrabold">Agregar ejercicio</h1>
      <p className="mb-8 mt-3 text-[#9099a3]">Comparte la técnica y los pasos para que toda la comunidad pueda entrenar con tu ejercicio.</p>
      {!user ? <p>Para publicar un ejercicio, <Link href="/sign-in?redirect_url=%2Fejercicios%2Fnuevo" className="text-[#4ade80] underline">inicia sesión o crea una cuenta</Link>.</p>
        : !customExercisesEnabled() ? <p role="status" className="rounded-xl bg-[#1c2026] p-5 text-[#9099a3]">La creación de ejercicios estará disponible próximamente.</p>
        : <NewExerciseForm />}
    </div>
  </main>;
}
