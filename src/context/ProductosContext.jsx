import { createContext, useContext, useState } from "react";
import { productos as productosIniciales } from "../data/productos";

const ProductosContext = createContext();

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState(productosIniciales);

  const addProducto = (producto) => {
    const newId = Math.max(...productos.map((p) => p.id), 0) + 1;
    setProductos((prev) => [...prev, { ...producto, id: newId }]);
    return newId;
  };

  const updateProducto = (id, datos) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...datos } : p))
    );
  };

  const deleteProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductosContext.Provider value={{ productos, addProducto, updateProducto, deleteProducto }}>
      {children}
    </ProductosContext.Provider>
  );
}

export const useProductos = () => useContext(ProductosContext);
