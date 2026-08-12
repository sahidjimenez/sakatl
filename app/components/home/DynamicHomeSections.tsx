"use client";

import dynamic from "next/dynamic";
import { AssistantChatCard } from "./AssistantChatCard";

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

const AssistantChatPlayer = dynamic(() => import("./AssistantChatPlayer").then((m) => m.AssistantChatPlayer), {
  ssr: false,
  // Mientras carga el Player, se ve la version estatica de la tarjeta (mismo
  // contenido, sin animar) en vez de un hueco en blanco.
  loading: () => <AssistantChatCard />,
});

export function DynamicAssistantChat() {
  return <AssistantChatPlayer />;
}
