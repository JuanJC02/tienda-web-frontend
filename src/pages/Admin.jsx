import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useProductos } from "../context/ProductosContext";
import "./Admin.css";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80";
const ROLES = ["cliente", "administrador"];
const CATEGORIAS = ["saladas", "dulces", "especiales"];
const BADGE_TYPES = ["gold", "red", "green"];

/* ── Formulario vacío de producto ── */
const emptyProducto = () => ({
  nombre: "", descripcion: "", precio: "", categoria: "saladas",
  badge: "", badgeType: "gold", imagen: "",
});

/* ── Formulario vacío de usuario ── */
const emptyUser = () => ({
  nombre: "", email: "", password: "", rol: "cliente",
});

export default function Admin({ setPage }) {
  const { user, users, adminCreateUser, adminUpdateUser, adminDeleteUser } = useAuth();
  const { productos, addProducto, updateProducto, deleteProducto } = useProductos();

  const [tab, setTab] = useState("usuarios"); // usuarios | catalogo

  /* ── Estado Usuarios ── */
  const [editingUser, setEditingUser] = useState(null); // id del usuario en edición
  const [editUserForm, setEditUserForm] = useState({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(emptyUser());
  const [userMsg, setUserMsg] = useState({ text: "", tipo: "" });

  /* ── Estado Productos ── */
  const [editingProd, setEditingProd] = useState(null); // id del producto en edición
  const [editProdForm, setEditProdForm] = useState({});
  const [showCreateProd, setShowCreateProd] = useState(false);
  const [createProdForm, setCreateProdForm] = useState(emptyProducto());
  const [prodMsg, setProdMsg] = useState({ text: "", tipo: "" });

  const fileRefCreate = useRef(null);
  const fileRefEdit = useRef(null);

  /* ─────────────────── HELPERS ─────────────────── */
  const showMsg = (setter, text, tipo = "ok") => {
    setter({ text, tipo });
    setTimeout(() => setter({ text: "", tipo: "" }), 3000);
  };

  const readImage = (file, cb) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { cb(null, "Solo imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { cb(null, "Máximo 5 MB"); return; }
    const r = new FileReader();
    r.onload = (e) => cb(e.target.result, null);
    r.readAsDataURL(file);
  };

  /* ─────────────────── USUARIOS ─────────────────── */
  const startEditUser = (u) => {
    setEditingUser(u.id);
    setEditUserForm({ nombre: u.nombre, email: u.email, password: u.password, rol: u.rol });
    setShowCreateUser(false);
  };

  const saveEditUser = () => {
    if (!editUserForm.nombre || !editUserForm.email || !editUserForm.password) {
      showMsg(setUserMsg, "Completa todos los campos.", "err"); return;
    }
    adminUpdateUser(editingUser, editUserForm);
    setEditingUser(null);
    showMsg(setUserMsg, "Usuario actualizado correctamente.");
  };

  const handleDeleteUser = (u) => {
    if (u.id === user.id) { showMsg(setUserMsg, "No puedes eliminarte a ti mismo.", "err"); return; }
    if (window.confirm(`¿Eliminar a ${u.nombre}?`)) {
      adminDeleteUser(u.id);
      showMsg(setUserMsg, `${u.nombre} eliminado.`);
    }
  };

  const handleCreateUser = () => {
    if (!createUserForm.nombre || !createUserForm.email || !createUserForm.password) {
      showMsg(setUserMsg, "Completa todos los campos.", "err"); return;
    }
    const result = adminCreateUser(createUserForm);
    if (!result.ok) { showMsg(setUserMsg, result.error, "err"); return; }
    setCreateUserForm(emptyUser());
    setShowCreateUser(false);
    showMsg(setUserMsg, "Usuario creado correctamente.");
  };

  /* ─────────────────── PRODUCTOS ─────────────────── */
  const startEditProd = (p) => {
    setEditingProd(p.id);
    setEditProdForm({ ...p });
    setShowCreateProd(false);
  };

  const saveEditProd = () => {
    if (!editProdForm.nombre || !editProdForm.precio) {
      showMsg(setProdMsg, "Nombre y precio son obligatorios.", "err"); return;
    }
    updateProducto(editingProd, {
      ...editProdForm,
      precio: Number(editProdForm.precio),
      imagen: editProdForm.imagen || DEFAULT_IMG,
      badge: editProdForm.badge || null,
      badgeType: editProdForm.badge ? editProdForm.badgeType : null,
    });
    setEditingProd(null);
    showMsg(setProdMsg, "Empanada actualizada.");
  };

  const handleCreateProd = () => {
    if (!createProdForm.nombre || !createProdForm.precio) {
      showMsg(setProdMsg, "Nombre y precio son obligatorios.", "err"); return;
    }
    addProducto({
      ...createProdForm,
      precio: Number(createProdForm.precio),
      imagen: createProdForm.imagen || DEFAULT_IMG,
      badge: createProdForm.badge || null,
      badgeType: createProdForm.badge ? createProdForm.badgeType : null,
    });
    setCreateProdForm(emptyProducto());
    setShowCreateProd(false);
    showMsg(setProdMsg, "Empanada agregada al catálogo.");
  };

  const handleDeleteProd = (p) => {
    if (window.confirm(`¿Eliminar "${p.nombre}"?`)) {
      deleteProducto(p.id);
      showMsg(setProdMsg, `"${p.nombre}" eliminada.`);
    }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <main className="admin-page">
      <div className="admin-inner">
        {/* Header */}
        <div className="admin-header">
          <div>
            <span className="badge badge-red">⚙️ Panel de Administrador</span>
            <div className="gold-divider" />
            <h1 className="section-title">Funciones de <span>Administrador</span></h1>
            <p className="section-subtitle">Gestiona usuarios y el catálogo de productos.</p>
          </div>
          <button className="btn-outline" onClick={() => setPage("home")}>← Volver</button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === "usuarios" ? "active" : ""}`} onClick={() => setTab("usuarios")}>
            👥 Usuarios ({users.length})
          </button>
          <button className={`admin-tab ${tab === "catalogo" ? "active" : ""}`} onClick={() => setTab("catalogo")}>
            🫓 Catálogo ({productos.length})
          </button>
        </div>

        {/* ─── TAB: USUARIOS ─── */}
        {tab === "usuarios" && (
          <div className="admin-section">
            <div className="section-toolbar">
              <h2>Usuarios registrados</h2>
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                onClick={() => { setShowCreateUser(!showCreateUser); setEditingUser(null); }}>
                {showCreateUser ? "Cancelar" : "+ Crear usuario"}
              </button>
            </div>

            {userMsg.text && (
              <div className={`admin-msg ${userMsg.tipo === "err" ? "err" : "ok"}`}>{userMsg.text}</div>
            )}

            {/* Formulario crear usuario */}
            {showCreateUser && (
              <div className="admin-form-card">
                <h3>Nuevo usuario</h3>
                <div className="admin-form-grid">
                  {[
                    { key: "nombre",   label: "Nombre",     type: "text"     },
                    { key: "email",    label: "Email",      type: "email"    },
                    { key: "password", label: "Contraseña", type: "password" },
                  ].map((f) => (
                    <div className="admin-field" key={f.key}>
                      <label>{f.label}</label>
                      <input type={f.type} value={createUserForm[f.key]}
                        onChange={(e) => setCreateUserForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="admin-field">
                    <label>Rol</label>
                    <select value={createUserForm.rol}
                      onChange={(e) => setCreateUserForm((p) => ({ ...p, rol: e.target.value }))}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button className="btn-primary" onClick={handleCreateUser}>Crear usuario</button>
                  <button className="btn-outline" onClick={() => setShowCreateUser(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Tabla de usuarios */}
            <div className="users-list">
              {users.map((u) => (
                <div className="user-row" key={u.id}>
                  {editingUser === u.id ? (
                    /* Formulario de edición inline */
                    <div className="user-edit-form">
                      <div className="admin-form-grid">
                        {[
                          { key: "nombre",   label: "Nombre",     type: "text"     },
                          { key: "email",    label: "Email",      type: "email"    },
                          { key: "password", label: "Contraseña", type: "password" },
                        ].map((f) => (
                          <div className="admin-field" key={f.key}>
                            <label>{f.label}</label>
                            <input type={f.type} value={editUserForm[f.key]}
                              onChange={(e) => setEditUserForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                          </div>
                        ))}
                        <div className="admin-field">
                          <label>Rol</label>
                          <select value={editUserForm.rol}
                            onChange={(e) => setEditUserForm((p) => ({ ...p, rol: e.target.value }))}>
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="admin-form-actions">
                        <button className="btn-primary" onClick={saveEditUser}>Guardar</button>
                        <button className="btn-outline" onClick={() => setEditingUser(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    /* Vista normal */
                    <>
                      <div className="user-avatar">{u.nombre.charAt(0).toUpperCase()}</div>
                      <div className="user-info">
                        <div className="user-name">
                          {u.nombre}
                          {u.id === user.id && <span className="badge badge-gold" style={{ fontSize: "0.62rem", marginLeft: 6 }}>Tú</span>}
                        </div>
                        <div className="user-email">{u.email}</div>
                        <div className="user-meta">
                          <span className={`rol-chip ${u.rol === "administrador" ? "admin" : "cliente"}`}>
                            {u.rol === "administrador" ? "⚙️ Admin" : "👤 Cliente"}
                          </span>
                          <span className="user-stat">🛒 {u.pedidos.length} pedidos</span>
                          <span className="user-stat">🎟 {u.codigos.length} códigos</span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button className="action-btn edit" onClick={() => startEditUser(u)}>✏️ Editar</button>
                        <button className="action-btn delete" onClick={() => handleDeleteUser(u)}>🗑 Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: CATÁLOGO ─── */}
        {tab === "catalogo" && (
          <div className="admin-section">
            <div className="section-toolbar">
              <h2>Catálogo de empanadas</h2>
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                onClick={() => { setShowCreateProd(!showCreateProd); setEditingProd(null); }}>
                {showCreateProd ? "Cancelar" : "+ Nueva empanada"}
              </button>
            </div>

            {prodMsg.text && (
              <div className={`admin-msg ${prodMsg.tipo === "err" ? "err" : "ok"}`}>{prodMsg.text}</div>
            )}

            {/* Formulario nueva empanada */}
            {showCreateProd && (
              <div className="admin-form-card">
                <h3>Nueva empanada</h3>
                <ProductoForm
                  form={createProdForm}
                  setForm={setCreateProdForm}
                  fileRef={fileRefCreate}
                />
                <div className="admin-form-actions">
                  <button className="btn-primary" onClick={handleCreateProd}>Agregar al catálogo</button>
                  <button className="btn-outline" onClick={() => setShowCreateProd(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Lista de productos */}
            <div className="prod-admin-list">
              {productos.map((p) => (
                <div className="prod-admin-row" key={p.id}>
                  {editingProd === p.id ? (
                    <div className="prod-edit-form">
                      <h4>Editando: {p.nombre}</h4>
                      <ProductoForm
                        form={editProdForm}
                        setForm={setEditProdForm}
                        fileRef={fileRefEdit}
                      />
                      <div className="admin-form-actions">
                        <button className="btn-primary" onClick={saveEditProd}>Guardar cambios</button>
                        <button className="btn-outline" onClick={() => setEditingProd(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img src={p.imagen} alt={p.nombre} className="prod-admin-img" />
                      <div className="prod-admin-info">
                        <div className="prod-admin-name">{p.nombre}</div>
                        <div className="prod-admin-meta">
                          <span className="badge badge-gold">{p.categoria}</span>
                          <span className="prod-admin-price">${p.precio.toLocaleString("es-CO")}</span>
                          <span className="prod-admin-id">ID #{p.id}</span>
                        </div>
                        <div className="prod-admin-desc">{p.descripcion.slice(0, 80)}…</div>
                      </div>
                      <div className="user-actions">
                        <button className="action-btn edit" onClick={() => startEditProd(p)}>✏️ Editar</button>
                        <button className="action-btn delete" onClick={() => handleDeleteProd(p)}>🗑 Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Sub-componente: formulario de producto (reutilizable para crear y editar) ── */
function ProductoForm({ form, setForm, fileRef }) {
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Solo imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Máximo 5 MB"); return; }
    const r = new FileReader();
    r.onload = (ev) => set("imagen", ev.target.result);
    r.readAsDataURL(file);
  };

  return (
    <div className="prod-form-wrap">
      <div className="admin-form-grid">
        <div className="admin-field span-2">
          <label>Nombre de la empanada *</label>
          <input type="text" placeholder="Ej: Empanada de Pipián" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="admin-field span-2">
          <label>Descripción</label>
          <textarea rows={2} placeholder="Ingredientes y características..." value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Precio (COP) *</label>
          <input type="number" min="0" placeholder="4500" value={form.precio} onChange={(e) => set("precio", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Categoría</label>
          <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
            {["saladas", "dulces", "especiales"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label>Badge (opcional)</label>
          <input type="text" placeholder="Ej: ⭐ Más vendida" value={form.badge || ""} onChange={(e) => set("badge", e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Color del badge</label>
          <select value={form.badgeType || "gold"} onChange={(e) => set("badgeType", e.target.value)}>
            {["gold", "red", "green"].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Imagen */}
      <div className="admin-field" style={{ marginTop: 12 }}>
        <label>Imagen de presentación</label>
        <div className="img-upload-row">
          <div className="img-preview-wrap">
            <img src={form.imagen || DEFAULT_IMG} alt="preview" className="img-preview" />
          </div>
          <div className="img-upload-actions">
            <button type="button" className="btn-outline" style={{ padding: "9px 16px", fontSize: "0.83rem" }}
              onClick={() => fileRef.current?.click()}>
              📁 Subir imagen
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            {form.imagen && (
              <button type="button" className="action-btn delete" onClick={() => set("imagen", "")}>
                ✕ Quitar imagen
              </button>
            )}
            <small>Sin imagen se usará la imagen por defecto</small>
          </div>
        </div>
      </div>
    </div>
  );
}
