"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const DISPLAY_FONT = "var(--font-archivo), Archivo, sans-serif";
const RING_RADIUS = 260;
const RING_SIZE = 600;

export function CountdownComposition({ label }: { label?: string }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const secondsTotal = Math.round(durationInFrames / fps);
  const secondIndex = Math.min(Math.floor(frame / fps), secondsTotal - 1);
  const number = secondsTotal - secondIndex;
  const frameInSecond = frame - secondIndex * fps;

  const pop = spring({
    frame: frameInSecond,
    fps,
    config: { damping: 12, mass: 0.5 },
    durationInFrames: fps,
  });
  const scale = interpolate(pop, [0, 1], [0.55, 1]);
  const fade = interpolate(frameInSecond, [fps - 8, fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overallProgress = frame / durationInFrames;
  const circumference = 2 * Math.PI * RING_RADIUS;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 700,
          height: 700,
          marginLeft: -350,
          marginTop: -350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0) 70%)",
        }}
      />
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -RING_SIZE / 2, marginTop: -RING_SIZE / 2 }}
      >
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke="#1c2026" strokeWidth={12} fill="none" />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#22c55e"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - overallProgress)}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: fade,
          fontFamily: DISPLAY_FONT,
          fontSize: 280,
          fontWeight: 800,
          color: "#f1f3f4",
          lineHeight: 1,
        }}
      >
        {number}
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            marginTop: RING_SIZE / 2 + 60,
            textAlign: "center",
            fontFamily: DISPLAY_FONT,
            fontSize: 34,
            fontWeight: 600,
            color: "#9099a3",
            padding: "0 60px",
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
}
