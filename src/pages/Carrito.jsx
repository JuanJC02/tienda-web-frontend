import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Carrito.css";

// ── Cambia este número por el WhatsApp del negocio (sin +, sin espacios) ──
const WHATSAPP_NUMBER = "573001234567";

const METODOS_PAGO = [
  {
    id: "efectivo",
    label: "Efectivo al repartidor",
    icon: "💵",
    desc: "Paga en efectivo cuando llegue tu pedido.",
  },
  {
    id: "whatsapp",
    label: "Pago por WhatsApp",
    icon: "💬",
    desc: "Te enviamos los detalles de pago por WhatsApp antes de la entrega.",
  },
];

function genOrderId() {
  return `EMP-${Math.floor(Math.random() * 90000 + 10000)}`;
}

export default function Carrito({ setPage }) {
  const { items, removeItem, updateCantidad, clearCart, total } = useCart();
  const { user, useCodigo, addPedido } = useAuth();

  const [step, setStep] = useState("carrito");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "", ciudad: "", notas: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Código de descuento
  const [codigoInput, setCodigoInput] = useState("");
  const [codigoAplicado, setCodigoAplicado] = useState(null);
  const [codigoError, setCodigoError] = useState("");

  const envio = total > 50000 ? 0 : 4500;
  const descuento = codigoAplicado ? Math.round(total * codigoAplicado.porcentaje / 100) : 0;
  const totalFinal = total + envio - descuento;

  const aplicarCodigo = () => {
    setCodigoError("");
    const trimmed = codigoInput.trim().toUpperCase();
    if (!trimmed) { setCodigoError("Ingresa un código"); return; }
    const found = user?.codigos?.find((c) => c.codigo === trimmed);
    if (!found) { setCodigoError("Código inválido o no disponible"); return; }
    setCodigoAplicado(found);
  };

  const quitarCodigo = () => { setCodigoAplicado(null); setCodigoInput(""); setCodigoError(""); };

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
    await new Promise((r) => setTimeout(r, 1200));
    const id = genOrderId();
    setOrderId(id);
    await addPedido({
      id,
      fecha: new Date().toLocaleDateString("es-CO"),
      items: items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      total: totalFinal,
      metodoPago,
      descuento: codigoAplicado ? `${codigoAplicado.porcentaje}% (${codigoAplicado.codigo})` : null,
      direccion: form.direccion,
      ciudad: form.ciudad,
    });
    if (codigoAplicado) await useCodigo(codigoAplicado.codigo);

    // Si eligió WhatsApp, abrir chat con el resumen del pedido
    if (metodoPago === "whatsapp") {
      const resumen = items.map((i) => `• ${i.cantidad}x ${i.nombre}`).join("\n");
      const msg = encodeURIComponent(
        `Hola! Quiero hacer un pedido 🫓\n\n${resumen}\n\nTotal: $${totalFinal.toLocaleString("es-CO")}\nDirección: ${form.direccion}, ${form.ciudad}\nPedido: ${id}`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    }

    clearCart();
    setLoading(false);
    setStep("confirmado");
  };

  /* ── CONFIRMADO ── */
  if (step === "confirmado") {
    return (
      <main className="carrito-page">
        <div className="confirmado">
          <div className="confirmado-icon">{metodoPago === "whatsapp" ? "💬" : "🎉"}</div>
          <h2>¡Pedido confirmado!</h2>
          {metodoPago === "whatsapp" ? (
            <p>Se abrió WhatsApp con el resumen de tu pedido. Envía el mensaje para coordinar el pago y la entrega.</p>
          ) : (
            <p>Tu pedido llegará en aproximadamente <b>30–45 minutos</b>. Paga en efectivo al repartidor.</p>
          )}
          <div className="confirmado-num">{orderId}</div>
          <p className="confirmado-hint">Puedes ver tu historial de compras en <b>Mi Perfil</b>.</p>
          <div className="confirmado-actions">
            <button className="btn-primary" onClick={() => { setStep("carrito"); setPage("home"); }}>Volver al inicio</button>
            <button className="btn-outline" onClick={() => { setStep("carrito"); setPage("catalogo"); }}>Seguir comprando</button>
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
          {[{ id: "carrito", label: "Carrito", num: 1 }, { id: "checkout", label: "Datos de envío", num: 2 }].map((s) => (
            <div key={s.id} className={`step ${step === s.id ? "active" : ""} ${step === "checkout" && s.id === "carrito" ? "done" : ""}`}>
              <span className="step-num">{step === "checkout" && s.id === "carrito" ? "✓" : s.num}</span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="carrito-body">
        {/* ── STEP 1 ── */}
        {step === "carrito" && (
          <div className="carrito-layout">
            <div className="carrito-items">
              <div className="carrito-header">
                <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Tu <span>carrito</span></h2>
                {items.length > 0 && <button className="clear-btn" onClick={clearCart}>🗑 Vaciar</button>}
              </div>

              {items.length === 0 ? (
                <div className="empty-cart">
                  <span>🫙</span>
                  <h3>Tu carrito está vacío</h3>
                  <p>Agrega empanadas desde nuestro catálogo o crea la tuya.</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="btn-primary" onClick={() => setPage("catalogo")}>Ver catálogo</button>
                    <button className="btn-outline" onClick={() => setPage("creador")}>Crear empanada 🎨</button>
                  </div>
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
                      <div className="ci-subtotal">${(item.precio * item.cantidad).toLocaleString("es-CO")}</div>
                      <button className="ci-remove" onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="order-summary">
                <h3>Resumen</h3>
                <div className="summary-lines">
                  <div className="summary-line"><span>Subtotal ({items.reduce((s, i) => s + i.cantidad, 0)} items)</span><span>${total.toLocaleString("es-CO")}</span></div>
                  <div className="summary-line"><span>Domicilio</span><span className={envio === 0 ? "free" : ""}>{envio === 0 ? "¡Gratis!" : `$${envio.toLocaleString("es-CO")}`}</span></div>
                  {total < 50000 && <div className="free-shipping-hint">🚴 Faltan ${(50000 - total).toLocaleString("es-CO")} para domicilio gratis</div>}
                  <div className="summary-divider" />
                  <div className="summary-line total"><span>Total</span><span>${(total + envio).toLocaleString("es-CO")}</span></div>
                </div>
                <button className="btn-primary" style={{ width: "100%", padding: "15px" }} onClick={() => setStep("checkout")}>
                  Continuar con el pago →
                </button>
                <button className="btn-outline" style={{ width: "100%", marginTop: 10 }} onClick={() => setPage("catalogo")}>
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === "checkout" && (
          <div className="carrito-layout">
            <div className="checkout-form">
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Datos de <span>envío</span></h2>

              <div className="checkout-fields">
                {[
                  { name: "nombre",    label: "Nombre completo",     placeholder: "Tu nombre" },
                  { name: "telefono",  label: "Celular",              placeholder: "300 000 0000" },
                  { name: "direccion", label: "Dirección de entrega", placeholder: "Cra 43A #1-50, Apto 301" },
                  { name: "ciudad",    label: "Ciudad",               placeholder: "Medellín" },
                ].map((f) => (
                  <div className="field" key={f.name}>
                    <label className="field-label">{f.label}</label>
                    <input
                      type="text"
                      className={`field-input ${errors[f.name] ? "error" : ""}`}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={(e) => { setForm((p) => ({ ...p, [f.name]: e.target.value })); setErrors((p) => ({ ...p, [f.name]: "" })); }}
                    />
                    {errors[f.name] && <span className="field-error">⚠ {errors[f.name]}</span>}
                  </div>
                ))}
                <div className="field">
                  <label className="field-label">Notas adicionales (opcional)</label>
                  <textarea className="field-input" placeholder="Ej: Timbre dañado, llamar al llegar..." rows={2} value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} style={{ resize: "vertical" }} />
                </div>
              </div>

              {/* Código de descuento */}
              <div className="descuento-section">
                <h3>Código de descuento</h3>
                {codigoAplicado ? (
                  <div className="codigo-aplicado">
                    <span>✅ <b>{codigoAplicado.codigo}</b> — {codigoAplicado.porcentaje}% aplicado</span>
                    <button className="quitar-codigo" onClick={quitarCodigo}>✕ Quitar</button>
                  </div>
                ) : (
                  <div className="codigo-input-wrap">
                    <input type="text" className="field-input codigo-input" placeholder="EMP10-XXXXX" value={codigoInput}
                      onChange={(e) => { setCodigoInput(e.target.value.toUpperCase()); setCodigoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && aplicarCodigo()} />
                    <button className="btn-outline" onClick={aplicarCodigo} style={{ padding: "12px 18px", whiteSpace: "nowrap" }}>Aplicar</button>
                  </div>
                )}
                {codigoError && <span className="field-error">⚠ {codigoError}</span>}
                {user?.codigos?.length > 0 && !codigoAplicado && (
                  <div className="codigos-disponibles">
                    <small>Tus códigos disponibles:</small>
                    <div className="codigos-chips">
                      {user.codigos.map((c) => (
                        <button key={c.codigo} className="codigo-chip" onClick={() => setCodigoInput(c.codigo)}>
                          {c.codigo} ({c.porcentaje}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div className="pago-section">
                <h3>Método de pago</h3>
                <div className="metodos-pago">
                  {METODOS_PAGO.map((m) => (
                    <label key={m.id} className={`metodo-card ${metodoPago === m.id ? "selected" : ""}`}>
                      <input type="radio" name="pago" value={m.id} checked={metodoPago === m.id} onChange={() => setMetodoPago(m.id)} style={{ display: "none" }} />
                      <span className="metodo-icon">{m.icon}</span>
                      <div className="metodo-texto">
                        <span className="metodo-label">{m.label}</span>
                        <span className="metodo-desc">{m.desc}</span>
                      </div>
                      {metodoPago === m.id && <span className="metodo-check">✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="checkout-btns">
                <button className="btn-outline" onClick={() => setStep("carrito")}>← Volver</button>
                <button className="btn-primary" style={{ flex: 1, padding: "16px" }} onClick={handlePedido} disabled={loading}>
                  {loading ? "⏳ Procesando..." : metodoPago === "whatsapp"
                    ? `💬 Confirmar y abrir WhatsApp · $${totalFinal.toLocaleString("es-CO")}`
                    : `Confirmar pedido · $${totalFinal.toLocaleString("es-CO")}`}
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
                    <div><b>{i.nombre}</b><small>x{i.cantidad} · ${(i.precio * i.cantidad).toLocaleString("es-CO")}</small></div>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-lines">
                <div className="summary-line"><span>Subtotal</span><span>${total.toLocaleString("es-CO")}</span></div>
                <div className="summary-line"><span>Domicilio</span><span className={envio === 0 ? "free" : ""}>{envio === 0 ? "¡Gratis!" : `$${envio.toLocaleString("es-CO")}`}</span></div>
                {codigoAplicado && (
                  <div className="summary-line" style={{ color: "#2ECC71" }}>
                    <span>Descuento {codigoAplicado.porcentaje}%</span>
                    <span>−${descuento.toLocaleString("es-CO")}</span>
                  </div>
                )}
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
