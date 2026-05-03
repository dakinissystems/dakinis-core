import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const logoSimple = "/Logo%20Simple.jpeg";

export default function AppTopBar({ navigate, session, logout }) {
  const { t } = useLocale();

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <a href={DAKINIS_MARKETING_SITE_URL} className="brand brand-external">
          <img src={logoSimple} alt="Dakinis Systems" className="brand-icon" />
          <span>Dakinis One</span>
        </a>
        <div className="topbar-actions">
          <LanguageSwitcher />
          <a
            href="/#precios"
            className="btn btn-outline"
            onClick={(e) => {
              e.preventDefault();
              dakinisGoHomeAnchor(navigate, "precios");
            }}
          >
            {t("nav.packages")}
          </a>
          {session?.user?.email ? (
            <>
              {session.user.role === "platform_admin" || session.business?.type === "platform" ? (
                <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                  {t("nav.platformPanel")}
                </button>
              ) : session.business?.slug ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(session.business.type)}`)}
                >
                  {t("nav.myBusiness")}
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
                  ? t("nav.platformAdmin")
                  : session.user.email}
              </span>
              <button type="button" className="btn btn-outline" onClick={logout}>
                {t("nav.logout")}
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
                {t("nav.login")}
              </a>
              <a
                href="/#contact"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  dakinisGoHomeAnchor(navigate, "contact");
                }}
              >
                {t("nav.quote")}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
