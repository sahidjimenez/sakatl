import { ImageResponse } from "next/og.js";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BG = "#0d0f12";
const ACCENT = "#4ade80";

// Dumbbell glyph — same mark used as the training-photo placeholder on Home.
function dumbbell(size) {
  return {
    type: "svg",
    props: {
      width: size * 0.56,
      height: size * 0.56,
      viewBox: "0 0 24 24",
      fill: "none",
      children: [
        {
          type: "path",
          props: {
            d: "M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11",
            stroke: ACCENT,
            strokeWidth: 2.4,
            strokeLinecap: "round",
            fill: "none",
          },
        },
      ],
    },
  };
}

function iconTree(size) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
      },
      children: [dumbbell(size)],
    },
  };
}

async function renderPng(size) {
  const response = new ImageResponse(iconTree(size), { width: size, height: size });
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

const outDir = path.join(process.cwd(), "public", "icons");
await mkdir(outDir, { recursive: true });

for (const size of [192, 512]) {
  const buffer = await renderPng(size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  await writeFile(outPath, buffer);
  console.log(`wrote ${outPath} (${buffer.byteLength} bytes)`);
}
