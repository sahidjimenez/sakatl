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
      controls={false}
      clickToPlay={false}
      showVolumeControls={false}
      allowFullscreen={false}
      acknowledgeRemotionLicense
    />
  );
}
