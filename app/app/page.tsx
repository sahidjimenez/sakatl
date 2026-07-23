import Link from "next/link";

export default function AppStub() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#0d0f12] px-6 text-center text-[#f1f3f4]">
      <p className="text-xs font-semibold tracking-wide text-[#9099a3] uppercase">
        Próximamente
      </p>
      <h1 className="text-3xl font-extrabold">La app de rutinas aún no está lista</h1>
      <p className="max-w-md text-[#9099a3]">
        Estamos construyendo la pantalla donde armas y sigues tus rutinas.
        Mientras tanto, puedes explorar la biblioteca de ejercicios.
      </p>
      <div className="flex gap-4">
        <Link href="/ejercicios" className="text-sm font-semibold text-[#4ade80]">
          Ver biblioteca de ejercicios
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#9099a3]">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
