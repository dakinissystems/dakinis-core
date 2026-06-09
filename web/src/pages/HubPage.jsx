import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  dakinisHubCustomServicesTile,
  dakinisHubMarketplaceTiles,
  dakinisHubModuleToTile,
  dakinisSortHubModuleTiles,
  DAKINIS_ONE_MODULE_TILES
} from "@dakinis/shared-brand";
import { dakinisNormalizeCommercialPlan, dakinisPlanHasModule } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { dakinisPersistEcosystemSession } from "@dakinis/shared-brand/sso";
import { DAKINIS_URL_CORPORATE } from "../config/product-urls.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { company } from "@dakinis/shared-brand";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import { dakinisOpenEcosystemProduct } from "../utils/ecosystemSso.js";
import HubDashboard from "../components/HubDashboard.jsx";
import { dakinisIsBusinessDemoSession } from "../utils/businessDemoMode.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

function dakinisResolveTilePath(tile, session) {
  if (tile.id === "my-business" && session?.business?.type) {
    return `/sistema/${encodeURIComponent(session.business.type)}`;
  }
  if (tile.id === "inventory" && session?.business?.type === "restaurante") {
    return `/sistema/${encodeURIComponent(session.business.type)}`;
  }
  return tile.path;
}

function dakinisTileLockReason(tile, session) {
  if (tile.status === "roadmap") return "roadmap";
  if (!tile.requiresAuth) return null;
  if (!session?.token) return "login";
  if (!tile.moduleKey) return null;
  const plan = dakinisNormalizeCommercialPlan(session.business?.plan);
  if (!dakinisPlanHasModule(plan, tile.moduleKey)) return "plan";
  return null;
}

function dakinisTileDisabled(tile, session) {
  return dakinisTileLockReason(tile, session) != null;
}

