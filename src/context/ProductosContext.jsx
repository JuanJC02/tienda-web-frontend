import { createContext, useContext, useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { productos as productosIniciales } from "../data/productos";

const ProductosContext = createContext();

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos"), async (snap) => {
      if (snap.empty) {
        // Primera vez: carga los productos iniciales de productos.js
        for (const p of productosIniciales) {
          await addDoc(collection(db, "productos"), p);
        }
        // El listener disparará de nuevo con los datos recién creados
      } else {
        setProductos(
          snap.docs.map((d) => ({ ...d.data(), firestoreId: d.id }))
        );
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const addProducto = async (producto) => {
    const newId = Math.max(...productos.map((p) => p.id), 0) + 1;
    await addDoc(collection(db, "productos"), { ...producto, id: newId });
    return newId;
  };

  const updateProducto = async (id, datos) => {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    await updateDoc(doc(db, "productos", prod.firestoreId), datos);
  };

  const deleteProducto = async (id) => {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    await deleteDoc(doc(db, "productos", prod.firestoreId));
  };

  return (
    <ProductosContext.Provider value={{ productos, loading, addProducto, updateProducto, deleteProducto }}>
      {children}
    </ProductosContext.Provider>
  );
}

export const useProductos = () => useContext(ProductosContext);
