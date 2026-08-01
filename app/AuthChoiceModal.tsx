"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { touchGuestMeta } from "@/lib/guest/storage";

export function AuthChoiceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  function continueAsGuest() {
    touchGuestMeta();
    router.push("/invitado/nueva");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">¿Cómo quieres empezar?</h2>
        <p className="modal-lead">
          Inicia sesión para guardar tu progreso, o prueba Sakatl sin cuenta.
        </p>

        <div className="modal-actions">
          <Link href="/sign-in">
            <button type="button" className="btn btn-primary">
              Iniciar sesión
            </button>
          </Link>
        </div>
        <p className="modal-signup-hint">
          ¿No tienes cuenta? <Link href="/sign-up">Regístrate</Link>
        </p>

        <div className="modal-divider">o</div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={continueAsGuest}>
            Continuar como invitado
          </button>
        </div>
        <p className="modal-note">
          Tus rutinas se guardan solo en este navegador durante 14 días. Si quieres conservarlas,
          crea una cuenta.
        </p>
      </div>
    </div>
  );
}
