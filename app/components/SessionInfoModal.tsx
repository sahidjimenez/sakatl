"use client";

import { IconModalButton } from "@/app/components/IconModalButton";

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.75" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#23272e] pb-2.5 last:border-0 last:pb-0">
      <dt className="text-sm text-[#9099a3]">{label}</dt>
      <dd className="text-sm font-semibold text-[#f1f3f4]">{value}</dd>
    </div>
  );
}

export function SessionInfoModal({
  routineName,
  startedAt,
  completedAt,
  completedSets,
  totalSets,
}: {
  routineName: string;
  startedAt: string | number | Date;
  completedAt?: string | number | Date | null;
  completedSets: number;
  totalSets: number;
}) {
  return (
    <IconModalButton
      icon={<InfoIcon className="h-5 w-5" />}
      ariaLabel="Información de la sesión"
      modalTitle="Información de la sesión"
    >
      <dl className="flex flex-col gap-2.5">
        <Row label="Rutina" value={routineName} />
        <Row label="Empezada" value={new Date(startedAt).toLocaleString("es")} />
        {completedAt && <Row label="Completada" value={new Date(completedAt).toLocaleString("es")} />}
        <Row label="Sets registrados" value={`${completedSets}/${totalSets}`} />
      </dl>
    </IconModalButton>
  );
}
