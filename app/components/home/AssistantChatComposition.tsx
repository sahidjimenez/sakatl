"use client";

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const CARD_INTRO = 15;
const USER_MSG_FRAME = 25;
const TYPING_START = 55;
const TYPING_END = 85;
const BOT_MSG_FRAME = 85;
const PLAN_FRAME = 128;
const CHIP_START = 144;
const CHIP_STAGGER = 8;
const ACTIONS_FRAME = 182;

const CHIPS = ["Press banca 4×8", "Bi-serie hombro", "Fondos 3×10", "Tríceps 3×12"];

const DISPLAY_FONT = "var(--font-archivo), Archivo, sans-serif";
const MONO_FONT = "var(--font-jetbrains-mono), monospace";
const BODY_FONT = "var(--font-manrope), Manrope, system-ui, sans-serif";

function useEnter(startFrame: number, damping = 16) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  const progress = spring({ frame: elapsed, fps, config: { damping }, durationInFrames: 18 });
  const opacity = interpolate(elapsed, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(progress, [0, 1], [14, 0]);
  return { visible: elapsed >= 0, opacity, translateY };
}

function TypingDots() {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 5,
        padding: "13px 15px",
        borderRadius: "14px 14px 14px 4px",
        background: "rgba(255,255,255,.045)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#9aa39d",
            display: "inline-block",
            opacity: interpolate((frame + i * 6) % 24, [0, 12, 24], [0.35, 1, 0.35]),
            transform: `translateY(${interpolate((frame + i * 6) % 24, [0, 12, 24], [0, -3, 0])}px)`,
          }}
        />
      ))}
    </div>
  );
}

function Chip({ index, text }: { index: number; text: string }) {
  const { visible, opacity, translateY } = useEnter(CHIP_START + index * CHIP_STAGGER);
  if (!visible) return null;
  return (
    <span
      style={{
        fontSize: 11.5,
        padding: "5px 9px",
        borderRadius: 7,
        background: "#0d100f",
        color: "#9aa39d",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </span>
  );
}

export function AssistantChatComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEnter = spring({ frame, fps, config: { damping: 16 }, durationInFrames: CARD_INTRO });
  const cardOpacity = interpolate(frame, [0, CARD_INTRO], [0, 1], { extrapolateRight: "clamp" });

  const userMsg = useEnter(USER_MSG_FRAME);
  const showTyping = frame >= TYPING_START && frame < TYPING_END;
  const botMsg = useEnter(BOT_MSG_FRAME);
  const plan = useEnter(PLAN_FRAME);
  const actions = useEnter(ACTIONS_FRAME);

  const dotPulse = interpolate(frame % 55, [0, 27, 55], [0.55, 1, 0.55]);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #111514, #0b0d0c)" }}>
      <AbsoluteFill
        style={{
          padding: 22,
          opacity: cardOpacity,
          transform: `translateY(${interpolate(cardEnter, [0, 1], [16, 0])}px)`,
          fontFamily: BODY_FONT,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 4px 18px",
            borderBottom: "1px solid rgba(255,255,255,.05)",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "rgba(61,220,132,.14)",
              border: "1px solid rgba(61,220,132,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3ddc84",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            S
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f2f5f3" }}>Asistente Sakatl</span>
          <span
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO_FONT,
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "#3ddc84",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 999, background: "#3ddc84", opacity: dotPulse, display: "inline-block" }} />
            EN LÍNEA
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {userMsg.visible && (
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "78%",
                padding: "12px 15px",
                borderRadius: "14px 14px 4px 14px",
                background: "#3ddc84",
                color: "#06210f",
                fontSize: 13.5,
                lineHeight: 1.5,
                fontWeight: 600,
                opacity: userMsg.opacity,
                transform: `translateY(${userMsg.translateY}px)`,
              }}
            >
              Quiero empujar pecho y hombro, 3 días, tengo 50 minutos
            </div>
          )}

          {showTyping && <TypingDots />}

          {botMsg.visible && (
            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "86%",
                padding: "12px 15px",
                borderRadius: "14px 14px 14px 4px",
                background: "rgba(255,255,255,.045)",
                border: "1px solid rgba(255,255,255,.06)",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "#cfd6d2",
                opacity: botMsg.opacity,
                transform: `translateY(${botMsg.translateY}px)`,
              }}
            >
              Te armé <span style={{ color: "#3ddc84", fontWeight: 700 }}>Push A</span> con 4 bloques: press
              banca, una bi-serie de hombro, fondos y accesorios. Entra en 48 min con descansos de 90 s.
            </div>
          )}

          {plan.visible && (
            <div
              style={{
                alignSelf: "flex-start",
                width: "100%",
                padding: 14,
                borderRadius: 14,
                background: "rgba(61,220,132,.05)",
                border: "1px solid rgba(61,220,132,.22)",
                opacity: plan.opacity,
                transform: `translateY(${plan.translateY}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
                <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 14.5, color: "#f2f5f3" }}>
                  Push A · 4 bloques
                </span>
                <span style={{ fontFamily: MONO_FONT, fontSize: 10.5, color: "#3ddc84" }}>48 min</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CHIPS.map((chip, i) => (
                  <Chip key={chip} index={i} text={chip} />
                ))}
              </div>
              {actions.visible && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 13,
                    opacity: actions.opacity,
                    transform: `translateY(${actions.translateY}px)`,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: 9,
                      borderRadius: 9,
                      background: "#3ddc84",
                      color: "#06210f",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    Guardar rutina
                  </span>
                  <span
                    style={{
                      padding: "9px 14px",
                      borderRadius: 9,
                      border: "1px solid rgba(255,255,255,.12)",
                      fontSize: 12.5,
                      color: "#cfd6d2",
                    }}
                  >
                    Ajustar
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
