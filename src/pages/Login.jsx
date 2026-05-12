import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import "./Login.css";

export default function Login({ setPage }) {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | forgot

  // Campos separados (evita pérdida de foco con sub-componentes)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) setPage("home");
  }, [user]);

  useEffect(() => {
    if (!bloqueado) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); setBloqueado(false); setServerError(""); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bloqueado]);

  const clearErrors = () => { setErrors({}); setServerError(""); };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearErrors();
    setSuccess("");
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && !nombre.trim()) e.nombre = "El nombre es requerido";
    if (!email.trim()) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email inválido";
    if (mode !== "forgot") {
      if (!password) e.password = "La contraseña es requerida";
      else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    }
    if (mode === "register") {
      if (!confirmPass) e.confirmPass = "Confirma tu contraseña";
      else if (password !== confirmPass) e.confirmPass = "Las contraseñas no coinciden";
    }
    return e;
  };

  const handleSubmit = () => {
    if (bloqueado) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (mode === "login") {
      const result = login(email, password);
      if (!result.ok) {
        setServerError(result.error);
        if (result.bloqueado) { setBloqueado(true); setCountdown(30); }
      }
    } else if (mode === "register") {
      const result = register(nombre, email, password);
      if (!result.ok) {
        setServerError(result.error);
      } else {
        setSuccess("¡Cuenta creada! Ahora inicia sesión.");
        switchMode("login");
        setPassword("");
        setConfirmPass("");
        setNombre("");
      }
    } else {
      setSuccess(`Enlace enviado a ${email}`);
      switchMode("login");
    }
  };

  const onKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <main className="login-page">
      {/* Panel visual */}
      <div className="login-visual">
        <div className="login-visual-content">
          <Logo size="large" />
          <p style={{ marginTop: 20 }}>
            Inicia sesión para guardar tus pedidos favoritos, girar la ruleta de descuentos y agilizar tu checkout.
          </p>
          <div className="demo-hint">
            <b>Cuenta demo:</b>
            <code>demo@empanaderia.com</code>
            <code>demo123</code>
          </div>
        </div>
      </div>

      {/* Panel formulario */}
      <div className="login-form-side">
        <div className="login-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
              Ingresar
            </button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
              Registrarse
            </button>
          </div>

          {mode === "forgot" && (
            <div className="forgot-header">
              <button className="back-btn" onClick={() => switchMode("login")}>← Volver</button>
              <h3>Recuperar contraseña</h3>
              <p>Ingresa tu email y te enviaremos un enlace para restablecerla.</p>
            </div>
          )}

          {success && <div className="alert-success">✅ {success}</div>}
          {serverError && (
            <div className={`alert-error ${bloqueado ? "bloqueado" : ""}`}>
              {bloqueado ? `🔒 ${serverError} (${countdown}s)` : `⚠️ ${serverError}`}
            </div>
          )}

          <div className="form-fields">
            {/* Nombre */}
            {mode === "register" && (
              <div className="field">
                <label className="field-label">Nombre completo</label>
                <input
                  type="text"
                  className={`field-input ${errors.nombre ? "error" : ""}`}
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrors((er) => ({ ...er, nombre: "" })); }}
                  onKeyDown={onKey}
                  autoComplete="name"
                />
                {errors.nombre && <span className="field-error">⚠ {errors.nombre}</span>}
              </div>
            )}

            {/* Email */}
            <div className="field">
              <label className="field-label">Correo electrónico</label>
              <input
                type="email"
                className={`field-input ${errors.email ? "error" : ""}`}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); setServerError(""); }}
                onKeyDown={onKey}
                disabled={bloqueado}
                autoComplete="email"
              />
              {errors.email && <span className="field-error">⚠ {errors.email}</span>}
            </div>

            {/* Contraseña */}
            {mode !== "forgot" && (
              <div className="field">
                <label className="field-label">Contraseña</label>
                <div className="field-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    className={`field-input ${errors.password ? "error" : ""}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: "" })); setServerError(""); }}
                    onKeyDown={onKey}
                    disabled={bloqueado}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <span className="field-error">⚠ {errors.password}</span>}
              </div>
            )}

            {/* Confirmar contraseña */}
            {mode === "register" && (
              <div className="field">
                <label className="field-label">Confirmar contraseña</label>
                <input
                  type={showPass ? "text" : "password"}
                  className={`field-input ${errors.confirmPass ? "error" : ""}`}
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setErrors((er) => ({ ...er, confirmPass: "" })); }}
                  onKeyDown={onKey}
                  autoComplete="new-password"
                />
                {errors.confirmPass && <span className="field-error">⚠ {errors.confirmPass}</span>}
              </div>
            )}
          </div>

          {mode === "login" && (
            <button className="forgot-link" onClick={() => switchMode("forgot")}>
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <button
            className={`btn-primary submit-btn ${bloqueado ? "blocked" : ""}`}
            onClick={handleSubmit}
            disabled={bloqueado}
          >
            {bloqueado
              ? `🔒 Bloqueado (${countdown}s)`
              : mode === "login"
              ? "Iniciar sesión"
              : mode === "register"
              ? "Crear cuenta"
              : "Enviar enlace"}
          </button>

{/*
          <div className="divider-or"><span>o continúa con</span></div>
          <div className="social-auth">
            {["🌐 Google", "📘 Facebook"].map((s) => (
              <button key={s} className="social-auth-btn">{s}</button>
            ))}
          </div> */}

          <p className="auth-switch">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button className="auth-switch-link" onClick={() => switchMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
