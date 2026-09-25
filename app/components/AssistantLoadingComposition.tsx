"use client";

import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const DOT_SIZE = 12;
const DOT_GAP = 10;
const DOT_STAGGER = 6;

export function AssistantLoadingComposition() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: DOT_GAP }}>
      {[0, 1, 2].map((i) => {
        // Fase desfasada por punto; el módulo hace que el loop cierre sin salto.
        const phase = (frame - i * DOT_STAGGER + durationInFrames) % durationInFrames;
        const wave = interpolate(phase, [0, 9, 18, durationInFrames], [0, 1, 0, 0], {
          easing: Easing.inOut(Easing.sin),
        });
        return (
          <span
            key={i}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: 999,
              background: "#4ade80",
              opacity: interpolate(wave, [0, 1], [0.35, 1]),
              transform: `translateY(${interpolate(wave, [0, 1], [0, -8])}px) scale(${interpolate(wave, [0, 1], [0.85, 1.1])})`,
              boxShadow: `0 0 ${interpolate(wave, [0, 1], [0, 10])}px rgba(74,222,128,0.6)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
