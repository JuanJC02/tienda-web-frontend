import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const INITIAL_USERS = [
  {
    id: 1,
    nombre: "Usuario Demo",
    email: "demo@empanaderia.com",
    password: "demo123",
    pedidos: [],
    codigos: [],
    spinsAvailable: 1,
    lastSpinTime: null,
  },
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);

  const user = users.find((u) => u.id === currentUserId) || null;

  const register = (nombre, email, password) => {
    if (users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "Este correo ya está registrado." };
    }
    const newUser = {
      id: Date.now(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      pedidos: [],
      codigos: [],
      spinsAvailable: 1,
      lastSpinTime: null,
    };
    setUsers((prev) => [...prev, newUser]);
    return { ok: true };
  };

  const login = (email, password) => {
    if (bloqueadoHasta && new Date() < bloqueadoHasta) {
      const seg = Math.ceil((bloqueadoHasta - new Date()) / 1000);
      return { ok: false, error: `Cuenta bloqueada. Intenta en ${seg}s.`, bloqueado: true };
    }
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (found) {
      setCurrentUserId(found.id);
      setIntentos(0);
      setBloqueadoHasta(null);
      return { ok: true };
    }
    const newIntentos = intentos + 1;
    setIntentos(newIntentos);
    if (newIntentos >= 3) {
      setBloqueadoHasta(new Date(Date.now() + 30000));
      setIntentos(0);
      return { ok: false, error: "3 intentos fallidos. Bloqueado 30s.", bloqueado: true };
    }
    return { ok: false, error: `Credenciales incorrectas. Intento ${newIntentos}/3`, bloqueado: false };
  };

  const logout = () => { setCurrentUserId(null); setIntentos(0); };

  const addPedido = (pedido) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        const newPedidos = [...u.pedidos, pedido];
        const prevSpins = Math.floor(u.pedidos.length / 2);
        const newSpins = Math.floor(newPedidos.length / 2);
        return { ...u, pedidos: newPedidos, spinsAvailable: u.spinsAvailable + (newSpins - prevSpins) };
      })
    );
  };

  const addCodigo = (codigo) => {
    setUsers((prev) =>
      prev.map((u) => u.id === currentUserId ? { ...u, codigos: [...u.codigos, codigo] } : u)
    );
  };

  const addCodigoToUser = (userId, codigo) => {
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, codigos: [...u.codigos, codigo] } : u)
    );
  };

  const useCodigo = (codigoStr) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? { ...u, codigos: u.codigos.filter((c) => c.codigo !== codigoStr) }
          : u
      )
    );
  };

  const useSpin = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? { ...u, spinsAvailable: Math.max(0, u.spinsAvailable - 1), lastSpinTime: Date.now() }
          : u
      )
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, users, register, login, logout, addPedido, addCodigo, addCodigoToUser, useCodigo, useSpin, intentos, bloqueadoHasta }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
