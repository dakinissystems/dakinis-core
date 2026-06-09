import { useMemo } from "react";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_MARKETING_SITE_URL } from "../config/product-urls.js";
import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisIsBusinessDemoSession,
  dakinisIsBusinessFacingSession,
  dakinisIsPlatformAdminSession
} from "../utils/businessDemoMode.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import DakinisCopilotBar from "./DakinisCopilotBar.jsx";

const DAKINIS_BUSINESS_NAV = [
  { path: "/app/crm", labelKey: "appNav.clients" },
  { path: "/app/inventario", labelKey: "appNav.inventory" },
  { path: "/app/ventas", labelKey: "appNav.sales" },
  { path: "/app/reportes", labelKey: "appNav.reports" },
  { path: "/app/whatsapp", labelKey: "appNav.whatsapp" }
];

export default function AppTopBar({ navigate, session, onSignOut, currentPath }) {
  const { t } = useLocale();
  const systemRegistry = useMemo(() => dakinisGetSystemRegistry(), []);
  const isPlatformAdmin = dakinisIsPlatformAdminSession(session);
  const isBusinessFacing = dakinisIsBusinessFacingSession(session);
  const isBusinessDemo = dakinisIsBusinessDemoSession(session);
  const tenantVertical = session?.business?.type;
  const tenantCanOpenMockup =
    Boolean(session?.token) &&
    !isPlatformAdmin &&
    session.business?.type !== "platform" &&
    Boolean(tenantVertical && systemRegistry[tenantVertical]) &&
    !isBusinessDemo;

  const isActive = (path) => {
    if (path === "/app/whatsapp") {
      return currentPath.startsWith("/app/whatsapp") || currentPath.startsWith("/app/messages");
    }
    if (path === "/app/crm") return currentPath.startsWith("/app/crm");
    if (path === "/app/dashboard") {
      return currentPath === "/app/dashboard" || currentPath === "/";
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const isSystemDemoView =
    currentPath.startsWith("/sistema/") || currentPath.startsWith("/vista/") || currentPath.startsWith("/demo/");

  const homePath = isBusinessFacing && !isPlatformAdmin ? "/app/dashboard" : "/";

  return (
    <header className={`topbar${isSystemDemoView ? " topbar--demo-view" : ""}`}>
      <div className="container topbar-content">
        <div className="brand">
          <a
            href={DAKINIS_MARKETING_SITE_URL}
            className="brand-external brand-icon-link"
            aria-label={t("nav.corporateSite")}
          >
            <img src={DAKINIS_LOGO_SIMPLE} alt="" className="brand-icon" width={40} height={40} />
          </a>
          <button type="button" className="brand-title-link" onClick={() => navigate(homePath)} aria-label={t("nav.homeApp")}>
            Dakinis One
          </button>
          <span className="topbar-brand-sub" aria-hidden="true">
            {t("nav.byCompany")}
          </span>
        </div>
        <div className="topbar-actions">
          {!isBusinessDemo ? <DakinisCopilotBar /> : null}
          <LanguageSwitcher />
          {!isSystemDemoView && !isBusinessDemo ? (
            <a
              href="/precios"
              className="btn btn-outline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/precios");
              }}
            >
              {t("nav.packages")}
            </a>
          ) : null}
          {session?.user?.email ? (
            <>
              {isBusinessFacing && !isSystemDemoView ? (
                <div className="topbar-app-nav topbar-app-nav--business" aria-label={t("appNav.aria")}>
                  {DAKINIS_BUSINESS_NAV.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className={`btn btn-outline${isActive(item.path) ? " is-active" : ""}`}
                      onClick={() => navigate(item.path)}
                    >
                      {t(item.labelKey)}
                    </button>
                  ))}
                </div>
              ) : null}

              {!isBusinessDemo && !isSystemDemoView ? (
                <button
                  type="button"
                  className={`btn btn-outline${isActive("/hub") ? " is-active" : ""}`}
                  onClick={() => navigate("/hub")}
                >
                  {t("nav.hub")}
                </button>
              ) : null}

              {isPlatformAdmin ? (
                <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                  {t("nav.platformPanel")}
                </button>
              ) : !isBusinessDemo && session.business?.slug ? (
                <>
                  {!isSystemDemoView ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => navigate(`/sistema/${encodeURIComponent(session.business.type)}`)}
                    >
                      {t("nav.myBusiness")}
                    </button>
                  ) : null}
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

              {!isBusinessDemo ? (
                <button
                  type="button"
                  className={`btn btn-outline${isActive("/app/settings") ? " is-active" : ""}`}
                  onClick={() => navigate("/app/settings")}
                  title={t("appNav.settings")}
                >
                  {t("appNav.settings")}
                </button>
              ) : null}
              <span className="lead topbar-user-label">
                {isPlatformAdmin
                  ? t("nav.platformAdmin")
                  : session.business?.name || t("businessDemo.dashboard.fallbackBusiness")}
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
                href="/precios"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/precios");
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
