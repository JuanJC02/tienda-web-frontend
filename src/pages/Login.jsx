import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login({ setPage }) {
  const { login, user } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [form, setForm] = useState({ email: "", password: "", nombre: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) setPage("home");
  }, [user]);

  // Countdown timer when blocked
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

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (mode !== "forgot") {
      if (!form.password) e.password = "La contraseña es requerida";
      else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    }
    if (mode === "register" && !form.nombre.trim()) e.nombre = "El nombre es requerido";
    return e;
  };

  const handleSubmit = () => {
    if (bloqueado) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (mode === "login") {
      const result = login(form.email, form.password);
      if (!result.ok) {
        setServerError(result.error);
        if (result.bloqueado) {
          setBloqueado(true);
          setCountdown(30);
        }
      }
    } else if (mode === "register") {
      setSuccess("¡Registro exitoso! Ya puedes iniciar sesión.");
      setMode("login");
      setForm({ email: form.email, password: "", nombre: "" });
    } else if (mode === "forgot") {
      setSuccess(`Se envió un enlace de recuperación a ${form.email}`);
      setMode("login");
    }
  };

  const Field = ({ name, type = "text", label, placeholder }) => (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="field-wrap">
        <input
          type={name === "password" ? (showPass ? "text" : "password") : type}
          className={`field-input ${errors[name] ? "error" : ""}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [name]: e.target.value }));
            setErrors((er) => ({ ...er, [name]: "" }));
            setServerError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={bloqueado}
        />
        {name === "password" && (
          <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
            {showPass ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {errors[name] && <span className="field-error">⚠ {errors[name]}</span>}
    </div>
  );

  return (
    <main className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <span style={{ fontSize: "4rem" }}>🫓</span>
          <h2>La <em>Empanadería</em></h2>
          <p>Inicia sesión para guardar tus pedidos favoritos y agilizar tu checkout.</p>
          <div className="demo-hint">
            <b>Demo:</b>
            <code>demo@empanaderia.com</code>
            <code>demo123</code>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setErrors({}); setServerError(""); setSuccess(""); }}
            >
              Ingresar
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setErrors({}); setServerError(""); setSuccess(""); }}
            >
              Registrarse
            </button>
          </div>

          {mode === "forgot" && (
            <div className="forgot-header">
              <button className="back-btn" onClick={() => setMode("login")}>← Volver</button>
              <h3>Recuperar contraseña</h3>
              <p>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
            </div>
          )}

          {success && <div className="alert-success">✅ {success}</div>}
          {serverError && <div className={`alert-error ${bloqueado ? "bloqueado" : ""}`}>
            {bloqueado ? `🔒 ${serverError} (${countdown}s)` : `⚠️ ${serverError}`}
          </div>}

          {/* Fields */}
          <div className="form-fields">
            {mode === "register" && (
              <Field name="nombre" label="Nombre completo" placeholder="Tu nombre" />
            )}
            <Field name="email" type="email" label="Correo electrónico" placeholder="correo@ejemplo.com" />
            {mode !== "forgot" && (
              <Field name="password" label="Contraseña" placeholder="••••••••" />
            )}
          </div>

          {mode === "login" && (
            <button
              className="forgot-link"
              onClick={() => { setMode("forgot"); setErrors({}); setServerError(""); }}
            >
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

          <div className="divider-or"><span>o continúa con</span></div>

          <div className="social-auth">
            {["Google", "Facebook"].map((s) => (
              <button key={s} className="social-auth-btn">
                {s === "Google" ? "🌐" : "📘"} {s}
              </button>
            ))}
          </div>

          <p className="auth-switch">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              className="auth-switch-link"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); setServerError(""); setSuccess(""); }}
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
