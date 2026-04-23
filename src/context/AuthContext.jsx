import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Usuarios simulados
const USERS = [
  { email: "demo@empanaderia.com", password: "demo123", nombre: "Usuario Demo" },
  { email: "admin@empanaderia.com", password: "admin123", nombre: "Administrador" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);

  const login = (email, password) => {
    // Verificar bloqueo
    if (bloqueadoHasta && new Date() < bloqueadoHasta) {
      const segundos = Math.ceil((bloqueadoHasta - new Date()) / 1000);
      return { ok: false, error: `Cuenta bloqueada. Intenta en ${segundos}s.`, bloqueado: true };
    }

    const found = USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      setIntentos(0);
      setBloqueadoHasta(null);
      return { ok: true };
    }

    const nuevosIntentos = intentos + 1;
    setIntentos(nuevosIntentos);

    if (nuevosIntentos >= 3) {
      const hasta = new Date(Date.now() + 30 * 1000); // 30 segundos
      setBloqueadoHasta(hasta);
      setIntentos(0);
      return { ok: false, error: "Demasiados intentos. Bloqueado por 30 segundos.", bloqueado: true };
    }

    return { ok: false, error: `Credenciales incorrectas. Intentos: ${nuevosIntentos}/3`, bloqueado: false };
  };

  const logout = () => { setUser(null); setIntentos(0); };

  return (
    <AuthContext.Provider value={{ user, login, logout, intentos, bloqueadoHasta }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
