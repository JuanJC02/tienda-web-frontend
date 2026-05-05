import "./Logo.css";

// Reemplaza este src con tu imagen de logo personalizada
const LOGO_IMG = "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=120&h=120&fit=crop&crop=center&q=80";

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
          La <em>Empanadería</em>
        </span>
        {size === "large" && (
          <span className="logo-tagline">Tradición colombiana desde 1998</span>
        )}
      </div>
    </div>
  );
}
