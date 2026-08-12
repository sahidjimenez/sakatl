export function BuilderDemo() {
  return (
    <div className="builder-demo">
      <div className="builder-row">
        <span className="tag">A1</span>
        <span className="name">Sentadilla</span>
        <span className="scheme">4×8</span>
      </div>
      <div className="builder-group">
        <div className="group-label">TRI-SERIE</div>
        <div className="builder-row">
          <span className="tag">B1</span>
          <span className="name">Curl</span>
          <span className="scheme">3×12</span>
        </div>
        <div className="builder-row">
          <span className="tag">B2</span>
          <span className="name">Fondos</span>
          <span className="scheme">3×10</span>
        </div>
        <div className="builder-row">
          <span className="tag">B3</span>
          <span className="name">Elevaciones</span>
          <span className="scheme">3×15</span>
        </div>
      </div>
      <div className="builder-row">
        <span className="tag">C1</span>
        <span className="name">Plancha</span>
        <span className="scheme">3×45s</span>
      </div>
    </div>
  );
}
