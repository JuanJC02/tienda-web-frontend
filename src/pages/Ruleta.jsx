import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./Ruleta.css";

/* 12 segmentos: 8 "Nada", 2 × 5%, 1 × 10%, 1 × 20% */
const SEGMENTS = [
  { label: "¡Nada!",  color: "#2D1A00", tipo: null },
  { label: "5% OFF",  color: "#C8960A", tipo: "descuento", valor: 5 },
  { label: "¡Nada!",  color: "#3D2A10", tipo: null },
  { label: "¡Nada!",  color: "#241200", tipo: null },
  { label: "10% OFF", color: "#C0392B", tipo: "descuento", valor: 10 },
  { label: "¡Nada!",  color: "#2D1A00", tipo: null },
  { label: "¡Nada!",  color: "#3D2A10", tipo: null },
  { label: "5% OFF",  color: "#A07808", tipo: "descuento", valor: 5 },
  { label: "¡Nada!",  color: "#241200", tipo: null },
  { label: "¡Nada!",  color: "#2D1A00", tipo: null },
  { label: "20% OFF", color: "#7B0000", tipo: "descuento", valor: 20 },
  { label: "¡Nada!",  color: "#3D2A10", tipo: null },
];

const NUM = SEGMENTS.length;
const SEG_DEG = 360 / NUM;
const SPIN_DUR = 4500;

function genCodigo(porcentaje) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return { codigo: `EMP${porcentaje}-${suffix}`, porcentaje };
}

/* SVG Wheel */
function WheelSVG({ rotation, spinning }) {
  const cx = 200, cy = 200, r = 185;

  const segments = SEGMENTS.map((seg, i) => {
    const startDeg = i * SEG_DEG - 90;
    const endDeg = (i + 1) * SEG_DEG - 90;
    const s = startDeg * (Math.PI / 180);
    const e = endDeg * (Math.PI / 180);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const midDeg = (startDeg + endDeg) / 2;
    const m = midDeg * (Math.PI / 180);
    const tr = r * 0.62;
    const tx = cx + tr * Math.cos(m), ty = cy + tr * Math.sin(m);
    return { seg, x1, y1, x2, y2, tx, ty, midDeg };
  });

  return (
    <svg
      width="400" height="400"
      viewBox="0 0 400 400"
      className={`ruleta-svg ${spinning ? "spinning" : ""}`}
      style={{ "--rotation": `${rotation}deg` }}
    >
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="rgba(212,160,23,0.25)" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="rgba(212,160,23,0.1)" strokeWidth="2" />

      <g style={{ transformOrigin: "200px 200px", transform: `rotate(var(--rotation))`, transition: spinning ? `transform ${SPIN_DUR}ms cubic-bezier(0.17, 0.67, 0.08, 1)` : "none" }}>
        {segments.map(({ seg, x1, y1, x2, y2, tx, ty, midDeg }, i) => (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={seg.color}
              stroke="rgba(212,160,23,0.4)"
              strokeWidth="1.5"
            />
            <text
              x={tx} y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={seg.tipo ? "#FFE066" : "#8B7355"}
              fontSize={seg.tipo ? "13" : "10"}
              fontWeight={seg.tipo ? "bold" : "normal"}
              fontFamily="DM Sans, sans-serif"
              transform={`rotate(${midDeg + 90}, ${tx}, ${ty})`}
            >
              {seg.label}
            </text>
          </g>
        ))}
        {/* Center circle */}
        <circle cx={cx} cy={cy} r="28" fill="#1A0F00" stroke="rgba(212,160,23,0.6)" strokeWidth="2.5" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20">🫓</text>
      </g>

      {/* Fixed pointer at top */}
      <polygon points="200,8 192,26 208,26" fill="#D4A017" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />
    </svg>
  );
}

