import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, setDoc, onSnapshot, updateDoc, deleteDoc,
  collection, query, getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [allUsers, setAllUsers]   = useState([]);
  const [intentos, setIntentos]   = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);

  /* ── Escucha sesión Firebase + datos Firestore ── */
  useEffect(() => {
    let unsubDoc = null;
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (unsubDoc) unsubDoc();
      if (fbUser) {
        unsubDoc = onSnapshot(doc(db, "usuarios", fbUser.uid), (snap) => {
          if (snap.exists()) {
            setUser({ uid: fbUser.uid, email: fbUser.email, ...snap.data() });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => { unsubAuth(); if (unsubDoc) unsubDoc(); };
  }, []);

  /* ── Carga usuarios para admins ── */
  useEffect(() => {
    if (user?.rol !== "administrador") { setAllUsers([]); return; }
    const unsub = onSnapshot(query(collection(db, "usuarios")), (snap) => {
      setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, [user?.rol]);

  /* ── Registro ── */
  const register = async (nombre, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol: "cliente",
        pedidos: [],
        codigos: [],
        spinsAvailable: 1,
        lastSpinTime: null,
        createdAt: Date.now(),
      });
      return { ok: true };
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        return { ok: false, error: "Este correo ya está registrado." };
      return { ok: false, error: "Error al crear la cuenta." };
    }
  };

  /* ── Login ── */
  const login = async (email, password) => {
    if (bloqueadoHasta && new Date() < bloqueadoHasta) {
      const seg = Math.ceil((bloqueadoHasta - new Date()) / 1000);
      return { ok: false, error: `Bloqueado. Intenta en ${seg}s.`, bloqueado: true };
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIntentos(0); setBloqueadoHasta(null);
      return { ok: true };
    } catch {
      const n = intentos + 1; setIntentos(n);
      if (n >= 3) {
        setBloqueadoHasta(new Date(Date.now() + 30000));
        setIntentos(0);
        return { ok: false, error: "3 intentos fallidos. Bloqueado 30s.", bloqueado: true };
      }
      return { ok: false, error: `Credenciales incorrectas. Intento ${n}/3`, bloqueado: false };
    }
  };

  const logout = () => signOut(auth);

  /* ── Pedidos ── */
  const addPedido = async (pedido) => {
    if (!user) return;
    const ref  = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    const data = snap.data();
    const newPedidos = [...(data.pedidos || []), pedido];
    const prevSpins  = Math.floor((data.pedidos || []).length / 2);
    const newSpins   = Math.floor(newPedidos.length / 2);
    await updateDoc(ref, {
      pedidos: newPedidos,
      spinsAvailable: (data.spinsAvailable || 0) + (newSpins - prevSpins),
    });
  };

  /* ── Códigos de descuento ── */
  const addCodigo = async (codigo) => {
    if (!user) return;
    const ref  = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    const codigos = snap.data().codigos || [];
    await updateDoc(ref, { codigos: [...codigos, codigo] });
  };

  const addCodigoToUser = async (userId, codigo) => {
    const ref  = doc(db, "usuarios", userId);
    const snap = await getDoc(ref);
    const codigos = snap.data()?.codigos || [];
    await updateDoc(ref, { codigos: [...codigos, codigo] });
  };

  const useCodigo = async (codigoStr) => {
    if (!user) return;
    const ref  = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    const codigos = snap.data().codigos || [];
    await updateDoc(ref, { codigos: codigos.filter((c) => c.codigo !== codigoStr) });
  };

  /* ── Ruleta ── */
  const useSpin = async () => {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid), {
      spinsAvailable: Math.max(0, (user.spinsAvailable || 0) - 1),
      lastSpinTime: Date.now(),
    });
  };

  /* ── Admin: gestión de usuarios ── */
  const adminCreateUser = async (datos) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, datos.email.trim(), datos.password);
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nombre: datos.nombre.trim(),
        email: datos.email.trim().toLowerCase(),
        rol: datos.rol || "cliente",
        pedidos: [],
        codigos: [],
        spinsAvailable: 1,
        lastSpinTime: null,
        createdAt: Date.now(),
      });
      return { ok: true };
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        return { ok: false, error: "Ese correo ya existe." };
      return { ok: false, error: "Error al crear usuario." };
    }
  };

  const adminUpdateUser = async (uid, datos) => {
    await updateDoc(doc(db, "usuarios", uid), datos);
  };

  /* Nota: esto elimina el perfil de Firestore pero NO la cuenta de Firebase Auth.
     El usuario no verá su perfil pero técnicamente aún podría iniciar sesión.
     Para borrado completo se requiere Firebase Admin SDK en un servidor. */
  const adminDeleteUser = async (uid) => {
    await deleteDoc(doc(db, "usuarios", uid));
  };

  return (
    <AuthContext.Provider value={{
      user, users: allUsers, loading,
      register, login, logout,
      adminCreateUser, adminUpdateUser, adminDeleteUser,
      addPedido, addCodigo, addCodigoToUser, useCodigo, useSpin,
      intentos, bloqueadoHasta,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
