import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import "./Navbar.css";

const NAV_MAIN = [
  { id: "home",     label: "Inicio" },
  { id: "catalogo", label: "Catálogo" },
  { id: "galeria",  label: "Galería" },
  { id: "creador",  label: "Crear Empanada" },
];

const NAV_ICONS = [
  { id: "ruleta", label: "Ruleta",    icon: "🎡" },
  { id: "perfil", label: "Mi Perfil", icon: "👤" },
];

export default function Navbar({ currentPage, setPage }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (page) => { setPage(page); setMenuOpen(false); };
  const isAdmin = user?.rol === "administrador";

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo-btn" onClick={() => nav("home")}>
          <Logo size="normal" />
        </button>

        {/* Links desktop */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {NAV_MAIN.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${currentPage === item.id ? "active" : ""}`}
                onClick={() => nav(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
          {/* Admin link solo para administradores */}
          {isAdmin && (
            <li>
              <button
                className={`nav-link nav-link-admin ${currentPage === "admin" ? "active" : ""}`}
                onClick={() => nav("admin")}
              >
                ⚙️ Admin
              </button>
            </li>
          )}
          {/* Mobile icon links */}
          {NAV_ICONS.map((item) => (
            <li key={item.id} className="mobile-only">
              <button
                className={`nav-link ${currentPage === item.id ? "active" : ""}`}
                onClick={() => nav(item.id)}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="nav-right">
          {NAV_ICONS.map((item) => (
            <button
              key={item.id}
              className={`icon-nav-btn desktop-only ${currentPage === item.id ? "active" : ""}`}
              onClick={() => nav(item.id)}
              title={item.label}
            >
              <span>{item.icon}</span>
              <span className="icon-nav-label">{item.label}</span>
            </button>
          ))}

          <button className="cart-btn" onClick={() => nav("carrito")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {user && (
            <div className="nav-user">
              {isAdmin && <span className="admin-chip">Admin</span>}
              <span className="nav-user-name">Hola, {user.nombre.split(" ")[0]}</span>
              <button className="btn-outline-sm" onClick={logout}>Salir</button>
            </div>
          )}

          <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
