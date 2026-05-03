import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";

const logoSimple = "/Logo%20Simple.jpeg";

export default function AppTopBar({ navigate, session, logout }) {
  return (
    <header className="topbar">
      <div className="container topbar-content">
        <a href={DAKINIS_MARKETING_SITE_URL} className="brand brand-external">
          <img src={logoSimple} alt="Dakinis Systems" className="brand-icon" />
          <span>Dakinis One</span>
        </a>
        <div className="topbar-actions">
          <a
            href="/#precios"
            className="btn btn-outline"
            onClick={(e) => {
              e.preventDefault();
              dakinisGoHomeAnchor(navigate, "precios");
            }}
          >
            Paquetes
          </a>
          {session?.user?.email ? (
            <>
              {session.user.role === "platform_admin" || session.business?.type === "platform" ? (
                <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                  Panel plataforma
                </button>
              ) : session.business?.slug ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(session.business.type)}`)}
                >
                  Mi negocio
                </button>
              ) : null}
              <span
                className="lead"
                style={{
                  fontSize: "0.85rem",
                  maxWidth: "28ch",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {session.user.role === "platform_admin" || session.business?.type === "platform"
                  ? "Administrador plataforma"
                  : session.user.email}
              </span>
              <button type="button" className="btn btn-outline" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Login
              </a>
              <a
                href="/#contact"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  dakinisGoHomeAnchor(navigate, "contact");
                }}
              >
                Solicitar presupuesto
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
