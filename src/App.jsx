import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Login from "./pages/Login";
import Carrito from "./pages/Carrito";
import Ruleta from "./pages/Ruleta";
import Perfil from "./pages/Perfil";
import Galeria from "./pages/Galeria";
import CreadorEmpanada from "./pages/CreadorEmpanada";
import Admin from "./pages/Admin";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GaleriaProvider } from "./context/GaleriaContext";
import { ProductosProvider } from "./context/ProductosContext";
import "./index.css";

function AppInner() {
  const [page, setPage] = useState("login");
  const { user, loading } = useAuth();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!user && !loading) {
      clearCart();       // ← limpia el carrito al cerrar sesión
      setPage("login");
    }
  }, [user, loading]);

  const navigate = (newPage) => {
    if (!user && newPage !== "login") return;
    if (newPage === "admin" && user?.rol !== "administrador") return;
    setPage(newPage);
  };

  // Pantalla de carga mientras Firebase verifica la sesión
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="app">
      {page !== "login" && <Navbar currentPage={page} setPage={navigate} />}
      {page === "login"    && <Login setPage={navigate} />}
      {page === "home"     && <Home setPage={navigate} />}
      {page === "catalogo" && <Catalogo />}
      {page === "carrito"  && <Carrito setPage={navigate} />}
      {page === "ruleta"   && <Ruleta />}
      {page === "perfil"   && <Perfil setPage={navigate} />}
      {page === "galeria"  && <Galeria />}
      {page === "creador"  && <CreadorEmpanada />}
      {page === "admin"    && user?.rol === "administrador" && <Admin setPage={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductosProvider>
        <CartProvider>
          <GaleriaProvider>
            <AppInner />
          </GaleriaProvider>
        </CartProvider>
      </ProductosProvider>
    </AuthProvider>
  );
}
