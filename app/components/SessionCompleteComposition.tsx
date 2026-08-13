"use client";

import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

const DISPLAY_FONT = "var(--font-archivo), Archivo, sans-serif";
const PARTICLE_COUNT = 16;

function Particle({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seed = `celebration-${index}`;
  const angle = random(`${seed}-angle`) * Math.PI * 2;
  const distance = 220 + random(`${seed}-dist`) * 300;
  const size = 7 + random(`${seed}-size`) * 9;
  const delay = random(`${seed}-delay`) * 6;
  const burst = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
  const x = Math.cos(angle) * distance * burst;
  const y = Math.sin(angle) * distance * burst - interpolate(frame, [0, 90], [0, 50]);
  const opacity = interpolate(frame, [0, 10, 55, 90], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const colors = ["#4ade80", "#22c55e", "#f1f3f4"];
  const color = colors[index % colors.length];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        backgroundColor: color,
        opacity,
        transform: `translate(${x}px, ${y}px)`,
      }}
    />
  );
}

export function SessionCompleteComposition({ label, stats }: { label?: string; stats?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkPop = spring({ frame: frame - 4, fps, config: { damping: 11, mass: 0.6 } });
  const checkScale = interpolate(checkPop, [0, 1], [0.4, 1]);
  const ringOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const textPop = spring({ frame: frame - 18, fps, config: { damping: 14, mass: 0.6 } });
  const textOpacity = interpolate(textPop, [0, 1], [0, 1]);
  const textY = interpolate(textPop, [0, 1], [16, 0]);

  const detailOpacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f12" }}>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <Particle key={i} index={i} />
      ))}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 220,
          height: 220,
          marginLeft: -110,
          marginTop: -150,
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          opacity: ringOpacity,
          transform: `scale(${checkScale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width={110} height={110}>
          <path
            d="M4 12.5 9.5 18 20 6.5"
            fill="none"
            stroke="#08150d"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 28,
              strokeDashoffset: interpolate(checkPop, [0, 1], [28, 0]),
            }}
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          marginTop: 90,
          textAlign: "center",
          fontFamily: DISPLAY_FONT,
          fontSize: 46,
          fontWeight: 800,
          color: "#f1f3f4",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        ¡Sesión completada!
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            marginTop: 150,
            textAlign: "center",
            fontFamily: DISPLAY_FONT,
            fontSize: 26,
            fontWeight: 600,
            color: "#9099a3",
            opacity: detailOpacity,
            padding: "0 60px",
          }}
        >
          {label}
        </div>
      )}
      {stats && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            marginTop: 194,
            textAlign: "center",
            fontFamily: DISPLAY_FONT,
            fontSize: 22,
            fontWeight: 700,
            color: "#4ade80",
            opacity: detailOpacity,
          }}
        >
          {stats}
        </div>
      )}
    </AbsoluteFill>
  );
}
