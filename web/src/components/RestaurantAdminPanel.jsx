import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import SupplyDeliveriesAndAlerts from "./SupplyDeliveriesAndAlerts.jsx";
import RestaurantStockSection from "./RestaurantStockSection.jsx";
import RestaurantFloorPlan from "./RestaurantFloorPlan.jsx";
import RestaurantComandasSection from "./RestaurantComandasSection.jsx";
import InventoryLotsPanel from "./InventoryLotsPanel.jsx";
import { dakinisDefaultFloorTables, dakinisNewTableAtZone } from "../utils/restaurantFloorPlan.js";

export default function RestaurantAdminPanel({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  systemPageContent
}) {
  const { t } = useLocale();
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const [tables, setTables] = useState(dakinisDefaultFloorTables);
  const [sessions, setSessions] = useState({});
  const [menu, setMenu] = useState([]);
  const [menuDraft, setMenuDraft] = useState({});
  const [floorBusy, setFloorBusy] = useState(false);
  const [menuBusy, setMenuBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedTableId, setSelectedTableId] = useState(null);

  const fetchOpts = useMemo(
    () => ({
      businessId: effectiveSlug,
      businessTypeHeader: activeSystemKey
    }),
    [effectiveSlug, activeSystemKey]
  );

  const reload = useCallback(async () => {
    if (!apiSession?.token) return;
    setError("");
    try {
      const [floorState, menuRes] = await Promise.all([
        dakinisFetchRestaurantFloor(apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/menu", apiSession, fetchOpts)
      ]);
      setTables(floorState.tables);
      setSessions(floorState.sessions);
      const items = menuRes?.data?.menu ?? [];
      setMenu(items);
      setMenuDraft(Object.fromEntries(items.map((it) => [it.id, String(it.priceEur ?? "")])));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.loadError"));
    }
  }, [apiSession, fetchOpts, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveFloor(nextTables) {
    if (!apiSession?.token) {
      setTables(nextTables);
      return;
    }
    setFloorBusy(true);
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/floor", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { tables: nextTables }
      });
      setTables(nextTables);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.floorSaveError"));
    } finally {
      setFloorBusy(false);
    }
  }

  async function saveMenuPrices() {
    setMenuBusy(true);
    setError("");
    try {
      const items = menu.map((it) => ({
        id: it.id,
        priceEur: Number(menuDraft[it.id] ?? it.priceEur)
      }));
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/menu", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { items }
      });
      const next = json?.data?.menu ?? items;
      setMenu(next);
      setMenuDraft(Object.fromEntries(next.map((it) => [it.id, String(it.priceEur ?? "")])));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.menuSaveError"));
    } finally {
      setMenuBusy(false);
    }
  }

  const suppliers = systemPageContent?.suppliersProducts;

  return (
    <div className="restaurant-admin">
      <header className="restaurant-admin__intro">
        <h3 style={{ margin: 0 }}>{t("restaurant.adminTitle")}</h3>
        <p className="lead" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
          {t("restaurant.adminLead")}
        </p>
      </header>

      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      <article className="card" style={{ marginTop: "1rem" }}>
        <h4 style={{ marginTop: 0 }}>{t("restaurant.adminFloorTitle")}</h4>
        <p className="kpi-label">{t("restaurant.adminFloorLead")}</p>
        <RestaurantFloorPlan
          tables={tables}
          sessions={sessions}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
          onTablesChange={setTables}
          onDragEnd={saveFloor}
          layoutEditable
          positionEditable
          onAddTable={(zone) => saveFloor([...tables, dakinisNewTableAtZone(tables, zone)])}
          tableTotal={() => 0}
          t={t}
        />
        {floorBusy ? <p className="kpi-label">{t("restaurant.saving")}</p> : null}
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h4 style={{ marginTop: 0 }}>{t("restaurant.adminPricesTitle")}</h4>
        {menu.length === 0 ? (
          <p className="lead">{t("restaurant.adminPricesEmpty")}</p>
        ) : (
          <table className="mockup-table">
            <thead>
              <tr>
                <th>{t("fermina.colItem")}</th>
                <th>{t("restaurant.priceEur")}</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id}>
                  <td>{item.nameEs || item.name}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      style={{ width: "6rem" }}
                      value={menuDraft[item.id] ?? ""}
                      onChange={(e) =>
                        setMenuDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />{" "}
                    €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          type="button"
          className="btn"
          style={{ marginTop: "0.75rem" }}
          disabled={menuBusy || !menu.length}
          onClick={saveMenuPrices}
        >
          {t("restaurant.adminPricesSave")}
        </button>
      </article>

      {suppliers ? (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>{suppliers.sectionTitle}</h3>
          <p className="lead">{suppliers.sectionLead}</p>
          <SupplyDeliveriesAndAlerts
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            supplierNames={suppliers.supplierRows.map((r) => r.name)}
            productRefs={suppliers.productRows.map((r) => r.reference)}
            fallbackDeliveries={suppliers.incomingDeliveries ?? []}
            fallbackAlerts={suppliers.merchandiseAlerts ?? []}
          />
        </>
      ) : null}

      <RestaurantStockSection
        apiSession={apiSession}
        tenantSlugForVertical={tenantSlugForVertical}
        activeSystemKey={activeSystemKey}
      />

      <InventoryLotsPanel
        apiSession={apiSession}
        tenantSlugForVertical={tenantSlugForVertical}
        activeSystemKey={activeSystemKey}
      />

      <RestaurantComandasSection
        apiSession={apiSession}
        tenantSlugForVertical={tenantSlugForVertical}
        activeSystemKey={activeSystemKey}
        role="admin"
      />
    </div>
  );
}
