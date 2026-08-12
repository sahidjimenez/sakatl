// Glifos geometricos simples que replican los iconos de "Sakatl Home v2.dc.html"
// (el diseño los resuelve con divs/spans, no SVGs).

export function SquareGlyph() {
  return <span style={{ width: 14, height: 14, borderRadius: 4, border: "2px solid #3ddc84", display: "block" }} />;
}

export function CheckGlyph() {
  return <span style={{ fontSize: 16, fontWeight: 800 }}>✓</span>;
}

export function CircleGlyph() {
  return <span style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid #3ddc84", display: "block" }} />;
}

export function PlayGlyph() {
  return <span style={{ fontSize: 13 }}>▶</span>;
}

export function BarsGlyph() {
  return (
    <span style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 16 }}>
      <span style={{ width: 3, height: 7, background: "#3ddc84", borderRadius: 2, display: "block" }} />
      <span style={{ width: 3, height: 12, background: "#3ddc84", borderRadius: 2, display: "block" }} />
      <span style={{ width: 3, height: 16, background: "#3ddc84", borderRadius: 2, display: "block" }} />
    </span>
  );
}
