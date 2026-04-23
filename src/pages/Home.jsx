import { useCart } from "../context/CartContext";
import { productos } from "../data/productos";
import "./Home.css";

const MAS_VENDIDAS = productos.filter((p) =>
  [1, 2, 7, 10].includes(p.id)
);

export default function Home({ setPage }) {
  const { addItem } = useCart();

  return (
    <main className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="badge badge-gold">🇨🇴 Tradición colombiana desde 1998</span>
          <h1 className="hero-title">
            El sabor que<br />
            <em>Colombia</em> pone<br />
            en tu mesa
          </h1>
          <p className="hero-subtitle">
            Empanadas artesanales hechas con masa de maíz criollo, rellenos caseros
            y el amor de tres generaciones. Cada bocado cuenta una historia.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => setPage("catalogo")}>
              Ver catálogo completo
            </button>
            <button className="btn-outline" onClick={() => document.getElementById("quienes").scrollIntoView({ behavior:"smooth" })}>
              Nuestra historia
            </button>
          </div>

          <div className="hero-stats">
            {[
              { num: "+25", label: "Variedades" },
              { num: "26", label: "Años de tradición" },
              { num: "4.9★", label: "Calificación" },
            ].map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=600&q=80"
              alt="Empanadas colombianas"
              className="hero-img"
            />
            <div className="hero-float-card">
              <span>🔥</span>
              <div>
                <b>Recién horneadas</b>
                <small>Listas en 20 min</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <section className="quienes" id="quienes">
        <div className="section-inner">
          <div className="quienes-text">
            <span className="badge badge-gold">Nuestra historia</span>
            <div className="gold-divider" />
            <h2 className="section-title">Tradición que<br /><span>sabe a hogar</span></h2>
            <p className="section-subtitle">
              Desde 1998, la familia Ospina ha mantenido viva la receta original de las
              empanadas del Valle del Cauca. Usamos masa de maíz pilado a mano, ingredientes
              locales y el mismo fogón de siempre — ahora en el corazón de Medellín.
            </p>
            <p className="section-subtitle" style={{ marginTop: 12 }}>
              Hoy somos más de 20 personas con la misma misión: que cada empanada lleve
              el calor de la tradición colombiana a tu mesa.
            </p>
            <div className="valores">
              {[
                { icon: "🌽", title: "Maíz criollo", desc: "Masa molida artesanalmente" },
                { icon: "🧑‍🍳", title: "Recetas familiares", desc: "Tres generaciones de sabor" },
                { icon: "🚀", title: "Entrega rápida", desc: "30 min en Medellín" },
              ].map((v) => (
                <div className="valor" key={v.title}>
                  <span className="valor-icon">{v.icon}</span>
                  <div>
                    <b>{v.title}</b>
                    <small>{v.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="quienes-imgs">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"
              alt="Cocina"
              className="q-img q-img-big"
            />
            <img
              src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80"
              alt="Empanadas"
              className="q-img q-img-sm"
            />
          </div>
        </div>
      </section>

      {/* ── MÁS VENDIDAS ── */}
      <section className="mas-vendidas">
        <div className="section-inner col">
          <div className="section-header">
            <span className="badge badge-red">⭐ Más pedidas</span>
            <div className="gold-divider" />
            <h2 className="section-title">Las favoritas de<br /><span>nuestros clientes</span></h2>
          </div>
          <div className="mv-grid">
            {MAS_VENDIDAS.map((p) => (
              <div className="mv-card" key={p.id}>
                <div className="mv-img-wrap">
                  <img src={p.imagen} alt={p.nombre} className="mv-img" />
                  {p.badge && (
                    <span className={`badge badge-${p.badgeType} mv-badge`}>{p.badge}</span>
                  )}
                </div>
                <div className="mv-body">
                  <h3 className="mv-name">{p.nombre}</h3>
                  <p className="mv-desc">{p.descripcion.slice(0, 80)}…</p>
                  <div className="mv-footer">
                    <span className="mv-price">${p.precio.toLocaleString("es-CO")}</span>
                    <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }} onClick={() => addItem(p)}>
                      + Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline" style={{ alignSelf: "center", marginTop: 8 }} onClick={() => setPage("catalogo")}>
            Ver todas las empanadas →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span style={{ fontSize: "2rem" }}>🫓</span>
            <h3>La <em>Empanadería</em></h3>
            <p>El sabor que Colombia pone en tu mesa</p>
          </div>
          <div className="footer-col">
            <b>Contacto</b>
            <p>📍 Cl. 10 #43E-31, El Poblado, Medellín</p>
            <p>📞 (604) 322-4567</p>
            <p>✉️ hola@empanaderia.com</p>
          </div>
          <div className="footer-col">
            <b>Horarios</b>
            <p>Lun–Vie: 10:00 am – 9:00 pm</p>
            <p>Sáb–Dom: 9:00 am – 10:00 pm</p>
          </div>
          <div className="footer-col">
            <b>Síguenos</b>
            <div className="social-links">
              {["Instagram", "Facebook", "TikTok"].map((s) => (
                <span key={s} className="social-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 La Empanadería · Hecho con ❤️ en Medellín, Colombia</p>
        </div>
      </footer>
    </main>
  );
}
