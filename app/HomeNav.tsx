"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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
        <Link href="/app?view=desktop" onClick={close}>
          <button type="button" className="btn btn-ghost">
            Entrar
          </button>
        </Link>
      </div>
    </nav>
  );
}
