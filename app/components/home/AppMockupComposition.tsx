"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type MockSet = { weight: number; reps: number };
type MockExercise = { name: string; sets: MockSet[]; tag?: string };

const EXERCISES: MockExercise[] = [
  {
    name: "Press banca",
    tag: "BI-SERIE",
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
    ],
  },
];

const INTRO_FRAMES = 20;
const FIRST_CHECK_FRAME = 32;
const STAGGER = 20;
const TOAST_FRAME = 150;

const DISPLAY_FONT = "var(--font-archivo), Archivo, sans-serif";
const MONO_FONT = "var(--font-jetbrains-mono), monospace";

function CheckIcon({ progress }: { progress: number }) {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} style={{ opacity: progress }}>
      <path
        d="M4 12l5 5L20 6"
        fill="none"
        stroke="#06210f"
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

function SetRow({ set, index, checkFrame, active }: { set: MockSet; index: number; checkFrame: number; active: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - checkFrame;
  const checkProgress = spring({ frame: elapsed, fps, config: { damping: 14, mass: 0.6 } });
  const checked = elapsed >= 0;
  const weightShown = checked ? interpolate(elapsed, [0, 10], [0, set.weight], { extrapolateRight: "clamp" }) : 0;
  const repsShown = checked ? interpolate(elapsed, [0, 10], [0, set.reps], { extrapolateRight: "clamp" }) : 0;
  const isCurrent = active && !checked;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: "#0d100f",
        border: isCurrent ? "1px solid rgba(61,220,132,.35)" : "1px solid rgba(255,255,255,.05)",
        boxShadow: isCurrent ? "0 0 0 3px rgba(61,220,132,.06)" : "none",
      }}
    >
      <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: isCurrent ? "#3ddc84" : "#6f7873", width: 42 }}>
        Set {index + 1}
      </span>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: checked ? "#f2f5f3" : "#4d5652",
          width: 62,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {checked ? `${weightShown.toFixed(1)} kg` : "— kg"}
      </span>
      <span
        style={{
          fontSize: 12.5,
          color: checked ? "#9aa39d" : "#4d5652",
          flex: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {checked ? `${Math.round(repsShown)} reps` : "— reps"}
      </span>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? `rgba(61, 220, 132, ${Math.min(checkProgress, 1)})` : "transparent",
          border: checked ? "none" : "1.5px solid rgba(255,255,255,.18)",
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

  const toastElapsed = frame - TOAST_FRAME;
  const toastProgress = spring({ frame: toastElapsed, fps, config: { damping: 15, mass: 0.7 } });
  const toastVisible = toastElapsed >= 0;

  // Offset (en sets) al que arranca cada ejercicio, para escalonar los checks
  // sin mutar una variable durante el render.
  const exerciseOffsets = EXERCISES.map((_, i) =>
    EXERCISES.slice(0, i).reduce((sum, prev) => sum + prev.sets.length, 0),
  );

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #111514, #0b0d0c)" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
          opacity,
          transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,.09)",
            background: "linear-gradient(180deg, #101413, #0b0d0c)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontFamily: "var(--font-manrope), Manrope, system-ui, sans-serif",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#3ddc84",
                  display: "inline-block",
                  opacity: interpolate(frame % 55, [0, 27, 55], [0.55, 1, 0.55]),
                }}
              />
              <p style={{ margin: 0, fontFamily: MONO_FONT, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.14em", color: "#3ddc84", textTransform: "uppercase" }}>
                Entrenando
              </p>
            </div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: "#6f7873" }}>
              {Math.floor(frame / fps / 60)
                .toString()
                .padStart(2, "0")}
              :{Math.floor((frame / fps) % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 22, letterSpacing: "-.02em", color: "#f2f5f3" }}>Push Day</div>
            <div style={{ fontSize: 11.5, color: "#6f7873" }}>4 bloques · 12 series</div>
          </div>

          {EXERCISES.map((ex, exIndex) => {
            return (
              <div
                key={ex.name}
                style={{
                  borderRadius: 15,
                  background: "rgba(255,255,255,.028)",
                  border: "1px solid rgba(255,255,255,.05)",
                  padding: 13,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {ex.tag && (
                    <span
                      style={{
                        fontFamily: MONO_FONT,
                        fontSize: 9.5,
                        color: "#3ddc84",
                        border: "1px solid rgba(61,220,132,.3)",
                        borderRadius: 5,
                        padding: "2px 6px",
                      }}
                    >
                      {ex.tag}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: "#f2f5f3" }}>{ex.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ex.sets.map((set, i) => {
                    const checkFrame = FIRST_CHECK_FRAME + (exerciseOffsets[exIndex] + i) * STAGGER;
                    const isActiveGroup = exIndex === 0 && i === ex.sets.length - 1;
                    return <SetRow key={i} set={set} index={i} checkFrame={checkFrame} active={isActiveGroup} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {toastVisible && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: `translate(-50%, ${interpolate(toastProgress, [0, 1], [16, 0])}px)`,
              opacity: Math.min(toastProgress, 1),
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 15px",
              borderRadius: 14,
              background: "#101413",
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 20px 50px -20px rgba(0,0,0,.95)",
              fontFamily: "var(--font-manrope), Manrope, system-ui, sans-serif",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "rgba(61,220,132,.14)",
                color: "#3ddc84",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#f2f5f3" }}>Mariana terminó Push Day</div>
              <div style={{ fontSize: 11, color: "#6f7873" }}>hace 8 minutos</div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
