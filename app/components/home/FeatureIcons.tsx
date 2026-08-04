const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "#4ade80",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LayersIcon() {
  return (
    <svg {...ICON_PROPS} width="24" height="24" aria-hidden="true">
      <path d="M12 3.5l8 4.5-8 4.5-8-4.5 8-4.5Z" />
      <path d="M4 12l8 4.5 8-4.5" />
      <path d="M4 15.5L12 20l8-4.5" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg {...ICON_PROPS} width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.3 2.3 4.7-5.2" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg {...ICON_PROPS} width="24" height="24" aria-hidden="true">
      <circle cx="8.5" cy="8" r="3" />
      <path d="M2.5 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15.5 5.3a3 3 0 0 1 0 5.4" />
      <path d="M17.5 13.8c2.4.5 3.9 2.4 3.9 5.2" />
    </svg>
  );
}

export function PlayCircleIcon() {
  return (
    <svg {...ICON_PROPS} width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.7l5 3.3-5 3.3V8.7Z" fill="#4ade80" stroke="none" />
    </svg>
  );
}
