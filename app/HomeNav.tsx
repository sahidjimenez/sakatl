"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasGuestData } from "@/lib/guest/storage";

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsGuest(hasGuestData());
  }, []);

  return (
    <nav className="nav">
      <span className="nav-brand">Sakatl</span>

      <button
        type="button"
        className={`nav-toggle ${open ? "nav-toggle-open" : ""}`}
        aria-expanded={open}
        aria-controls="nav-links"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div id="nav-links" className={`nav-links ${open ? "nav-links-open" : ""}`}>
        <a href="#rutinas" aria-current="location" onClick={close}>
          Rutinas
        </a>
        <a href="#comunidad" onClick={close}>
          Comunidad
        </a>
        <a href="#registro" onClick={close}>
          Registro
        </a>
        <Link href="/ejercicios" onClick={close}>
          Ejercicios
        </Link>
        {isGuest && (
          <Link href="/invitado" onClick={close}>
            <button type="button" className="btn btn-ghost btn-glow">
              Invitado
            </button>
          </Link>
        )}
        <Link href="/sign-in" onClick={close}>
          <button type="button" className="btn btn-ghost">
            Entrar
          </button>
        </Link>
      </div>
    </nav>
  );
}
