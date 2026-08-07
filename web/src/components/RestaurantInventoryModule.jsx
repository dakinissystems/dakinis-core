import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisReadRestaurantModuleContext,
  dakinisWriteRestaurantModuleContext
} from "../utils/restaurantTaskStorage.js";
import SupplyDeliveriesAndAlerts from "./SupplyDeliveriesAndAlerts.jsx";
import InventoryLotsPanel from "./InventoryLotsPanel.jsx";
import RestaurantStockSection from "./RestaurantStockSection.jsx";

const INV_TABS = [
  { id: "scan", labelKey: "restaurant.invTabScan" },
  { id: "stock", labelKey: "restaurant.invTabStock" },
  { id: "lots", labelKey: "restaurant.invTabLots" },
  { id: "production", labelKey: "restaurant.invTabProduction" },
  { id: "alerts", labelKey: "restaurant.invTabAlerts" }
];

/**
 * Módulo Inventario a pantalla completa (sub-tabs; escáner arriba en scan).
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
    if (["scan", "stock", "lots", "lotes", "production", "alerts"].includes(fromUrl)) {
      return fromUrl === "lotes" ? "lots" : fromUrl;
    }
    return saved.sub || "scan";
  });

  useEffect(() => {
    dakinisWriteRestaurantModuleContext("inventario", { sub });
  }, [sub]);

  useEffect(() => {
    if (!initialSub) return;
    const fromUrl = String(initialSub).toLowerCase();
    if (fromUrl === "lotes" || fromUrl === "lots") setSub("lots");
    else if (["scan", "stock", "production", "alerts"].includes(fromUrl)) setSub(fromUrl);
  }, [initialSub]);

  const suppliers = systemPageContent?.suppliersProducts;
  const stockParts = useMemo(() => {
    if (sub === "scan") return ["scan"];
    if (sub === "stock") return ["grid"];
    if (sub === "production") return ["production"];
    return null;
  }, [sub]);

  return (
    <div className="restaurant-module restaurant-module--inventario">
      <nav className="restaurant-module__subnav" aria-label={t("restaurant.invSubnav")}>
        {INV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn${sub === tab.id ? "" : " btn-outline"}`}
            aria-pressed={sub === tab.id}
            onClick={() => setSub(tab.id)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </nav>

      {stockParts ? (
        <RestaurantStockSection
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          parts={stockParts}
          compact
          autoFocusScan={sub === "scan"}
        />
      ) : null}

      {sub === "lots" ? (
        <InventoryLotsPanel
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
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
