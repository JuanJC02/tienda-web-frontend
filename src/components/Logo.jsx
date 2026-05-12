import "./Logo.css";

// Reemplaza este src con tu imagen de logo personalizada
const LOGO_IMG = "https://www.shutterstock.com/image-vector/empanada-logo-vector-illustration-template-260nw-2507117153.jpg";

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
