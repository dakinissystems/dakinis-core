import { useMemo } from "react";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const logoSimple = "/Logo%20Simple.jpeg";

export default function AppTopBar({ navigate, session, logout, currentPath }) {
  const { t } = useLocale();
  const systemRegistry = useMemo(() => dakinisGetSystemRegistry(), []);
  const tenantVertical = session?.business?.type;
  const tenantCanOpenMockup =
    Boolean(session?.token) &&
    session.user?.role !== "platform_admin" &&
    session.business?.type !== "platform" &&
    Boolean(tenantVertical && systemRegistry[tenantVertical]);
  const tenantCanOpenApp =
    Boolean(session?.token) &&
    session.user?.role !== "platform_admin" &&
    session.business?.type !== "platform";
  const isActive = (path) => currentPath === path;

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <div className="brand">
          <a
            href={DAKINIS_MARKETING_SITE_URL}
            className="brand-external brand-icon-link"
            aria-label={t("nav.corporateSite")}
          >
            <img src={logoSimple} alt="" className="brand-icon" />
          </a>
          <button type="button" className="brand-title-link" onClick={() => navigate("/")} aria-label={t("nav.homeApp")}>
            Dakinis One
          </button>
        </div>
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
                <>
                  {tenantCanOpenApp ? (
                    <div className="topbar-app-nav" aria-label="Dakinis app navigation">
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/dashboard") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/dashboard")}
                      >
                        App
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/crm") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/crm")}
                      >
                        CRM
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/messages") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/messages")}
                      >
                        Messages
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/settings") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/settings")}
                      >
                        Settings
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate(`/sistema/${encodeURIComponent(session.business.type)}`)}
                  >
                    {t("nav.myBusiness")}
                  </button>
                  {tenantCanOpenMockup ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => navigate(`/vista/${encodeURIComponent(tenantVertical)}`)}
                    >
                      {t("nav.panelMockup")}
                    </button>
                  ) : null}
                </>
              ) : tenantCanOpenMockup ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/vista/${encodeURIComponent(tenantVertical)}`)}
                >
                  {t("nav.panelMockup")}
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
