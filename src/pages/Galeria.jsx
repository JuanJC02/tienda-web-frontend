import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useGaleria } from "../context/GaleriaContext";
import "./Galeria.css";

function formatTime(ms) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function genCodigo(porcentaje) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const s = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return { codigo: `EMP${porcentaje}-${s}`, porcentaje };
}

export default function Galeria() {
  const { user, addCodigoToUser } = useAuth();
  const { fotos, competitionEndTime, subirFoto, likePhoto, resetCompetition } = useGaleria();

  const [timeLeft, setTimeLeft] = useState(0);
  const [ganador, setGanador] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadReady, setUploadReady] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!competitionEndTime) { setTimeLeft(0); return; }
    const update = () => setTimeLeft(Math.max(0, competitionEndTime - Date.now()));
    update();
    const interval = setInterval(() => {
      const left = competitionEndTime - Date.now();
      setTimeLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(interval);
        if (fotos.length > 0) {
          const winner = fotos.reduce((max, f) => f.likes.length > max.likes.length ? f : max, fotos[0]);
          if (winner.likes.length > 0) {
            const pct = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
            const codigo = genCodigo(pct);
            addCodigoToUser(winner.userId, codigo); // userId ya es el uid de Firebase
            setGanador({ foto: winner, codigo });
          } else {
            setGanador({ foto: winner, sinLikes: true });
          }
        }
        resetCompetition();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [competitionEndTime, fotos]);

  const handleFileChange = (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Solo se permiten imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Máximo 5 MB por foto"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setUploadPreview(ev.target.result); setUploadReady(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadReady) return;
    setUploading(true);
    try {
      await subirFoto(user.uid, user.nombre, uploadReady); // ← user.uid (Firebase)
      setUploadPreview(null);
      setUploadReady(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError("Error al subir la foto. Intenta de nuevo.");
    }
    setUploading(false);
  };

  const cancelPreview = () => {
    setUploadPreview(null);
    setUploadReady(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Compara con user.uid (Firebase) en lugar de user.id
  const userAlreadyUploaded = fotos.some((f) => f.userId === user?.uid);
  const sortedFotos = [...fotos].sort((a, b) => b.likes.length - a.likes.length);

  return (
    <main className="galeria-page">
      <div className="galeria-inner">
        <div className="galeria-header">
          <span className="badge badge-gold">📸 Galería comunitaria</span>
          <div className="gold-divider" />
          <h1 className="section-title">Fotos de la <span>comunidad</span></h1>
          <p className="section-subtitle">
            Sube tu foto favorita con empanadas y consigue likes. Al terminar el contador,
            la foto más votada gana un código de descuento aleatorio.
          </p>
        </div>

        {ganador && (
          <div className={`ganador-banner ${ganador.sinLikes ? "sin-likes" : ""}`}>
            {ganador.sinLikes ? (
              <p>⚠️ La ronda terminó sin likes. ¡Anímate a participar!</p>
            ) : (
              <p>🏆 ¡<b>{ganador.foto.userName}</b> ganó con {ganador.foto.likes.length} like{ganador.foto.likes.length !== 1 ? "s" : ""} y recibió el código <b>{ganador.codigo.codigo}</b> ({ganador.codigo.porcentaje}% OFF)!</p>
            )}
            <button className="dismiss-btn" onClick={() => setGanador(null)}>✕</button>
          </div>
        )}

        <div className="galeria-layout">
          <div className="galeria-side">
            {competitionEndTime && (
              <div className="timer-card">
                <div className="timer-label">⏱ Ronda activa</div>
                <div className="timer-display">{formatTime(timeLeft)}</div>
                <div className="timer-sub">La foto con más likes gana un descuento</div>
                <div className="timer-bar-wrap">
                  <div className="timer-bar" style={{ width: `${Math.min(100, (timeLeft / (5 * 60 * 1000)) * 100)}%` }} />
                </div>
              </div>
            )}
            {!competitionEndTime && fotos.length === 0 && (
              <div className="timer-card inactive">
                <div className="timer-label">🎯 Sin ronda activa</div>
                <div className="timer-sub">Sube la primera foto para iniciar el contador de 5 minutos.</div>
              </div>
            )}

            <div className="upload-card">
              <h3>📤 Subir mi foto</h3>
              {userAlreadyUploaded ? (
                <div className="already-uploaded">✅ Ya tienes una foto en esta ronda. ¡Pide a otros que te den like!</div>
              ) : uploadPreview ? (
                <div className="upload-preview-wrap">
                  <img src={uploadPreview} alt="Preview" className="upload-preview" />
                  <div className="upload-preview-actions">
                    <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                      {uploading ? "⏳ Subiendo..." : "✅ Confirmar y subir"}
                    </button>
                    <button className="btn-outline" onClick={cancelPreview} style={{ padding: "10px 16px" }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <span>📷</span>
                  <p>Haz clic para seleccionar tu foto</p>
                  <small>JPG, PNG, WEBP · Máx. 5 MB</small>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </div>
              )}
              {uploadError && <p className="upload-error">⚠ {uploadError}</p>}
            </div>

            {fotos.length > 0 && (
              <div className="ranking-card">
                <h3>🏅 Ranking actual</h3>
                {sortedFotos.slice(0, 5).map((f, i) => (
                  <div className="rank-row" key={f.firestoreId}>
                    <span className="rank-num">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                    <img src={f.image} alt={f.userName} className="rank-thumb" />
                    <span className="rank-name">{f.userName}</span>
                    <span className="rank-likes">❤️ {f.likes.length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fotos-area">
            {fotos.length === 0 ? (
              <div className="no-fotos">
                <span>🖼️</span>
                <h3>Sin fotos en esta ronda</h3>
                <p>¡Sé el primero en subir una foto!</p>
              </div>
            ) : (
              <div className="fotos-grid">
                {sortedFotos.map((foto) => {
                  const liked = foto.likes.includes(user?.uid); // ← user.uid
                  const isOwn = foto.userId === user?.uid;       // ← user.uid
                  const isLeader = foto.firestoreId === sortedFotos[0]?.firestoreId && foto.likes.length > 0;
                  return (
                    <div className={`foto-card ${isLeader ? "leader" : ""}`} key={foto.firestoreId}>
                      {isLeader && <div className="leader-badge">👑 Líder</div>}
                      <div className="foto-img-wrap">
                        <img src={foto.image} alt={`Foto de ${foto.userName}`} className="foto-img" />
                      </div>
                      <div className="foto-footer">
                        <div className="foto-user">
                          <div className="foto-avatar">{foto.userName.charAt(0)}</div>
                          <span className="foto-name">{foto.userName}</span>
                          {isOwn && <span className="badge badge-gold" style={{ fontSize: "0.65rem" }}>Tú</span>}
                        </div>
                        <button
                          className={`like-btn ${liked ? "liked" : ""}`}
                          onClick={() => !isOwn && likePhoto(foto.firestoreId, user?.uid)} // ← firestoreId + uid
                          disabled={isOwn}
                          title={isOwn ? "No puedes darte like a ti mismo" : liked ? "Quitar like" : "Dar like"}
                        >
                          <span className="like-icon">{liked ? "❤️" : "🤍"}</span>
                          <span className="like-count">{foto.likes.length}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
