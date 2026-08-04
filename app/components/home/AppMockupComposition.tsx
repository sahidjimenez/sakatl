"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type MockSet = { weight: number; reps: number };
type MockExercise = { name: string; sets: MockSet[] };

const EXERCISES: MockExercise[] = [
  {
    name: "Press banca",
    sets: [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 8 },
      { weight: 62.5, reps: 8 },
    ],
  },
  {
    name: "Remo con barra",
    sets: [
      { weight: 50, reps: 10 },
      { weight: 50, reps: 10 },
      { weight: 52.5, reps: 8 },
    ],
  },
];

const INTRO_FRAMES = 20;
const FIRST_CHECK_FRAME = 32;
const STAGGER = 20;

function CheckIcon({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} style={{ opacity: progress }}>
      <path
        d="M4 12l5 5L20 6"
        fill="none"
        stroke="#08150d"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: interpolate(progress, [0, 1], [24, 0]),
        }}
      />
    </svg>
  );
}

function SetRow({ set, index, checkFrame }: { set: MockSet; index: number; checkFrame: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - checkFrame;
  const checkProgress = spring({ frame: elapsed, fps, config: { damping: 14, mass: 0.6 } });
  const checked = elapsed >= 0;
  const weightShown = checked ? interpolate(elapsed, [0, 10], [0, set.weight], { extrapolateRight: "clamp" }) : 0;
  const repsShown = checked ? interpolate(elapsed, [0, 10], [0, set.reps], { extrapolateRight: "clamp" }) : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 10,
        background: "#0d0f12",
        border: "1px solid #1f232a",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "#9099a3", width: 44 }}>Set {index + 1}</span>
      <span
        style={{
          fontSize: 14,
          color: checked ? "#f1f3f4" : "#3a3f47",
          width: 64,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {checked ? `${weightShown.toFixed(1)} kg` : "— kg"}
      </span>
      <span
        style={{
          fontSize: 14,
          color: checked ? "#f1f3f4" : "#3a3f47",
          flex: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {checked ? `${Math.round(repsShown)} reps` : "— reps"}
      </span>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? `rgba(34, 197, 94, ${Math.min(checkProgress, 1)})` : "transparent",
          border: `1.5px solid ${checked ? "#22c55e" : "#2a2f37"}`,
        }}
      >
        {checked && <CheckIcon progress={checkProgress} />}
      </div>
    </div>
  );
}

export function AppMockupComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 }, durationInFrames: INTRO_FRAMES });
  const opacity = interpolate(frame, [0, INTRO_FRAMES], [0, 1], { extrapolateRight: "clamp" });

  let setCursor = 0;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #1c2026 0%, #14171b 60%, #0d0f12 100%)" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          opacity,
          transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 18,
            border: "1px solid #2a2f37",
            background: "#1c2026",
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: "-apple-system, system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#4ade80", textTransform: "uppercase" }}>
                Entrenando
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#f1f3f4" }}>Push Day</p>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#9099a3",
                border: "1px solid #2a2f37",
                borderRadius: 8,
                padding: "6px 10px",
              }}
            >
              {Math.floor(frame / fps / 60)
                .toString()
                .padStart(2, "0")}
              :{Math.floor((frame / fps) % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {EXERCISES.map((ex) => (
            <div key={ex.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#f1f3f4" }}>{ex.name}</p>
              {ex.sets.map((set, i) => {
                const checkFrame = FIRST_CHECK_FRAME + setCursor * STAGGER;
                setCursor += 1;
                return <SetRow key={i} set={set} index={i} checkFrame={checkFrame} />;
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