export default function HubPage() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const { session } = useDakinisSession();

  useEffect(() => {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.HUB_OPENED, {
      authenticated: Boolean(session?.token)
    });
    if (session?.token) {
      dakinisPersistEcosystemSession(session);
    }
  }, [session?.token]);

  useEffect(() => {
    if (dakinisIsBusinessDemoSession(session)) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const returnUrl = typeof window !== "undefined" ? window.location.href : undefined;

  const marketplaceTiles = useMemo(
    () => dakinisHubMarketplaceTiles(session, returnUrl, locale),
    [session, returnUrl, locale]
  );
  const servicesTile = useMemo(() => dakinisHubCustomServicesTile(locale), [locale]);

  const oneModules = useMemo(() => {
    let tiles = dakinisSortHubModuleTiles([...DAKINIS_ONE_MODULE_TILES]).map((mod) =>
      dakinisHubModuleToTile(mod, locale)
    );
    if (!session?.token || dakinisIsPlatformAdminSession(session)) {
      return tiles.filter((tile) => tile.id !== "my-business");
    }
    const vertical = session.business?.type;
    if (!vertical || !dakinisSystemRegistry[vertical]) {
      return tiles.filter((tile) => tile.id !== "my-business");
    }
    if (vertical !== "restaurante") {
      tiles = tiles.filter((tile) => tile.id !== "inventory");
    }
    return tiles;
  }, [session, locale]);

  function openProductTile(tile) {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.HUB_TILE_CLICKED, {
      tileId: tile.id,
      kind: tile.kind
    });
    if (tile.kind === "external") {
      dakinisOpenEcosystemProduct(tile.id, { session, navigate, returnUrl });
      return;
    }
    if (tile.kind === "corporate") {
      window.location.href = tile.path;
      return;
    }
    dakinisOpenEcosystemProduct(tile.id, { session, navigate, returnUrl });
  }

  function openModuleTile(tile) {
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.HUB_TILE_CLICKED, {
      tileId: tile.id,
      kind: "module"
    });
    if (dakinisTileDisabled(tile, session)) {
      navigate("/login");
      return;
    }
    const path = dakinisResolveTilePath(tile, session);
    navigate(path);
  }

  return (
    <section className="modules hub-page">
      <div className="container">
        <p className="kicker">{company.tradingName}</p>
        <h2>{t("hub.title")}</h2>
        <p className="lead">{t("hub.lead")}</p>

        {!session?.token ? (
          <div className="system-page-actions" style={{ marginBottom: "1.5rem" }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_STARTED, { from: "hub" });
                navigate("/login");
              }}
            >
              {t("hub.login")}
            </button>
            <a href={DAKINIS_URL_CORPORATE} className="btn btn-outline" target="_blank" rel="noreferrer">
              {t("hub.requestDemo")}
            </a>
          </div>
        ) : (
          <>
            {dakinisIsBusinessDemoSession(session) ? (
              <div className="hub-demo-commercial-cta card" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginTop: 0 }}>{t("businessDemo.hub.ctaTitle")}</h3>
                <p className="lead">{t("businessDemo.hub.ctaLead")}</p>
                <button type="button" className="btn btn-lg" onClick={() => navigate("/app/dashboard")}>
                  {t("businessDemo.hub.ctaButton")}
                </button>
              </div>
            ) : null}
            <HubDashboard
              session={session}
              applicationTiles={oneModules}
              marketplaceCount={marketplaceTiles.length}
              navigate={(path) => navigate(path)}
            />
            {session.business?.plan ? (
              <p className="lead" style={{ marginBottom: "1rem" }}>
                {t("hub.currentPlan", { plan: session.business.plan })}{" "}
                <a href="/#precios" className="link-btn">
                  {t("hub.upgradePlanCta")}
                </a>
              </p>
            ) : null}
          </>
        )}

        <h3 className="hub-section-title">{t("hub.applicationsTitle")}</h3>
        <p className="lead hub-section-lead">{t("hub.applicationsLead")}</p>
        <div className="hub-tile-grid">
          {oneModules.map((tile) => {
            const lockReason = dakinisTileLockReason(tile, session);
            const disabled = lockReason != null;
            const highlighted = tile.highlight && !disabled;
            return (
              <button
                key={tile.id}
                type="button"
                className={`card hub-tile${disabled ? " hub-tile--locked" : ""}${highlighted ? " hub-tile--highlight" : ""}`}
                onClick={() => openModuleTile(tile)}
                title={
                  lockReason === "plan"
                    ? t("hub.requiresPlanUpgrade")
                    : disabled
                      ? t("hub.moduleLocked")
                      : undefined
                }
              >
                <h4>{tile.label}</h4>
                <p>{tile.description}</p>
                {lockReason === "roadmap" ? (
                  <span className="hub-tile-badge hub-tile-badge--muted">{t("hub.roadmap")}</span>
                ) : null}
                {lockReason === "login" ? (
                  <span className="hub-tile-badge">{t("hub.requiresLogin")}</span>
                ) : null}
                {lockReason === "plan" ? (
                  <span className="hub-tile-badge">{t("hub.requiresPlanUpgrade")}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <h3 className="hub-section-title">{t("hub.marketplaceTitle")}</h3>
        <p className="lead hub-section-lead">{t("hub.marketplaceLead")}</p>
        <div className="hub-tile-grid">
          {marketplaceTiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              className="card hub-tile"
              onClick={() => openProductTile(tile)}
            >
              <h4>{tile.label}</h4>
              <p>{tile.description}</p>
              {tile.ssoReady === false && session?.token ? (
                <span className="hub-tile-badge hub-tile-badge--muted">{t("hub.ssoPending")}</span>
              ) : null}
            </button>
          ))}
          <button type="button" className="card hub-tile hub-tile--muted" onClick={() => openProductTile(servicesTile)}>
            <h4>{servicesTile.label}</h4>
            <p>{servicesTile.description}</p>
          </button>
        </div>

        {session?.token && dakinisIsPlatformAdminSession(session) ? (
          <div className="system-page-actions" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
              {t("hub.platformAdmin")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
