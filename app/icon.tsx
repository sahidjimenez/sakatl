import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0f12",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11"
            stroke="#4ade80"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    size,
  );
}
