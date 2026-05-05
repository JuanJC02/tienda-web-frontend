import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./CreadorEmpanada.css";

const PRECIO_BASE = 2500;

const CATEGORIAS = [
  {
    id: "proteinas",
    label: "Proteínas",
    icon: "🥩",
    max: 2,
    items: [
      { id: "pollo",    nombre: "Pollo desmechado",    precio: 1500, emoji: "🍗" },
      { id: "carne",    nombre: "Carne molida",         precio: 1800, emoji: "🥩" },
      { id: "camaron",  nombre: "Camarón",              precio: 2500, emoji: "🦐" },
      { id: "chorizo",  nombre: "Chorizo",              precio: 1200, emoji: "🌭" },
      { id: "atun",     nombre: "Atún",                 precio: 1400, emoji: "🐟" },
    ],
  },
  {
    id: "verduras",
    label: "Verduras",
    icon: "🥬",
    max: 3,
    items: [
      { id: "papa",      nombre: "Papa criolla",             precio: 500, emoji: "🥔" },
      { id: "champinon", nombre: "Champiñón",                precio: 800, emoji: "🍄" },
      { id: "espinaca",  nombre: "Espinaca",                 precio: 600, emoji: "🥬" },
      { id: "pimenton",  nombre: "Pimentón",                 precio: 400, emoji: "🫑" },
      { id: "cebolla",   nombre: "Cebolla caramelizada",     precio: 500, emoji: "🧅" },
    ],
  },
  {
    id: "quesos",
    label: "Quesos",
    icon: "🧀",
    max: 1,
    items: [
      { id: "campesino",  nombre: "Queso campesino",  precio: 700, emoji: "🧀" },
      { id: "mozzarella", nombre: "Mozzarella",        precio: 800, emoji: "🧀" },
      { id: "doble",      nombre: "Doble crema",       precio: 900, emoji: "🧀" },
    ],
  },
  {
    id: "salsas",
    label: "Salsas",
    icon: "🍅",
    max: 2,
    items: [
      { id: "hogao",      nombre: "Hogao casero",  precio: 400, emoji: "🍅" },
      { id: "guacamole",  nombre: "Guacamole",     precio: 600, emoji: "🥑" },
      { id: "aji",        nombre: "Ají picante",   precio: 300, emoji: "🌶️" },
      { id: "chimichurri",nombre: "Chimichurri",   precio: 500, emoji: "🌿" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    icon: "✨",
    max: 2,
    items: [
      { id: "aguacate",  nombre: "Aguacate fresco",      precio: 800, emoji: "🥑" },
      { id: "platano",   nombre: "Plátano maduro",        precio: 500, emoji: "🍌" },
      { id: "huevo",     nombre: "Huevo de codorniz",     precio: 600, emoji: "🥚" },
      { id: "bocadillo", nombre: "Bocadillo guayaba",     precio: 700, emoji: "🍬" },
    ],
  },
];

const ALL_ITEMS = CATEGORIAS.flatMap((c) => c.items);

function getById(id) {
  return ALL_ITEMS.find((i) => i.id === id);
}

export default function CreadorEmpanada() {
  const { addItem } = useCart();
  const [selected, setSelected] = useState([]); // array of ingredient ids
  const [cantidad, setCantidad] = useState(1);
  const [activeCat, setActiveCat] = useState("proteinas");
  const [toast, setToast] = useState(false);

  const totalPrecio = PRECIO_BASE + selected.reduce((sum, id) => sum + (getById(id)?.precio ?? 0), 0);

  const toggle = (ingrediente, cat) => {
    const isSelected = selected.includes(ingrediente.id);
    if (isSelected) {
      setSelected((prev) => prev.filter((id) => id !== ingrediente.id));
    } else {
      const countInCat = selected.filter((id) => cat.items.some((i) => i.id === id)).length;
      if (countInCat >= cat.max) return; // max reached for this category
      setSelected((prev) => [...prev, ingrediente.id]);
    }
  };

  const handleAddToCart = () => {
    if (selected.length === 0) return;
    const nombres = selected.map((id) => getById(id)?.nombre).filter(Boolean);
    const customItem = {
      id: Date.now(),
      nombre: "Empanada Personalizada",
      descripcion: nombres.join(", "),
      precio: totalPrecio,
      imagen: "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=400&q=80",
      categoria: "especiales",
    };
    for (let i = 0; i < cantidad; i++) addItem(customItem);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const reset = () => { setSelected([]); setCantidad(1); };

  const selectedIngredients = selected.map((id) => getById(id)).filter(Boolean);

  return (
    <main className="creador-page">
      <div className="creador-inner">
        {/* Header */}
        <div className="creador-header">
          <span className="badge badge-gold">🎨 Crea tu empanada</span>
          <div className="gold-divider" />
          <h1 className="section-title">Creador de <span>Empanada</span></h1>
          <p className="section-subtitle">
            Diseña tu empanada ideal. Escoge los ingredientes, ajusta la cantidad y agrégala al carrito.
          </p>
        </div>

        <div className="creador-layout">
          {/* ── INGREDIENTES ── */}
          <div className="creador-form">
            {/* Category tabs */}
            <div className="cat-tabs">
              {CATEGORIAS.map((cat) => {
                const countInCat = selected.filter((id) => cat.items.some((i) => i.id === id)).length;
                return (
                  <button
                    key={cat.id}
                    className={`cat-tab ${activeCat === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCat(cat.id)}
                  >
                    {cat.icon} {cat.label}
                    {countInCat > 0 && <span className="cat-count">{countInCat}</span>}
                  </button>
                );
              })}
            </div>

            {/* Items */}
            {CATEGORIAS.map((cat) =>
              cat.id !== activeCat ? null : (
                <div key={cat.id} className="cat-items">
                  <div className="cat-info">
                    <span>Selecciona hasta <b>{cat.max}</b> opción{cat.max > 1 ? "es" : ""}</span>
                  </div>
                  <div className="ingredients-grid">
                    {cat.items.map((ing) => {
                      const sel = selected.includes(ing.id);
                      const countInCat = selected.filter((id) => cat.items.some((i) => i.id === id)).length;
                      const maxed = !sel && countInCat >= cat.max;
                      return (
                        <button
                          key={ing.id}
                          className={`ing-card ${sel ? "selected" : ""} ${maxed ? "maxed" : ""}`}
                          onClick={() => toggle(ing, cat)}
                          disabled={maxed}
                        >
                          <span className="ing-emoji">{ing.emoji}</span>
                          <span className="ing-nombre">{ing.nombre}</span>
                          <span className="ing-precio">+${ing.precio.toLocaleString("es-CO")}</span>
                          {sel && <span className="ing-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          {/* ── PREVIEW + RESUMEN ── */}
          <div className="creador-preview">
            {/* Visual empanada */}
            <div className="empanada-visual">
              <div className="empanada-circle">
                <div className="empanada-base">🫓</div>
                {selectedIngredients.map((ing, i) => {
                  const angle = (360 / Math.max(selectedIngredients.length, 1)) * i;
                  const rad = (angle * Math.PI) / 180;
                  const radius = selectedIngredients.length <= 3 ? 52 : 66;
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;
                  return (
                    <span
                      key={ing.id}
                      className="toping"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      {ing.emoji}
                    </span>
                  );
                })}
              </div>
              <p className="visual-label">
                {selected.length === 0 ? "Agrega ingredientes para ver tu empanada" : "Tu empanada personalizada"}
              </p>
            </div>

            {/* Price breakdown */}
            <div className="price-card">
              <h3>Detalle del precio</h3>
              <div className="price-lines">
                <div className="price-line">
                  <span>Masa base (maíz criollo)</span>
                  <span>${PRECIO_BASE.toLocaleString("es-CO")}</span>
                </div>
                {selectedIngredients.map((ing) => (
                  <div className="price-line" key={ing.id}>
                    <span>{ing.emoji} {ing.nombre}</span>
                    <span>+${ing.precio.toLocaleString("es-CO")}</span>
                  </div>
                ))}
                <div className="price-divider" />
                <div className="price-line price-total">
                  <span>Precio por unidad</span>
                  <span>${totalPrecio.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            {/* Cantidad + botones */}
            <div className="qty-card">
              <div className="qty-control">
                <span className="qty-label">Cantidad</span>
                <div className="qty-btns">
                  <button className="qty-btn" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                  <span className="qty-val">{cantidad}</span>
                  <button className="qty-btn" onClick={() => setCantidad((c) => Math.min(20, c + 1))}>+</button>
                </div>
              </div>
              <div className="qty-total">
                Total: <b>${(totalPrecio * cantidad).toLocaleString("es-CO")}</b>
              </div>
            </div>

            {selected.length === 0 && (
              <p className="no-ing-hint">⚠ Agrega al menos un ingrediente para continuar</p>
            )}

            <button
              className="btn-primary add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={selected.length === 0}
            >
              🛒 Agregar al carrito · ${(totalPrecio * cantidad).toLocaleString("es-CO")}
            </button>

            <button className="btn-outline reset-btn" onClick={reset}>
              🔄 Reiniciar
            </button>

            {/* Ingredients summary */}
            {selected.length > 0 && (
              <div className="ing-summary">
                <h4>Ingredientes seleccionados ({selected.length})</h4>
                <div className="ing-chips">
                  {selectedIngredients.map((ing) => (
                    <span
                      key={ing.id}
                      className="ing-chip"
                      onClick={() => setSelected((p) => p.filter((id) => id !== ing.id))}
                      title="Clic para quitar"
                    >
                      {ing.emoji} {ing.nombre} ✕
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          ✅ <strong>{cantidad}× Empanada Personalizada</strong> agregada{cantidad > 1 ? "s" : ""} al carrito
        </div>
      )}
    </main>
  );
}
