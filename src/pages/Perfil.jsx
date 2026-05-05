import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Perfil.css";

export default function Perfil({ setPage }) {
  const { user, logout } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState("datos"); // datos | pedidos | codigos

  if (!user) return null;

  const handleLogout = () => { logout(); setPage("login"); };

  return (
    <main className="perfil-page">
      <div className="perfil-inner">
        {/* Header */}
        <div className="perfil-hero">
          <div className="perfil-avatar">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="perfil-hero-info">
            <h1 className="section-title" style={{ fontSize: "2rem" }}>{user.nombre}</h1>
            <p className="section-subtitle" style={{ fontSize: "0.92rem" }}>{user.email}</p>
            <div className="perfil-badges">
              <span className="badge badge-gold">🎡 {user.spinsAvailable} giro{user.spinsAvailable !== 1 ? "s" : ""} disponible{user.spinsAvailable !== 1 ? "s" : ""}</span>
              <span className="badge badge-green">🛒 {user.pedidos.length} pedido{user.pedidos.length !== 1 ? "s" : ""}</span>
              {user.codigos.length > 0 && (
                <span className="badge badge-red">🎟 {user.codigos.length} código{user.codigos.length !== 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
          <button className="btn-outline logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        {/* Tabs */}
        <div className="perfil-tabs">
          {[
            { id: "datos",   label: "Mi cuenta",           icon: "👤" },
            { id: "pedidos", label: `Pedidos (${user.pedidos.length})`, icon: "🛒" },
            { id: "codigos", label: `Descuentos (${user.codigos.length})`, icon: "🎟" },
          ].map((t) => (
            <button
              key={t.id}
              className={`perfil-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── DATOS DE CUENTA ── */}
        {tab === "datos" && (
          <div className="perfil-section">
            <div className="datos-grid">
              {/* Nombre */}
              <div className="dato-card">
                <label className="dato-label">Nombre completo</label>
                <div className="dato-value">{user.nombre}</div>
              </div>

              {/* Email */}
              <div className="dato-card">
                <label className="dato-label">Correo electrónico</label>
                <div className="dato-value">{user.email}</div>
              </div>

              {/* Contraseña */}
              <div className="dato-card">
                <label className="dato-label">Contraseña</label>
                <div className="dato-value dato-pass">
                  <span>{showPass ? user.password : "•".repeat(user.password.length)}</span>
                  <button className="show-pass-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈 Ocultar" : "👁 Mostrar"}
                  </button>
                </div>
              </div>

              {/* Pedidos stats */}
              <div className="dato-card">
                <label className="dato-label">Total de pedidos</label>
                <div className="dato-value dato-highlight">{user.pedidos.length} pedido{user.pedidos.length !== 1 ? "s" : ""}</div>
              </div>

              <div className="dato-card">
                <label className="dato-label">Giros disponibles</label>
                <div className="dato-value dato-highlight">🎡 {user.spinsAvailable}</div>
              </div>

              <div className="dato-card">
                <label className="dato-label">Códigos de descuento</label>
                <div className="dato-value dato-highlight">🎟 {user.codigos.length} activo{user.codigos.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            <div className="perfil-actions">
              <button className="btn-outline" onClick={() => setPage("ruleta")}>🎡 Ir a la Ruleta</button>
              <button className="btn-outline" onClick={() => setPage("galeria")}>📸 Ver Galería</button>
              <button className="btn-primary" onClick={() => setPage("catalogo")}>🛒 Hacer un pedido</button>
            </div>
          </div>
        )}

        {/* ── HISTORIAL DE PEDIDOS ── */}
        {tab === "pedidos" && (
          <div className="perfil-section">
            {user.pedidos.length === 0 ? (
              <div className="empty-state">
                <span>🛒</span>
                <h3>Sin pedidos aún</h3>
                <p>Realiza tu primer pedido y aparecerá aquí con su código de seguimiento.</p>
                <button className="btn-primary" onClick={() => setPage("catalogo")}>Ver catálogo</button>
              </div>
            ) : (
              <div className="pedidos-list">
                {[...user.pedidos].reverse().map((p) => (
                  <div className="pedido-card" key={p.id}>
                    <div className="pedido-header">
                      <div>
                        <span className="pedido-id">{p.id}</span>
                        <span className="pedido-fecha">{p.fecha}</span>
                      </div>
                      <span className="pedido-total">${p.total.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="pedido-items">
                      {p.items.map((item, i) => (
                        <span key={i} className="pedido-item-tag">
                          {item.cantidad}× {item.nombre}
                        </span>
                      ))}
                    </div>
                    {p.descuento && (
                      <div className="pedido-descuento">🎟 Descuento aplicado: {p.descuento}</div>
                    )}
                    <div className="pedido-footer">
                      <span>📍 {p.ciudad} — {p.direccion}</span>
                      <span className="badge badge-green">Entregado</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CÓDIGOS DE DESCUENTO ── */}
        {tab === "codigos" && (
          <div className="perfil-section">
            {user.codigos.length === 0 ? (
              <div className="empty-state">
                <span>🎟</span>
                <h3>Sin códigos de descuento</h3>
                <p>Gira la ruleta o sube la foto más votada de la galería para ganar códigos.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={() => setPage("ruleta")}>🎡 Ir a la Ruleta</button>
                  <button className="btn-outline" onClick={() => setPage("galeria")}>📸 Ver Galería</button>
                </div>
              </div>
            ) : (
              <div className="codigos-grid">
                {user.codigos.map((c) => (
                  <div className="codigo-card" key={c.codigo}>
                    <div className="codigo-pct">{c.porcentaje}%</div>
                    <div className="codigo-label">de descuento</div>
                    <div className="codigo-str">{c.codigo}</div>
                    <p className="codigo-hint">Úsalo en el carrito al hacer tu pedido</p>
                  </div>
                ))}
                <div className="codigo-card new-spin" onClick={() => setPage("ruleta")}>
                  <div className="codigo-pct">🎡</div>
                  <div className="codigo-label">Ganar más</div>
                  <p className="codigo-hint">Gira la ruleta para obtener nuevos códigos</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
