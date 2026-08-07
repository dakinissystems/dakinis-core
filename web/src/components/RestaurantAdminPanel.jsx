import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import SupplyDeliveriesAndAlerts from "./SupplyDeliveriesAndAlerts.jsx";
import RestaurantStockSection from "./RestaurantStockSection.jsx";
import RestaurantDeliveryPanel from "./RestaurantDeliveryPanel.jsx";
import RestaurantFloorPlan from "./RestaurantFloorPlan.jsx";
import RestaurantComandasSection from "./RestaurantComandasSection.jsx";
import InventoryLotsPanel from "./InventoryLotsPanel.jsx";
import { dakinisDefaultFloorTables, dakinisNewTableAtZone } from "../utils/restaurantFloorPlan.js";

/**
 * Paneles de administración / config. Con `sections` solo se renderizan los pedidos.
 * @param {{
 *   sections?: Array<'floor'|'menu'|'supply'|'delivery'|'stock'|'lots'|'comandas'|'allergens'>
 * }} props
 */
export default function RestaurantAdminPanel({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  systemPageContent,
  sections
}) {
  const { t } = useLocale();
  const show = (id) => !sections || sections.includes(id);
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const [tables, setTables] = useState(dakinisDefaultFloorTables);
  const [sessions, setSessions] = useState({});
  const [menu, setMenu] = useState([]);
  const [menuDraft, setMenuDraft] = useState({});
  const [newProduct, setNewProduct] = useState({
    nameEs: "",
    category: "",
    priceEur: "",
    description: ""
  });
  const [floorBusy, setFloorBusy] = useState(false);
  const [menuBusy, setMenuBusy] = useState(false);
  const [error, setError] = useState("");
  const [menuNotice, setMenuNotice] = useState("");
  const [selectedTableId, setSelectedTableId] = useState(null);

  const fetchOpts = useMemo(
    () => ({
      businessId: effectiveSlug,
      businessTypeHeader: activeSystemKey
    }),
    [effectiveSlug, activeSystemKey]
  );

  const sessionToken = apiSession?.token;
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;

  const needsFloorOrMenu = show("floor") || show("menu");

  const reload = useCallback(async () => {
    const sess = apiSessionRef.current;
    if (!sessionToken || !sess?.token || !needsFloorOrMenu) return;
    setError("");
    try {
      const [floorState, menuRes] = await Promise.all([
        dakinisFetchRestaurantFloor(sess, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/menu", sess, fetchOpts)
      ]);
      setTables(floorState.tables);
      setSessions(floorState.sessions);
      const items = Array.isArray(menuRes?.data?.menu) ? menuRes.data.menu : [];
      setMenu(items);
      setMenuDraft(Object.fromEntries(items.map((it) => [it.id, String(it.priceEur ?? "")])));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.loadError"));
    }
  }, [sessionToken, fetchOpts, t, needsFloorOrMenu]);

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
    setMenuNotice("");
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
      const next = Array.isArray(json?.data?.menu) ? json.data.menu : menu;
      setMenu(next);
      setMenuDraft(Object.fromEntries(next.map((it) => [it.id, String(it.priceEur ?? "")])));
      setMenuNotice(t("restaurant.adminPricesSaved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.menuSaveError"));
    } finally {
      setMenuBusy(false);
    }
  }

  async function addMenuProduct(event) {
    event.preventDefault();
    const nameEs = String(newProduct.nameEs || "").trim();
    if (!nameEs) {
      setError(t("restaurant.adminProductNameRequired"));
      return;
    }
    const priceEur = Number(newProduct.priceEur);
    if (!Number.isFinite(priceEur) || priceEur < 0) {
      setError(t("restaurant.adminProductPriceRequired"));
      return;
    }

    setMenuBusy(true);
    setError("");
    setMenuNotice("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/menu", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: {
          create: [
            {
              nameEs,
              name: nameEs,
              category: String(newProduct.category || "").trim() || t("restaurant.adminProductCategoryDefault"),
              priceEur,
              description: String(newProduct.description || "").trim()
            }
          ]
        }
      });
      const next = Array.isArray(json?.data?.menu) ? json.data.menu : menu;
      setMenu(next);
      setMenuDraft(Object.fromEntries(next.map((it) => [it.id, String(it.priceEur ?? "")])));
      setNewProduct({ nameEs: "", category: "", priceEur: "", description: "" });
      setMenuNotice(t("restaurant.adminProductAdded", { name: nameEs }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.adminProductAddError"));
    } finally {
      setMenuBusy(false);
    }
  }

  const suppliers = systemPageContent?.suppliersProducts;
  const compact = Boolean(sections);

  return (
    <div className={`restaurant-admin${compact ? " restaurant-admin--modular" : ""}`}>
      {!compact ? (
        <header className="restaurant-admin__intro">
          <h3 style={{ margin: 0 }}>{t("restaurant.adminTitle")}</h3>
          <p className="lead" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
            {t("restaurant.adminLead")}
          </p>
        </header>
      ) : null}

      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      {show("floor") ? (
        <article className="card" style={{ marginTop: compact ? 0 : "1rem" }}>
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
      ) : null}

      {show("menu") ? (
        <>
          <article className="card" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginTop: 0 }}>{t("restaurant.adminPricesTitle")}</h4>
            <p className="kpi-label">{t("restaurant.adminPricesLead")}</p>
            {menu.length === 0 ? (
              <p className="lead">{t("restaurant.adminPricesEmpty")}</p>
            ) : (
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>{t("fermina.colItem")}</th>
                    <th>{t("restaurant.adminProductCategory")}</th>
                    <th>{t("restaurant.priceEur")}</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nameEs || item.name}</td>
                      <td>{item.category || "—"}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          style={{ width: "6rem" }}
                          aria-label={`${t("restaurant.priceEur")} — ${item.nameEs || item.name}`}
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
              {menuBusy ? t("restaurant.saving") : t("restaurant.adminPricesSave")}
            </button>
            {menuNotice ? (
              <p className="kpi-label" style={{ marginTop: "0.5rem", color: "#86efac" }}>
                {menuNotice}
              </p>
            ) : null}
          </article>

          <article className="card" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginTop: 0 }}>{t("restaurant.adminProductAddTitle")}</h4>
            <p className="kpi-label">{t("restaurant.adminProductAddLead")}</p>
            <form className="restaurant-admin__add-product" onSubmit={addMenuProduct}>
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
                  marginTop: "0.75rem"
                }}
              >
                <label className="kpi-label">
                  {t("restaurant.adminProductName")}
                  <input
                    type="text"
                    required
                    value={newProduct.nameEs}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, nameEs: e.target.value }))}
                    placeholder={t("restaurant.adminProductNamePlaceholder")}
                    style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                  />
                </label>
                <label className="kpi-label">
                  {t("restaurant.adminProductCategory")}
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder={t("restaurant.adminProductCategoryPlaceholder")}
                    list="restaurant-menu-categories"
                    style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                  />
                  <datalist id="restaurant-menu-categories">
                    {[...new Set(menu.map((it) => it.category).filter(Boolean))].map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </label>
                <label className="kpi-label">
                  {t("restaurant.priceEur")}
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={newProduct.priceEur}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, priceEur: e.target.value }))}
                    placeholder="0.00"
                    style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                  />
                </label>
              </div>
              <label className="kpi-label" style={{ display: "block", marginTop: "0.75rem" }}>
                {t("restaurant.adminProductDescription")}
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t("restaurant.adminProductDescriptionPlaceholder")}
                  style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
                />
              </label>
              <button type="submit" className="btn" style={{ marginTop: "0.75rem" }} disabled={menuBusy}>
                {menuBusy ? t("restaurant.saving") : t("restaurant.adminProductAddSave")}
              </button>
            </form>
          </article>
        </>
      ) : null}

      {show("supply") && suppliers ? (
        <>
          {!compact ? <h3 style={{ marginTop: "1.5rem" }}>{suppliers.sectionTitle}</h3> : null}
          {!compact ? <p className="lead">{suppliers.sectionLead}</p> : null}
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

      {show("delivery") ? (
        <RestaurantDeliveryPanel apiSession={apiSession} fetchOpts={fetchOpts} t={t} />
      ) : null}

      {show("stock") ? (
        <RestaurantStockSection
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          parts={show("allergens") ? undefined : ["scan", "grid", "production"]}
        />
      ) : null}

      {show("allergens") && !show("stock") ? (
        <RestaurantStockSection
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          parts={["allergens"]}
          compact
        />
      ) : null}

      {show("lots") ? (
        <InventoryLotsPanel
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
        />
      ) : null}

      {show("comandas") ? (
        <RestaurantComandasSection
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          staffRole="admin"
        />
      ) : null}
    </div>
  );
}
