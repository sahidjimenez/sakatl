import Link from "next/link";
import { formatRelativeDate } from "@/lib/format";
import type { HomeCommunityRoutine } from "@/lib/home-community";

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase() || "?";
}

export function CommunityTeaser({ routines }: { routines: HomeCommunityRoutine[] }) {
  if (routines.length === 0) {
    return (
      <div className="community-empty">
        Todavía no hay rutinas públicas. <Link href="/comunidad">Sé el primero en compartir la tuya →</Link>
      </div>
    );
  }

  return (
    <div className="community-list">
      {routines.map((routine) => (
        <Link href="/comunidad" className="community-card" key={routine.id}>
          <div className="community-card-meta">
            <span className="eyebrow">Rutina de la comunidad</span>
            <span className="stamp">{formatRelativeDate(routine.createdAt)}</span>
          </div>
          <h3>{routine.name}</h3>
          <p>{routine.description || "Sin descripción todavía."}</p>
          <div className="community-card-footer">
            <span className="avatar">{initials(routine.ownerDisplayName)}</span>
            <span className="author">por {routine.ownerDisplayName || "alguien de Sakatl"}</span>
            <span className="follow">Ver</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
