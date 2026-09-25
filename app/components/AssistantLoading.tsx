"use client";

import { Player } from "@remotion/player";
import { AssistantLoadingComposition } from "./AssistantLoadingComposition";

export function AssistantLoading() {
  return (
    <div
      role="status"
      aria-label="Preparando respuesta"
      className="mr-auto rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-3 py-2"
    >
      {/* Composición a 2x del tamaño mostrado para que los puntos se vean nítidos. */}
      <Player
        component={AssistantLoadingComposition}
        durationInFrames={36}
        fps={30}
        compositionWidth={112}
        compositionHeight={40}
        style={{ width: 56, height: 20 }}
        loop
        autoPlay
        // Igual que AssistantChatPlayer: sin esto Chrome congela el autoplay en el frame 0.
        initiallyMuted
        controls={false}
        clickToPlay={false}
        showVolumeControls={false}
        allowFullscreen={false}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
