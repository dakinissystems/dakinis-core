import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DAKINIS_RESTAURANT_DEMO_PRODUCTION,
  DAKINIS_RESTAURANT_DEMO_PURCHASE
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisTenantJsonFetch } from "../services/api.js";
import RestaurantAllergenPanel from "./RestaurantAllergenPanel.jsx";

function dakinisFormatQty(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  if (unit === "g" && n >= 1000) return `${(n / 1000).toFixed(2)} kg`;
  if (unit === "ml" && n >= 1000) return `${(n / 1000).toFixed(2)} L`;
  return `${n} ${unit}`;
}

export default function RestaurantStockSection({ apiSession, tenantSlugForVertical, activeSystemKey }) {
  const [kitchen, setKitchen] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(() => DAKINIS_RESTAURANT_DEMO_PRODUCTION.map((p) => ({ ...p })));
  const [simulation, setSimulation] = useState(null);

  const fetchOpts = useMemo(
    () => ({
      businessId: tenantSlugForVertical,
      businessTypeHeader: activeSystemKey
    }),
    [tenantSlugForVertical, activeSystemKey]
  );

  const itemNames = useMemo(() => {
    const map = {};
    for (const item of kitchen?.items ?? []) map[item.slug] = item.name;
    return map;
  }, [kitchen?.items]);

  const reload = useCallback(async () => {
    setError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", apiSession, fetchOpts);
      const data = json?.data;
      setKitchen(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar cocina/stock");
    }
  }, [apiSession, fetchOpts]);

  useEffect(() => {
    reload();
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
      setError(e instanceof Error ? e.message : "Error al simular");
      setSimulation(null);
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
        body: { label: "Pedido Manu (demo)", lines: DAKINIS_RESTAURANT_DEMO_PURCHASE }
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar compra");
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
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stock insuficiente o error al producir");
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
        Cargando stock y recetas…
      </p>
    );
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3>Stock, recetas y producción</h3>
      <p className="lead">
        Recetas (Manu): <strong>Pizza</strong> — 1 prepizza con 1 kg harina, 600 ml agua, 25 g sal, 10 g levadura.
        <strong> Empanadas</strong> — 3 docenas con 1 kg cebolla, ½ kg morrón, 1 kg carne, 36 tapas, 4 huevos, ¼
        frasco aceitunas. Pedido ejemplo → ~4 prepizzas y ~3 docenas.
      </p>
      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      <div className="module-grid" style={{ display: "grid", gap: "1rem" }}>
        <article className="card">
          <h4>Inventario actual</h4>
          <div className="mockup-table-wrap">
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {kitchen.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td style={item.quantity < item.minQuantity ? { color: "#fdba74" } : undefined}>
                      {dakinisFormatQty(item.quantity, item.unit)}
                    </td>
                    <td>{dakinisFormatQty(item.minQuantity, item.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={dakinisApplyDemoPurchase}>
            Cargar pedido Manu (compra)
          </button>
        </article>

        <article className="card">
          <h4>Recetas y producción</h4>
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
                Máximo (solo esta receta):{" "}
                {kitchen.maxPerRecipe.find((m) => m.recipeSlug === recipe.slug)?.maxBatches ?? 0} tandas
              </p>
              <label className="mockup-field">
                <span>Tandas</span>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="button" className="btn btn-outline" disabled={busy} onClick={dakinisRunSimulate}>
              Simular consumo
            </button>
            <button type="button" className="btn" disabled={busy || !apiSession?.token} onClick={dakinisApplyProduction}>
              Registrar producción
            </button>
          </div>
          {simulation ? (
            <div style={{ marginTop: "0.75rem" }}>
              {simulation.validation?.ok ? (
                <p className="lead" style={{ color: "#86efac" }}>
                  Plan viable:{" "}
                  {simulation.outputs?.map((o) => `${o.totalOutput} ${o.outputLabel}`).join(" · ")}
                </p>
              ) : (
                <ul>
                  {simulation.validation?.shortages?.map((s) => (
                    <li key={s.itemSlug} style={{ color: "#fdba74" }}>
                      Falta {itemNames[s.itemSlug] || s.itemSlug}: necesitas {s.needed}, hay {s.available}
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
          <h4>Últimas producciones</h4>
          <ul>
            {kitchen.productionHistory.map((b) => (
              <li key={b.id}>
                <strong>{b.label}</strong> — {new Date(b.createdAt).toLocaleString("es-ES")}
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
