import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Login from "./pages/Login";
import Carrito from "./pages/Carrito";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Navbar currentPage={page} setPage={setPage} />
          {page === "home" && <Home setPage={setPage} />}
          {page === "catalogo" && <Catalogo />}
          {page === "login" && <Login setPage={setPage} />}
          {page === "carrito" && <Carrito setPage={setPage} />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
