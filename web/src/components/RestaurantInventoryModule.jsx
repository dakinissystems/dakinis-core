import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisReadRestaurantModuleContext,
  dakinisWriteRestaurantModuleContext
} from "../utils/restaurantTaskStorage.js";
import SupplyDeliveriesAndAlerts from "./SupplyDeliveriesAndAlerts.jsx";
import InventoryLotsPanel from "./InventoryLotsPanel.jsx";
import RestaurantStockSection from "./RestaurantStockSection.jsx";

/** Operación diaria de almacén */
const INV_OPS = [
  { id: "scan", labelKey: "restaurant.invTabScan" },
  { id: "stock", labelKey: "restaurant.invTabStock" },
  { id: "lots", labelKey: "restaurant.invTabLots" }
];

/** Gestión (menos frecuente) */
const INV_MGMT = [
  { id: "production", labelKey: "restaurant.invTabProduction" },
  { id: "recipes", labelKey: "restaurant.invTabRecipes" },
  { id: "alerts", labelKey: "restaurant.invTabAlerts" }
];

const ALL_IDS = [...INV_OPS, ...INV_MGMT].map((t) => t.id);

/**
 * Inventario: operación diaria vs gestión, con contexto persistido.
 */
export default function RestaurantInventoryModule({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  systemPageContent,
  initialSub
}) {
  const { t } = useLocale();
  const saved = dakinisReadRestaurantModuleContext().inventario || {};
  const [sub, setSub] = useState(() => {
    const fromUrl = String(initialSub || "").toLowerCase();
    if (fromUrl === "lotes") return "lots";
    if (fromUrl === "recetas" || fromUrl === "recipes") return "recipes";
    if (ALL_IDS.includes(fromUrl)) return fromUrl;
    return saved.sub && ALL_IDS.includes(saved.sub) ? saved.sub : "scan";
  });
  const [lotsTab, setLotsTab] = useState(() => saved.lotsTab || "lots");
  const [lotsFilter, setLotsFilter] = useState(() => saved.lotsFilter || "");

  useEffect(() => {
    dakinisWriteRestaurantModuleContext("inventario", {
      sub,
      lotsTab,
      lotsFilter
    });
  }, [sub, lotsTab, lotsFilter]);

  useEffect(() => {
    if (!initialSub) return;
    const fromUrl = String(initialSub).toLowerCase();
    if (fromUrl === "lotes" || fromUrl === "lots") setSub("lots");
    else if (fromUrl === "recetas" || fromUrl === "recipes") setSub("recipes");
    else if (ALL_IDS.includes(fromUrl)) setSub(fromUrl);
  }, [initialSub]);

  const suppliers = systemPageContent?.suppliersProducts;
  const stockParts = useMemo(() => {
    if (sub === "scan") return ["scan"];
    if (sub === "stock") return ["grid"];
    if (sub === "production" || sub === "recipes") return ["production"];
    return null;
  }, [sub]);

  function renderTabBtn(tab) {
    return (
      <button
        key={tab.id}
        type="button"
        className={`btn${sub === tab.id ? "" : " btn-outline"}`}
        aria-pressed={sub === tab.id}
        onClick={() => setSub(tab.id)}
      >
        {t(tab.labelKey)}
      </button>
    );
  }

  return (
    <div className="restaurant-module restaurant-module--inventario">
      <nav className="restaurant-module__subnav restaurant-module__subnav--split" aria-label={t("restaurant.invSubnav")}>
        <div className="restaurant-module__subnav-group" data-group="ops">
          <span className="restaurant-module__subnav-label">{t("restaurant.invGroupOps")}</span>
          {INV_OPS.map(renderTabBtn)}
        </div>
        <div className="restaurant-module__subnav-group" data-group="mgmt">
          <span className="restaurant-module__subnav-label">{t("restaurant.invGroupMgmt")}</span>
          {INV_MGMT.map(renderTabBtn)}
        </div>
      </nav>

      {stockParts ? (
        <RestaurantStockSection
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          parts={stockParts}
          compact
          autoFocusScan={sub === "scan"}
          showScanToast={sub === "scan"}
        />
      ) : null}

      {sub === "lots" ? (
        <InventoryLotsPanel
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          initialTab={lotsTab}
          onTabChange={setLotsTab}
          filterQuery={lotsFilter}
          onFilterQueryChange={setLotsFilter}
        />
      ) : null}

      {sub === "alerts" && suppliers ? (
        <SupplyDeliveriesAndAlerts
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          supplierNames={suppliers.supplierRows.map((r) => r.name)}
          productRefs={suppliers.productRows.map((r) => r.reference)}
          fallbackDeliveries={suppliers.incomingDeliveries ?? []}
          fallbackAlerts={suppliers.merchandiseAlerts ?? []}
        />
      ) : null}

      {sub === "alerts" && !suppliers ? (
        <p className="lead">{t("restaurant.invAlertsEmpty")}</p>
      ) : null}
    </div>
  );
}
