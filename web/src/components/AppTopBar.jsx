import { useMemo } from "react";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

const logoSimple = "/Logo%20Simple.jpeg";

export default function AppTopBar({ navigate, session, logout }) {
  const { t } = useLocale();
  const systemRegistry = useMemo(() => dakinisGetSystemRegistry(), []);
  const tenantVertical = session?.business?.type;
  const tenantCanOpenMockup =
    Boolean(session?.token) &&
    session.user?.role !== "platform_admin" &&
    session.business?.type !== "platform" &&
    Boolean(tenantVertical && systemRegistry[tenantVertical]);

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
