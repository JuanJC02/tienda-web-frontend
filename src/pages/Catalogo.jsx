import { useState } from "react";
import { productos } from "../data/productos";
import { useCart } from "../context/CartContext";
import "./Catalogo.css";

const CATEGORIAS = [
  { id: "todas", label: "Todas", icon: "🫓" },
  { id: "saladas", label: "Saladas", icon: "🧅" },
  { id: "dulces", label: "Dulces", icon: "🍯" },
  { id: "especiales", label: "Especiales", icon: "✨" },
];

export default function Catalogo() {
  const [categoria, setCategoria] = useState("todas");
  const [toast, setToast] = useState(null);
  const { addItem } = useCart();

  const filtered =
    categoria === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoria);

  const handleAdd = (p) => {
    addItem(p);
    setToast(p.nombre);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <main className="catalogo">
      {/* Header */}
      <div className="catalogo-header">
        <div className="catalogo-header-inner">
          <span className="badge badge-gold">Nuestro menú</span>
          <div className="gold-divider" />
          <h1 className="section-title">
            Catálogo de <span>Empanadas</span>
          </h1>
          <p className="section-subtitle">
            Más de 12 variedades artesanales. Todas hechas con masa de maíz criollo
            y rellenos preparados diariamente.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-inner">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              className={`filter-btn ${categoria === c.id ? "active" : ""}`}
              onClick={() => setCategoria(c.id)}
            >
              <span>{c.icon}</span>
              {c.label}
              <span className="filter-count">
                {c.id === "todas"
                  ? productos.length
                  : productos.filter((p) => p.categoria === c.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="catalogo-body">
        <div className="productos-grid">
          {filtered.map((p, i) => (
            <div
              className="producto-card"
              key={p.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="prod-img-wrap">
                <img src={p.imagen} alt={p.nombre} className="prod-img" />
                <div className="prod-overlay">
                  <button className="quick-add" onClick={() => handleAdd(p)}>
                    + Agregar
                  </button>
                </div>
                {p.badge && (
                  <span className={`badge badge-${p.badgeType} prod-badge`}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="prod-body">
                <div className="prod-cat-tag">
                  {CATEGORIAS.find((c) => c.id === p.categoria)?.icon}{" "}
                  <span>{p.categoria}</span>
                </div>
                <h3 className="prod-name">{p.nombre}</h3>
                <p className="prod-desc">{p.descripcion}</p>
                <div className="prod-footer">
                  <div className="prod-price">
                    <span className="price-label">Precio unidad</span>
                    <span className="price-val">
                      ${p.precio.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <button className="btn-primary prod-btn" onClick={() => handleAdd(p)}>
                    🛒 Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          ✅ <strong>{toast}</strong> agregada al carrito
        </div>
      )}
    </main>
  );
}
