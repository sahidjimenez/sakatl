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
    <>
      <nav className="nav">
        <span className="nav-brand">Sakatl</span>

        <div className="nav-links">
          <a href="#rutinas" aria-current="location">Rutinas</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#registro">Registro</a>
          <Link href="/ejercicios">Ejercicios</Link>
        </div>

        <div className="nav-actions">
          <Link href="/invitado" className={`pill-guest ${isGuest ? "pill-glow" : ""}`}>
            Invitado
          </Link>
          <Link href="/sign-in">
            <button type="button" className="btn btn-enter">Entrar</button>
          </Link>
        </div>

        <button
          type="button"
          className={`nav-toggle ${open ? "nav-toggle-open" : ""}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div id="mobile-menu" className={`mobile-menu ${open ? "mobile-menu-open" : ""}`}>
        <a href="#rutinas" aria-current="location" onClick={close}>Rutinas</a>
        <a href="#comunidad" onClick={close}>Comunidad</a>
        <a href="#registro" onClick={close}>Registro</a>
        <Link href="/ejercicios" onClick={close}>Ejercicios</Link>
        <Link href="/sign-in" onClick={close}>
          <button type="button" className="btn btn-enter">Entrar</button>
        </Link>
      </div>
    </>
  );
}
