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
import { dakinisNewTableAtZone } from "../utils/restaurantFloorPlan.js";
import RestaurantFiscalPanel from "./RestaurantFiscalPanel.jsx";

/**
 * Paneles de administración / config. Con `sections` solo se renderizan los pedidos.
 * @param {{
 *   sections?: Array<'floor'|'menu'|'supply'|'delivery'|'stock'|'lots'|'comandas'|'allergens'|'fiscal'>
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
  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState({});
  const [menu, setMenu] = useState([]);
  const [menuDraft, setMenuDraft] = useState({});
  const [menuQuery, setMenuQuery] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuSort, setMenuSort] = useState("name");
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
  const [floorLocked, setFloorLocked] = useState(false);

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
      if (e?.status === 403) {
        setFloorLocked(true);
        setError("Tu rol puede ver el plano, no guardarlo. Operación sigue disponible.");
      } else {
        setError(e instanceof Error ? e.message : t("restaurant.floorSaveError"));
      }
    } finally {
      setFloorBusy(false);
    }
  }

  async function saveMenuPrices() {
    setMenuBusy(true);
    setError("");
    setMenuNotice("");
    try {
      const items = [];
      for (const it of menu) {
        const raw = menuDraft[it.id];
        if (raw == null || String(raw).trim() === "") continue;
        const priceEur = Number(String(raw).replace(",", "."));
        if (!Number.isFinite(priceEur) || priceEur < 0) {
          setError("Hay un precio que no es un importe válido.");
          setMenuBusy(false);
          return;
        }
        items.push({ id: it.id, priceEur });
      }
      if (!items.length) {
        setError("No hay precios para guardar. Un campo vacío no se convierte en 0 €.");
        setMenuBusy(false);
        return;
      }
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
    const priceEur = Number(String(newProduct.priceEur).replace(",", "."));
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
        <p className="lead" style={{ color: "var(--dakinis-warning)" }}>
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
            layoutEditable={!floorLocked}
            positionEditable={!floorLocked}
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
            <h4 style={{ marginTop: 0 }}>
              {t("restaurant.adminPricesTitle")}
              <span className="kpi-label"> · {menu.length} productos</span>
            </h4>
            <p className="kpi-label">{t("restaurant.adminPricesLead")}</p>
            <div className="stock-scan-actions" style={{ marginBottom: "0.75rem" }}>
              <label className="mockup-field">
                <span>Buscar plato</span>
                <input value={menuQuery} onChange={(e) => setMenuQuery(e.target.value)} placeholder="Buscar plato…" />
              </label>
              <label className="mockup-field">
                <span>Categoría</span>
                <select value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)}>
                  <option value="">Todas</option>
                  {[...new Set(menu.map((it) => it.category).filter(Boolean))].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <label className="mockup-field">
                <span>Orden</span>
                <select value={menuSort} onChange={(e) => setMenuSort(e.target.value)}>
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                </select>
              </label>
            </div>
            {menu.length === 0 ? (
              <p className="lead">{t("restaurant.adminPricesEmpty")}</p>
            ) : (
              dakinisGroupedMenu(menu, menuDraft, menuQuery, menuCategory, menuSort).map((group) => (
                <section key={group.category} style={{ marginTop: "0.85rem" }}>
                  <h5 style={{ margin: "0 0 0.35rem" }}>{group.category}</h5>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {group.items.map((item) => {
                      const raw = menuDraft[item.id] ?? "";
                      const hint = String(raw).trim() === "" ? "Sin precio" : Number(String(raw).replace(",", ".")) === 0 ? "Precio cero" : "";
                      return (
                        <li key={item.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", padding: "0.45rem 0", borderTop: "1px solid var(--dakinis-border, rgba(255,255,255,0.08))" }}>
                          <span>{item.nameEs || item.name}</span>
                          <label className="mockup-field" style={{ margin: 0, minWidth: "9rem" }}>
                            <span className="sr-only">{t("restaurant.priceEur")}</span>
                            <input
                              inputMode="decimal"
                              aria-label={`${t("restaurant.priceEur")} — ${item.nameEs || item.name}`}
                              value={raw}
                              placeholder="Sin precio"
                              onChange={(e) => setMenuDraft((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            />
                            {hint ? <span className="kpi-label">{hint}</span> : null}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
            <div style={{ position: "sticky", bottom: 0, marginTop: "0.75rem", padding: "0.65rem 0", background: "var(--dakinis-surface, #111827)" }}>
              <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
                Cambios pendientes: {dakinisPendingPriceCount(menu, menuDraft)}
              </p>
              <button
                type="button"
                className="btn"
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
            </div>
          </article>

          <article className="card" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginTop: 0 }}>{t("restaurant.adminProductAddTitle")}</h4>
            <p className="kpi-label">{t("restaurant.adminProductAddLead")}</p>
            <form className="mockup-form" onSubmit={addMenuProduct}>
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
                  marginTop: "0.75rem"
                }}
              >
                <label className="mockup-field">
                  <span>{t("restaurant.adminProductName")}</span>
                  <input
                    type="text"
                    required
                    value={newProduct.nameEs}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, nameEs: e.target.value }))}
                    placeholder={t("restaurant.adminProductNamePlaceholder")}
                  />
                </label>
                <label className="mockup-field">
                  <span>{t("restaurant.adminProductCategory")}</span>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder={t("restaurant.adminProductCategoryPlaceholder")}
                    list="restaurant-menu-categories"
                  />
                  <datalist id="restaurant-menu-categories">
                    {[...new Set(menu.map((it) => it.category).filter(Boolean))].map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </label>
                <label className="mockup-field">
                  <span>{t("restaurant.priceEur")}</span>
                  <input
                    inputMode="decimal"
                    required
                    value={newProduct.priceEur}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, priceEur: e.target.value }))}
                    placeholder="Sin precio"
                  />
                </label>
              </div>
              <label className="mockup-field" style={{ display: "block", marginTop: "0.75rem" }}>
                <span>{t("restaurant.adminProductDescription")}</span>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t("restaurant.adminProductDescriptionPlaceholder")}
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

      {show("fiscal") ? <RestaurantFiscalPanel apiSession={apiSession} fetchOpts={fetchOpts} /> : null}
    </div>
  );
}

function dakinisPendingPriceCount(menu, draft) {
  return menu.filter((item) => {
    const raw = draft[item.id];
    const stored = item.priceEur == null || item.priceEur === "" ? "" : String(item.priceEur);
    return String(raw ?? "") !== stored;
  }).length;
}

function dakinisGroupedMenu(menu, draft, query, category, sort) {
  const needle = String(query || "").trim().toLowerCase();
  const rows = menu.filter((item) => {
    if (category && item.category !== category) return false;
    if (!needle) return true;
    return `${item.nameEs || ""} ${item.name || ""}`.toLowerCase().includes(needle);
  });
  const groups = new Map();
  for (const item of rows) {
    const key = item.category || "Sin categoría";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].map(([name, items]) => ({
    category: name,
    items: [...items].sort((a, b) => {
      if (sort === "price") {
        const left = Number(String(draft[a.id] ?? a.priceEur ?? "").replace(",", "."));
        const right = Number(String(draft[b.id] ?? b.priceEur ?? "").replace(",", "."));
        return (Number.isFinite(left) ? left : Number.POSITIVE_INFINITY) - (Number.isFinite(right) ? right : Number.POSITIVE_INFINITY);
      }
      return String(a.nameEs || a.name || "").localeCompare(String(b.nameEs || b.name || ""), "es");
    })
  }));
}
