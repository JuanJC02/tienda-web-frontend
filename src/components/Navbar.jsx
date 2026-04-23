import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ currentPage, setPage }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (page) => { setPage(page); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => nav("home")}>
          <span className="logo-icon">🫓</span>
          <span className="logo-text">
            La <em>Empanadería</em>
          </span>
        </button>

        {/* Links desktop */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {[
            { id: "home", label: "Inicio" },
            { id: "catalogo", label: "Catálogo" },
          ].map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${currentPage === item.id ? "active" : ""}`}
                onClick={() => nav(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">Hola, {user.nombre.split(" ")[0]}</span>
              <button className="btn-outline-sm" onClick={logout}>Salir</button>
            </div>
          ) : (
            <button className="btn-outline-sm" onClick={() => nav("login")}>
              Ingresar
            </button>
          )}

          <button className="cart-btn" onClick={() => nav("carrito")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