export default function Ruleta() {
  const { user, useSpin, addCodigo } = useAuth();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const currentRotationRef = useRef(0);

  const spinsAvailable = user?.spinsAvailable ?? 0;
  const pedidosCount = user?.pedidos?.length ?? 0;
  const nextSpinIn = pedidosCount % 2 === 0 ? 2 : 2 - (pedidosCount % 2);

  const handleSpin = () => {
    if (spinning || spinsAvailable <= 0) return;
    setResult(null);
    setSpinning(true);

    const winnerIdx = Math.floor(Math.random() * NUM);
    // Ángulo del centro del segmento ganador bajo el puntero
    const targetAngle = (360 - ((winnerIdx + 0.5) * SEG_DEG) % 360) % 360;
    const currentAngle = currentRotationRef.current % 360;
    const extra = ((targetAngle - currentAngle + 360) % 360) || 360;
    const newRotation = currentRotationRef.current + 360 * 8 + extra;

    currentRotationRef.current = newRotation;
    setRotation(newRotation);
    useSpin();

    setTimeout(() => {
      setSpinning(false);
      const winner = SEGMENTS[winnerIdx];
      if (winner.tipo === "descuento") {
        const codigo = genCodigo(winner.valor);
        addCodigo(codigo);
        setResult({ tipo: "premio", winner, codigo });
      } else {
        setResult({ tipo: "nada", winner });
      }
    }, SPIN_DUR + 100);
  };

  return (
    <main className="ruleta-page">
      <div className="ruleta-inner">
        {/* Header */}
        <div className="ruleta-header">
          <span className="badge badge-gold">🎡 Ruleta de premios</span>
          <div className="gold-divider" />
          <h1 className="section-title">Gira y <span>gana</span></h1>
          <p className="section-subtitle">
            Gana giros completando pedidos (1 giro cada 2 pedidos) o recibe el primero ¡gratis!
            La ruleta tiene {SEGMENTS.filter((s) => s.tipo).length} premios ocultos entre {NUM} casillas.
          </p>
        </div>

        <div className="ruleta-content">
          {/* Wheel */}
          <div className="wheel-wrap">
            <WheelSVG rotation={rotation} spinning={spinning} />
          </div>

          {/* Info + controls */}
          <div className="ruleta-side">
            {/* Stats */}
            <div className="spin-stats">
              <div className="spin-stat">
                <span className="spin-stat-num">{spinsAvailable}</span>
                <span className="spin-stat-label">Giros disponibles</span>
              </div>
              <div className="spin-stat">
                <span className="spin-stat-num">{pedidosCount}</span>
                <span className="spin-stat-label">Pedidos realizados</span>
              </div>
              <div className="spin-stat">
                <span className="spin-stat-num">{nextSpinIn}</span>
                <span className="spin-stat-label">Pedidos para próximo giro</span>
              </div>
            </div>

            {/* Spin button */}
            <button
              className={`spin-btn ${spinning ? "spinning" : ""} ${spinsAvailable <= 0 ? "disabled" : ""}`}
              onClick={handleSpin}
              disabled={spinning || spinsAvailable <= 0}
            >
              {spinning ? "⏳ Girando..." : spinsAvailable > 0 ? "🎡 ¡GIRAR!" : "Sin giros disponibles"}
            </button>

            {spinsAvailable <= 0 && !spinning && (
              <p className="no-spins-hint">Completa {nextSpinIn} pedido{nextSpinIn !== 1 ? "s" : ""} más para ganar un giro.</p>
            )}

            {/* Result */}
            {result && (
              <div className={`result-card ${result.tipo === "premio" ? "premio" : "nada"}`}>
                {result.tipo === "premio" ? (
                  <>
                    <div className="result-icon">🎉</div>
                    <h3>¡Ganaste {result.winner.valor}% de descuento!</h3>
                    <div className="result-code">{result.codigo.codigo}</div>
                    <p>El código fue guardado en tu perfil. Úsalo en tu próximo pedido.</p>
                  </>
                ) : (
                  <>
                    <div className="result-icon">😅</div>
                    <h3>¡Nada esta vez!</h3>
                    <p>¡Sigue pidiendo y vuelve a intentarlo! La suerte está de tu lado.</p>
                  </>
                )}
              </div>
            )}

            {/* Prizes legend */}
            <div className="prizes-legend">
              <h4>Premios disponibles</h4>
              {[
                { label: "5% OFF", count: 2, color: "#C8960A" },
                { label: "10% OFF", count: 1, color: "#C0392B" },
                { label: "20% OFF", count: 1, color: "#7B0000" },
              ].map((p) => (
                <div className="prize-row" key={p.label}>
                  <span className="prize-dot" style={{ background: p.color }} />
                  <span className="prize-label">{p.label}</span>
                  <span className="prize-count">{p.count} casilla{p.count > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>

            {/* Existing codes */}
            {user?.codigos?.length > 0 && (
              <div className="my-codes">
                <h4>Mis códigos de descuento</h4>
                {user.codigos.map((c) => (
                  <div key={c.codigo} className="my-code-item">
                    <span className="my-code-val">{c.codigo}</span>
                    <span className="badge badge-gold">{c.porcentaje}% OFF</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
