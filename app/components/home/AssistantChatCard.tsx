export function AssistantChatCard() {
  return (
    <div className="chat-card">
      <div className="chat-head">
        <span className="chat-avatar">S</span>
        <span className="chat-name">Asistente Sakatl</span>
        <span className="chat-status">EN LÍNEA</span>
      </div>
      <div className="chat-messages">
        <div className="msg msg-user">Quiero empujar pecho y hombro, 3 días, tengo 50 minutos</div>
        <div className="msg msg-bot">
          Te armé <span className="hl">Push A</span> con 4 bloques: press banca, una bi-serie de hombro, fondos y
          accesorios. Entra en 48 min con descansos de 90 s.
        </div>
        <div className="msg msg-plan">
          <div className="plan-header">
            <span className="plan-name">Push A · 4 bloques</span>
            <span className="plan-time">48 min</span>
          </div>
          <div className="plan-chips">
            <span className="chip">Press banca 4×8</span>
            <span className="chip">Bi-serie hombro</span>
            <span className="chip">Fondos 3×10</span>
            <span className="chip">Tríceps 3×12</span>
          </div>
          <div className="plan-actions">
            <span className="btn-save">Guardar rutina</span>
            <span className="btn-adjust">Ajustar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
