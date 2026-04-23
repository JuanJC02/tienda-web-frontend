import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./Carrito.css";

const METODOS_PAGO = [
  { id: "tarjeta", label: "Tarjeta de crédito/débito", icon: "💳" },
  { id: "nequi", label: "Nequi / Daviplata", icon: "📱" },
  { id: "efectivo", label: "Efectivo en entrega", icon: "💵" },
  { id: "pse", label: "PSE – Transferencia", icon: "🏦" },
];

export default function Carrito({ setPage }) {
  const { items, removeItem, updateCantidad, clearCart, total } = useCart();
  const [step, setStep] = useState("carrito"); // carrito | checkout | confirmado
  const [metodoPago, setMetodoPago] = useState("nequi");
  const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "", ciudad: "", notas: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const envio = total > 50000 ? 0 : 4500;
  const totalFinal = total + envio;

  const validateCheckout = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    else if (!/^\d{7,10}$/.test(form.telefono.replace(/\s/g, ""))) e.telefono = "Número inválido";
    if (!form.direccion.trim()) e.direccion = "Requerida";
    if (!form.ciudad.trim()) e.ciudad = "Requerida";
    return e;
  };

  const handlePedido = async () => {
    const e = validateCheckout();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // Simula procesamiento
    setLoading(false);
    clearCart();
    setStep("confirmado");
  };

  if (step === "confirmado") {
    return (
      <main className="carrito-page">
        <div className="confirmado">
          <div className="confirmado-icon">🎉</div>
          <h2>¡Pedido confirmado!</h2>
          <p>Tu pedido ha sido recibido. Llegará en aproximadamente <b>30-45 minutos</b>.</p>
          <div className="confirmado-num">Pedido #EMP-{Math.floor(Math.random() * 90000 + 10000)}</div>
          <div className="confirmado-actions">
            <button className="btn-primary" onClick={() => { setStep("carrito"); setPage("home"); }}>
              Volver al inicio
            </button>
            <button className="btn-outline" onClick={() => { setStep("carrito"); setPage("catalogo"); }}>
              Seguir comprando
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="carrito-page">
      {/* Steps */}
      <div className="steps-bar">
        <div className="steps-inner">
          {[
            { id: "carrito", label: "Carrito", num: 1 },
            { id: "checkout", label: "Datos de envío", num: 2 },
          ].map((s) => (
            <div
              key={s.id}
              className={`step ${step === s.id ? "active" : ""} ${step === "checkout" && s.id === "carrito" ? "done" : ""}`}
            >
              <span className="step-num">{step === "checkout" && s.id === "carrito" ? "✓" : s.num}</span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="carrito-body">
        {/* ── STEP 1: CARRITO ── */}
        {step === "carrito" && (
          <div className="carrito-layout">
            <div className="carrito-items">
              <div className="carrito-header">
                <h2 className="section-title" style={{ fontSize: "1.8rem" }}>
                  Tu <span>carrito</span>
                </h2>
                {items.length > 0 && (
                  <button className="clear-btn" onClick={clearCart}>
                    🗑 Vaciar carrito
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="empty-cart">
                  <span>🫙</span>
                  <h3>Tu carrito está vacío</h3>
                  <p>Agrega empanadas desde nuestro catálogo y disfruta del mejor sabor colombiano.</p>
                  <button className="btn-primary" onClick={() => setPage("catalogo")}>
                    Ver catálogo
                  </button>
                </div>
              ) : (
                <div className="items-list">
                  {items.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.imagen} alt={item.nombre} className="ci-img" />
                      <div className="ci-info">
                        <h4 className="ci-name">{item.nombre}</h4>
                        <span className="ci-unit">${item.precio.toLocaleString("es-CO")} c/u</span>
                      </div>
                      <div className="ci-controls">
                        <button className="qty-btn" onClick={() => updateCantidad(item.id, item.cantidad - 1)}>−</button>
                        <span className="qty-val">{item.cantidad}</span>
                        <button className="qty-btn" onClick={() => updateCantidad(item.id, item.cantidad + 1)}>+</button>
                      </div>
                      <div className="ci-subtotal">
                        ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                      </div>
                      <button className="ci-remove" onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="order-summary">
                <h3>Resumen del pedido</h3>
                <div className="summary-lines">
                  <div className="summary-line">
                    <span>Subtotal ({items.reduce((s, i) => s + i.cantidad, 0)} items)</span>
                    <span>${total.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="summary-line">
                    <span>Domicilio</span>
                    <span className={envio === 0 ? "free" : ""}>{envio === 0 ? "¡Gratis!" : `$${envio.toLocaleString("es-CO")}`}</span>
                  </div>
                  {total < 50000 && (
                    <div className="free-shipping-hint">
                      🚴 Te faltan ${(50000 - total).toLocaleString("es-CO")} para domicilio gratis
                    </div>
                  )}
                  <div className="summary-divider" />
                  <div className="summary-line total">
                    <span>Total</span>
                    <span>${totalFinal.toLocaleString("es-CO")}</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", padding: "16px" }} onClick={() => setStep("checkout")}>
                  Continuar con el pago →
                </button>
                <button className="btn-outline" style={{ width: "100%", marginTop: 10 }} onClick={() => setPage("catalogo")}>
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: CHECKOUT ── */}
        {step === "checkout" && (
          <div className="carrito-layout">
            <div className="checkout-form">
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>
                Datos de <span>envío</span>
              </h2>

              <div className="checkout-fields">
                {[
                  { name: "nombre", label: "Nombre completo", placeholder: "Tu nombre" },
                  { name: "telefono", label: "Número de celular", placeholder: "300 000 0000" },
                  { name: "direccion", label: "Dirección de entrega", placeholder: "Cra 43A #1-50, Apto 301" },
                  { name: "ciudad", label: "Ciudad", placeholder: "Medellín" },
                ].map((f) => (
                  <div className="field" key={f.name}>
                    <label className="field-label">{f.label}</label>
                    <input
                      type="text"
                      className={`field-input ${errors[f.name] ? "error" : ""}`}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, [f.name]: e.target.value }));
                        setErrors((prev) => ({ ...prev, [f.name]: "" }));
                      }}
                    />
                    {errors[f.name] && <span className="field-error">⚠ {errors[f.name]}</span>}
                  </div>
                ))}
                <div className="field">
                  <label className="field-label">Notas adicionales (opcional)</label>
                  <textarea
                    className="field-input"
                    placeholder="Ej: Timbre dañado, llamar al llegar..."
                    rows={3}
                    value={form.notas}
                    onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div className="pago-section">
                <h3>Método de pago</h3>
                <div className="metodos-pago">
                  {METODOS_PAGO.map((m) => (
                    <label key={m.id} className={`metodo-card ${metodoPago === m.id ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="pago"
                        value={m.id}
                        checked={metodoPago === m.id}
                        onChange={() => setMetodoPago(m.id)}
                        style={{ display: "none" }}
                      />
                      <span className="metodo-icon">{m.icon}</span>
                      <span className="metodo-label">{m.label}</span>
                      {metodoPago === m.id && <span className="metodo-check">✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="checkout-btns">
                <button className="btn-outline" onClick={() => setStep("carrito")}>
                  ← Volver
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: "16px" }}
                  onClick={handlePedido}
                  disabled={loading}
                >
                  {loading ? "⏳ Procesando..." : `Confirmar pedido · $${totalFinal.toLocaleString("es-CO")}`}
                </button>
              </div>
            </div>

            {/* Mini resumen */}
            <div className="order-summary">
              <h3>Tu pedido</h3>
              <div className="mini-items">
                {items.map((i) => (
                  <div key={i.id} className="mini-item">
                    <img src={i.imagen} alt={i.nombre} />
                    <div>
                      <b>{i.nombre}</b>
                      <small>x{i.cantidad} · ${(i.precio * i.cantidad).toLocaleString("es-CO")}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-lines">
                <div className="summary-line"><span>Subtotal</span><span>${total.toLocaleString("es-CO")}</span></div>
                <div className="summary-line"><span>Domicilio</span><span className={envio === 0 ? "free" : ""}>{envio === 0 ? "¡Gratis!" : `$${envio.toLocaleString("es-CO")}`}</span></div>
                <div className="summary-divider" />
                <div className="summary-line total"><span>Total</span><span>${totalFinal.toLocaleString("es-CO")}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
