import "./Logo.css";

// Reemplaza este src con tu imagen de logo personalizada
const LOGO_IMG = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80";

export default function Logo({ size = "normal", onClick }) {
  return (
    <div
      className={`logo-component logo-${size}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : {}}
    >
      <div className="logo-img-frame">
        <img src={LOGO_IMG} alt="La Empanadería" className="logo-img" />
      </div>
      <div className="logo-texts">
        <span className="logo-name">
          <em>Empanadería</em> De <em>MiMis</em>
        </span>
        {size === "large" && (
          <span className="logo-tagline">Tradición colombiana desde 1998</span>
        )}
      </div>
    </div>
  );
}
