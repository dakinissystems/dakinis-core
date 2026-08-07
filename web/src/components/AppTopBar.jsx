import { useMemo } from "react";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { dakinisRestaurantTaskPath } from "../utils/restaurantTaskStorage.js";
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
import { HUB_NAV_SLOTS } from "@dakinis/shared-ux/hub-nav.js";

const DAKINIS_BUSINESS_NAV = [
  { path: "/app/crm", labelKey: "appNav.clients" },
  { path: "/app/inventario", labelKey: "appNav.inventory", id: "inventory" },
  { path: "/app/ventas", labelKey: "appNav.sales" },
  { path: "/app/reportes", labelKey: "appNav.reports" },
  { path: "/app/whatsapp", labelKey: "appNav.whatsapp" }
];

function dakinisBusinessNavPath(item, session) {
  if (item.id === "inventory" && dakinisIsHospitalityBusiness(session?.business?.type)) {
    return dakinisRestaurantTaskPath(session.business.type, "inventario", { sub: "scan" });
  }
  return item.path;
}

function TopbarPackagesButton({ navigate, currentPath, t }) {
  const isActive = currentPath === "/precios" || currentPath.startsWith("/precios/");

  return (
    <a
      href="/precios"
      className={`btn btn-outline topbar-packages-btn${isActive ? " is-active" : ""}`}
      aria-label={t("nav.packages")}
      title={t("nav.packages")}
      onClick={(e) => {
        e.preventDefault();
        navigate("/precios");
      }}
    >
      <span className="topbar-packages-btn__dots" aria-hidden="true">
        <span className="topbar-packages-btn__dot" />
        <span className="topbar-packages-btn__dot" />
        <span className="topbar-packages-btn__dot" />
      </span>
    </a>
  );
}

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
          {isBusinessFacing && !isPlatformAdmin ? <DakinisCopilotBar /> : null}
          <button
            type="button"
            className="btn btn-outline dakinis-hub-nav-search"
            title={`${HUB_NAV_SLOTS.search.label} (${HUB_NAV_SLOTS.search.shortcut})`}
            aria-label={HUB_NAV_SLOTS.search.label}
            onClick={() => window.dispatchEvent(new CustomEvent("dakinis:open-command-palette"))}
          >
            <span className="dakinis-hub-nav-search__icon" aria-hidden="true">
              🔍
            </span>
            <span className="dakinis-hub-nav-search__label">{HUB_NAV_SLOTS.search.label}</span>
          </button>
          {session?.user?.email ? (
            <>
              <LanguageSwitcher />
              {!isSystemDemoView && !isBusinessDemo ? (
                <TopbarPackagesButton navigate={navigate} currentPath={currentPath} t={t} />
              ) : null}
              {isBusinessFacing && !isSystemDemoView ? (
                <div className="topbar-app-nav topbar-app-nav--business" aria-label={t("appNav.aria")}>
                  {DAKINIS_BUSINESS_NAV.map((item) => {
                    const path = dakinisBusinessNavPath(item, session);
                    return (
                      <button
                        key={item.path}
                        type="button"
                        className={`btn btn-outline${isActive(path) || isActive(item.path) ? " is-active" : ""}`}
                        onClick={() => navigate(path)}
                      >
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
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
              ) : session.business?.type &&
                (session.business?.slug || isBusinessDemo) &&
                systemRegistry[session.business.type] ? (
                <>
                  {!isSystemDemoView ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        navigate(
                          dakinisIsHospitalityBusiness(session.business.type)
                            ? dakinisRestaurantTaskPath(session.business.type, "sala")
                            : `/sistema/${encodeURIComponent(session.business.type)}`
                        )
                      }
                    >
                      {isBusinessDemo && dakinisIsHospitalityBusiness(session.business.type)
                        ? t("businessDemo.dashboard.ctaRestaurant")
                        : t("nav.myBusiness")}
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
            <div className="topbar-guest-actions">
              <LanguageSwitcher />
              <a
                href="/login"
                className="btn btn-outline topbar-login-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                {t("nav.login")}
              </a>
              {!isSystemDemoView && !isBusinessDemo ? (
                <TopbarPackagesButton navigate={navigate} currentPath={currentPath} t={t} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
