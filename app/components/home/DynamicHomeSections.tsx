"use client";

import dynamic from "next/dynamic";

// @remotion/player solo debe correr en el navegador (usa APIs que difieren
// entre server y client render), asi que se carga sin SSR para evitar
// mismatch de hidratacion. `ssr: false` en next/dynamic solo esta permitido
// desde un Client Component, por eso este wrapper existe.
const AppMockupPlayer = dynamic(() => import("./AppMockupPlayer").then((m) => m.AppMockupPlayer), {
  ssr: false,
  loading: () => <div className="mockup-fallback" />,
});

export function DynamicAppMockup() {
  return <AppMockupPlayer />;
}
