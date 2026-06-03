import { useCallback, useEffect, useMemo, useState } from "react";
import { dakinisResolveStockItemSlug, dakinisStockDemoBarcode } from "@dakinis/shared/catalog/stock-barcodes.js";
import {
  DAKINIS_DUMPLING_DEMO_PRODUCTION,
  DAKINIS_DUMPLING_DEMO_PURCHASE,
  DAKINIS_DUMPLING_HOUSE_SLUG,
  DAKINIS_FERMINA_DEMO_PRODUCTION,
  DAKINIS_FERMINA_DEMO_PURCHASE,
  DAKINIS_FERMINA_HOUSE_SLUG,
  DAKINIS_RESTAURANT_DEMO_PRODUCTION,
  DAKINIS_RESTAURANT_DEMO_PURCHASE
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import RestaurantAllergenPanel from "./RestaurantAllergenPanel.jsx";
import StockBarcodeScanner from "./StockBarcodeScanner.jsx";

function dakinisFormatQty(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  if (unit === "g" && n >= 1000) return `${(n / 1000).toFixed(2)} kg`;
  if (unit === "ml" && n >= 1000) return `${(n / 1000).toFixed(2)} L`;
  return `${n} ${unit}`;
}

export default function RestaurantStockSection({ apiSession, tenantSlugForVertical, activeSystemKey }) {
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const isFerminaHouse = effectiveSlug === DAKINIS_FERMINA_HOUSE_SLUG;
  const isDumplingHouse = effectiveSlug === DAKINIS_DUMPLING_HOUSE_SLUG;
  const demoProduction = isFerminaHouse
    ? DAKINIS_FERMINA_DEMO_PRODUCTION
    : isDumplingHouse
      ? DAKINIS_DUMPLING_DEMO_PRODUCTION
      : DAKINIS_RESTAURANT_DEMO_PRODUCTION;
  const demoPurchase = isFerminaHouse
    ? DAKINIS_FERMINA_DEMO_PURCHASE
    : isDumplingHouse
      ? DAKINIS_DUMPLING_DEMO_PURCHASE
      : DAKINIS_RESTAURANT_DEMO_PURCHASE;
  const [kitchen, setKitchen] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(() => demoProduction.map((p) => ({ ...p })));
  const [simulation, setSimulation] = useState(null);
  const [scanQty, setScanQty] = useState("1");
  const [scanDirection, setScanDirection] = useState("in");
  const [scanMessage, setScanMessage] = useState("");

  const fetchOpts = useMemo(
    () => ({
      businessId: effectiveSlug,
      businessTypeHeader: activeSystemKey
    }),
    [effectiveSlug, activeSystemKey]
  );

  const itemNames = useMemo(() => {
    const map = {};
    for (const item of kitchen?.items ?? []) map[item.slug] = item.name;
    return map;
  }, [kitchen?.items]);

  const reload = useCallback(
    async (signal) => {
      if (!apiSession?.token) {
        setKitchen(null);
        setError("");
        setSimulation(null);
        return;
      }
      setError("");
      try {
        const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", apiSession, {
          ...fetchOpts,
          signal
        });
        if (signal?.aborted) return;
        const data = json?.data;
        setKitchen(data);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : t("kitchen.loadError"));
      }
    },
    [apiSession, fetchOpts, t]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    reload(ctrl.signal);
    return () => ctrl.abort();
  }, [reload]);

  async function dakinisRunSimulate() {
    setBusy(true);
    setError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/production/simulate", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: { plan }
      });
      setSimulation(json?.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("kitchen.simulateError"));
      setSimulation(null);
    } finally {
      setBusy(false);
    }
  }

  async function dakinisApplyStockScan(barcode) {
    const slug = dakinisResolveStockItemSlug(barcode, kitchen?.items ?? []);
    if (!slug) {
      setScanMessage(t("kitchen.scanNotFound"));
      return;
    }
    const qty = Number(scanQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setScanMessage(t("kitchen.scanQtyInvalid"));
      return;
    }
    if (!apiSession?.token) {
      setScanMessage(`${t("kitchen.scanMatched")}: ${slug}`);
      return;
    }
    setBusy(true);
    setScanMessage("");
    setError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/stock/scan", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: { barcode, quantity: qty, direction: scanDirection }
      });
      const item = json?.data?.item;
      setScanMessage(
        t("kitchen.scanOk", {
          name: item?.name || slug,
          qty: dakinisFormatQty(item?.quantity, item?.unit)
        })
      );
      await reload(undefined);
    } catch (e) {
      setScanMessage(e instanceof Error ? e.message : t("kitchen.scanError"));
    } finally {
      setBusy(false);
    }
  }

  async function dakinisApplyDemoPurchase() {
    setBusy(true);
    setError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/stock/purchase", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: { label: "Pedido", lines: demoPurchase }
      });
      await reload(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("kitchen.purchaseError"));
    } finally {
      setBusy(false);
    }
  }

  async function dakinisApplyProduction() {
    setBusy(true);
    setError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/production", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: { label: "Produccion cocina", plan, notes: "Registrado desde panel restaurante" }
      });
      setSimulation(null);
      await reload(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("kitchen.productionError"));
    } finally {
      setBusy(false);
    }
  }

  function dakinisUpdatePlanBatch(recipeSlug, batches) {
    setPlan((prev) => {
      const next = prev.filter((p) => p.recipeSlug !== recipeSlug);
      if (Number(batches) > 0) next.push({ recipeSlug, batches: Number(batches) });
      return next;
    });
  }

  if (!kitchen) {
    return (
      <p className="lead" style={{ marginTop: "1rem" }}>
        {t("kitchen.loading")}
      </p>
    );
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3>{t("kitchen.title")}</h3>
      <p className="lead">
        {t(
          isFerminaHouse ? "kitchen.leadFermina" : isDumplingHouse ? "kitchen.leadDumpling" : "kitchen.lead"
        )}
      </p>
      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      <article className="card stock-panel__scan" style={{ marginBottom: "1rem" }}>
        <h4 style={{ marginTop: 0 }}>{t("kitchen.scanTitle")}</h4>
        <StockBarcodeScanner onScan={dakinisApplyStockScan} t={t} />
        <div className="stock-scan-actions">
          <label className="mockup-field">
            <span>{t("kitchen.scanQtyLabel")}</span>
            <input
              type="number"
              min="0.01"
              step="any"
              inputMode="decimal"
              value={scanQty}
              onChange={(e) => setScanQty(e.target.value)}
            />
          </label>
          <div className="stock-scan-actions__dir" role="group" aria-label={t("kitchen.scanDirection")}>
            <button
              type="button"
              className={scanDirection === "in" ? "btn" : "btn btn-outline"}
              onClick={() => setScanDirection("in")}
            >
              {t("kitchen.scanIn")}
            </button>
            <button
              type="button"
              className={scanDirection === "out" ? "btn" : "btn btn-outline"}
              onClick={() => setScanDirection("out")}
            >
              {t("kitchen.scanOut")}
            </button>
          </div>
        </div>
        {scanMessage ? (
          <p className="lead" style={{ fontSize: "0.9rem", margin: "0.5rem 0 0", color: "#86efac" }}>
            {scanMessage}
          </p>
        ) : null}
        <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
          {t("kitchen.scanCodesHint")}
        </p>
      </article>

      <div className="module-grid tenant-panel-grid">
        <article className="card">
          <h4>{t("kitchen.inventory")}</h4>
          <div className="mockup-table-wrap tenant-table-scroll">
            <table className="mockup-table tenant-stock-table">
              <thead>
                <tr>
                  <th>{t("kitchen.ingredient")}</th>
                  <th>{t("kitchen.scanCodeCol")}</th>
                  <th>{t("kitchen.stock")}</th>
                  <th>{t("kitchen.minimum")}</th>
                </tr>
              </thead>
              <tbody>
                {kitchen.items.map((item) => (
                  <tr key={item.id}>
                    <td data-label={t("kitchen.ingredient")}>{item.name}</td>
                    <td data-label={t("kitchen.scanCodeCol")} className="kpi-label">
                      {item.barcode || dakinisStockDemoBarcode(item.slug)}
                    </td>
                    <td
                      data-label={t("kitchen.stock")}
                      style={item.quantity < item.minQuantity ? { color: "#fdba74" } : undefined}
                    >
                      {dakinisFormatQty(item.quantity, item.unit)}
                    </td>
                    <td data-label={t("kitchen.minimum")}>{dakinisFormatQty(item.minQuantity, item.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-outline tenant-touch-btn" disabled={busy} onClick={dakinisApplyDemoPurchase}>
            {t("kitchen.demoPurchase")}
          </button>
        </article>

        <article className="card">
          <h4>{t("kitchen.recipes")}</h4>
          {kitchen.recipes.map((recipe) => (
            <div key={recipe.id} style={{ marginBottom: "1rem" }}>
              <p>
                <strong>{recipe.name}</strong> → {recipe.outputQuantity} {recipe.outputUnit} ({recipe.outputLabel})
              </p>
              <ul>
                {recipe.lines.map((line) => (
                  <li key={`${recipe.id}-${line.itemSlug}`}>
                    {line.quantity} {line.unit} — {itemNames[line.itemSlug] || line.itemSlug}
                  </li>
                ))}
              </ul>
              <p className="kpi-label">
                {t("kitchen.maxBatches", {
                  count: kitchen.maxPerRecipe.find((m) => m.recipeSlug === recipe.slug)?.maxBatches ?? 0
                })}
              </p>
              <label className="mockup-field">
                <span>{t("kitchen.batches")}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={plan.find((p) => p.recipeSlug === recipe.slug)?.batches ?? 0}
                  onChange={(e) => dakinisUpdatePlanBatch(recipe.slug, e.target.value)}
                />
              </label>
            </div>
          ))}
          <div className="tenant-action-row">
            <button type="button" className="btn btn-outline tenant-touch-btn" disabled={busy} onClick={dakinisRunSimulate}>
              {t("kitchen.simulate")}
            </button>
            <button
              type="button"
              className="btn tenant-touch-btn"
              disabled={busy || !apiSession?.token}
              onClick={dakinisApplyProduction}
            >
              {t("kitchen.registerProduction")}
            </button>
          </div>
          {simulation ? (
            <div style={{ marginTop: "0.75rem" }}>
              {simulation.validation?.ok ? (
                <p className="lead" style={{ color: "#86efac" }}>
                  {t("kitchen.planOk")}{" "}
                  {simulation.outputs?.map((o) => `${o.totalOutput} ${o.outputLabel}`).join(" · ")}
                </p>
              ) : (
                <ul>
                  {simulation.validation?.shortages?.map((s) => (
                    <li key={s.itemSlug} style={{ color: "#fdba74" }}>
                      {t("kitchen.shortage", {
                        item: itemNames[s.itemSlug] || s.itemSlug,
                        needed: s.needed,
                        available: s.available
                      })}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </article>
      </div>

      {kitchen.productionHistory?.length ? (
        <article className="card" style={{ marginTop: "1rem" }}>
          <h4>{t("kitchen.lastProductions")}</h4>
          <ul>
            {kitchen.productionHistory.map((b) => (
              <li key={b.id}>
                <strong>{b.label}</strong> — {new Date(b.createdAt).toLocaleString(dateLocale)}
                {b.outputs?.map((o) => (
                  <span key={o.recipeSlug}>
                    {" "}
                    · {o.totalOutput} {o.outputLabel}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <RestaurantAllergenPanel
        apiSession={apiSession}
        fetchOpts={fetchOpts}
        profile={kitchen.profile}
        onSaved={reload}
        busy={busy}
        setBusy={setBusy}
        setError={setError}
      />
    </section>
  );
}
