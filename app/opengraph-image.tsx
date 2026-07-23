import { ImageResponse } from "next/og";

export const alt = "Sakatl — rutinas que se hacen juntos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background:
            "linear-gradient(135deg, #14171b 0%, #0d0f12 55%, #0d0f12 100%)",
          fontFamily: "-apple-system, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1c2026",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11"
                stroke="#4ade80"
                strokeWidth={2.4}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#f1f3f4" }}>
            Sakatl
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#f1f3f4",
            }}
          >
            Tu rutina.
          </span>
          <span
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#4ade80",
            }}
          >
            Su ritmo.
          </span>
        </div>

        <span style={{ fontSize: 26, color: "#9099a3" }}>
          Rutinas que se hacen juntos.
        </span>
      </div>
    ),
    size,
  );
}
