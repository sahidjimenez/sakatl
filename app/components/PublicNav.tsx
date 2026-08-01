import Link from "next/link";

// Barra de navegación compartida por las secciones públicas fuera de /app
// (modo invitado y comunidad pública), para que no "desaparezca" al pasar
// de una a otra.
export function PublicNav({
  isSignedIn = false,
  active,
}: {
  isSignedIn?: boolean;
  active?: "invitado" | "comunidad";
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#2a2f37] bg-[#0d0f12]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-[clamp(20px,5vw,56px)] py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#22c55e]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11"
                stroke="#08150d"
                strokeWidth={2.4}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="text-lg font-extrabold">Sakatl</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold text-[#9099a3]">
          <Link
            href={isSignedIn ? "/app/rutinas" : "/invitado"}
            className={active === "invitado" ? "text-[#4ade80]" : "hover:text-[#f1f3f4]"}
          >
            Mis rutinas
          </Link>
          <Link
            href="/comunidad"
            className={active === "comunidad" ? "text-[#4ade80]" : "hover:text-[#f1f3f4]"}
          >
            Comunidad
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/app"
              className="rounded-[10px] bg-[#22c55e] px-4 py-2 text-sm font-bold text-[#08150d]"
            >
              Ir a mi cuenta
            </Link>
          ) : (
            <>
              <Link
                href="/invitado/nueva"
                className="rounded-[10px] bg-[#22c55e] px-4 py-2 text-sm font-bold text-[#08150d]"
              >
                + Nueva rutina
              </Link>
              <Link
                href="/sign-up"
                className="rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
