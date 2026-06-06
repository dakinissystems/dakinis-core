import { useMemo } from "react";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_MARKETING_SITE_URL } from "../config/product-urls.js";
import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import DakinisCopilotBar from "./DakinisCopilotBar.jsx";

export default function AppTopBar({ navigate, session, onSignOut, currentPath }) {
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
  const isActive = (path) => {
    if (path === "/app/whatsapp") {
      return currentPath.startsWith("/app/whatsapp") || currentPath.startsWith("/app/messages");
    }
    return currentPath === path;
  };

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <div className="brand">
          <a
            href={DAKINIS_MARKETING_SITE_URL}
            className="brand-external brand-icon-link"
            aria-label={t("nav.corporateSite")}
          >
            <img src={DAKINIS_LOGO_SIMPLE} alt="" className="brand-icon" width={40} height={40} />
          </a>
          <button type="button" className="brand-title-link" onClick={() => navigate("/")} aria-label={t("nav.homeApp")}>
            Dakinis One
          </button>
          <span className="topbar-brand-sub" aria-hidden="true">
            {t("nav.byCompany")}
          </span>
        </div>
        <div className="topbar-actions">
          <DakinisCopilotBar />
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
              <button
                type="button"
                className={`btn btn-outline${isActive("/hub") ? " is-active" : ""}`}
                onClick={() => navigate("/hub")}
              >
                {t("nav.hub")}
              </button>
              {session.user.role === "platform_admin" || session.business?.type === "platform" ? (
                <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                  {t("nav.platformPanel")}
                </button>
              ) : session.business?.slug ? (
                <>
                  {tenantCanOpenApp ? (
                    <div className="topbar-app-nav" aria-label={t("appNav.aria")}>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/dashboard") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/dashboard")}
                      >
                        {t("appNav.app")}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/crm") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/crm")}
                      >
                        {t("appNav.crm")}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/whatsapp") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/whatsapp")}
                      >
                        {t("appNav.whatsapp")}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline${isActive("/app/settings") ? " is-active" : ""}`}
                        onClick={() => navigate("/app/settings")}
                      >
                        {t("appNav.settings")}
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
              <button type="button" className="btn btn-outline" onClick={() => onSignOut?.()}>
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
                href="/#precios"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  dakinisGoHomeAnchor(navigate, "precios");
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
