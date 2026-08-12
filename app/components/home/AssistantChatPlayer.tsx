"use client";

import { Player } from "@remotion/player";
import { AssistantChatComposition } from "./AssistantChatComposition";

export function AssistantChatPlayer() {
  return (
    <Player
      component={AssistantChatComposition}
      durationInFrames={260}
      fps={30}
      compositionWidth={520}
      compositionHeight={600}
      style={{ width: "100%", height: "100%" }}
      loop
      autoPlay
      // Sin esto, Chrome bloquea el resume del AudioContext interno del
      // Player sin gesto del usuario y el autoplay se congela en el frame 0
      // (mismo problema que AppMockupPlayer; la composición no tiene audio).
      initiallyMuted
      controls={false}
      clickToPlay={false}
      showVolumeControls={false}
      allowFullscreen={false}
      acknowledgeRemotionLicense
    />
  );
}
