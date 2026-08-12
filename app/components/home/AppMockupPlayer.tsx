"use client";

import { Player } from "@remotion/player";
import { AppMockupComposition } from "./AppMockupComposition";

export function AppMockupPlayer() {
  return (
    <Player
      component={AppMockupComposition}
      durationInFrames={210}
      fps={30}
      compositionWidth={986}
      compositionHeight={660}
      style={{ width: "100%", height: "100%" }}
      loop
      autoPlay
      // La composición no tiene audio, pero el Player crea un AudioContext
      // igual para el reloj de reproducción. Sin este mute, Chrome bloquea
      // el resume del AudioContext hasta un gesto del usuario y el autoplay
      // se queda congelado en el frame 0 (ver usePlayback.queueNextFrame).
      initiallyMuted
      controls={false}
      clickToPlay={false}
      showVolumeControls={false}
      allowFullscreen={false}
      acknowledgeRemotionLicense
    />
  );
}
