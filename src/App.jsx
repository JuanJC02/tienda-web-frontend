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
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GaleriaProvider } from "./context/GaleriaContext";
import "./index.css";

function AppInner() {
  const [page, setPage] = useState("login");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) setPage("login");
  }, [user]);

  const navigate = (newPage) => {
    if (!user && newPage !== "login") return;
    setPage(newPage);
  };

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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <GaleriaProvider>
          <AppInner />
        </GaleriaProvider>
      </CartProvider>
    </AuthProvider>
  );
}
