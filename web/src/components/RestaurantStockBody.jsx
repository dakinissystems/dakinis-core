import { useState } from "react";
import { dakinisRestaurantValidatePlan } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisStockDemoBarcode } from "@dakinis/shared/catalog/stock-barcodes.js";
import RestaurantAllergenPanel from "./RestaurantAllergenPanel.jsx";
import StockBarcodeScanner from "./StockBarcodeScanner.jsx";
import { dakinisFormatQty } from "../hooks/useRestaurantStockSection.js";

export function RestaurantStockManualForm({
  t,
  kitchen,
  busy,
  dakinisApplyManualMove,
  dakinisApplyStockScan,
  dakinisConfirmStockScan,
  pendingScan,
  scanQty,
  setScanQty,
  scanDirection,
  setScanDirection,
  autoFocus = false
}) {
  const [method, setMethod] = useState("manual");
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [qty, setQty] = useState("1");
  const [direction, setDirection] = useState("in");
  const isNew = itemId === "__new__";
  const item = (kitchen?.items || []).find((row) => row.id === itemId) || null;
  const amount = Number(qty);
  const current = item && item.quantity != null ? Number(item.quantity) : null;
  const next =
    item && Number.isFinite(current) && Number.isFinite(amount)
      ? direction === "out"
        ? current - amount
        : current + amount
      : null;
  const blocked = !Number.isFinite(amount) || amount <= 0 || (direction === "out" && next != null && next < 0);
  const canSubmit = !busy && !blocked && (isNew ? name.trim() : Boolean(item));

  async function onConfirm() {
    const ok = await dakinisApplyManualMove?.({
      itemId: isNew ? "" : itemId,
      name,
      unit: isNew ? unit : item?.unit,
      quantity: amount,
      direction: isNew ? "in" : direction
    });
    if (ok) {
      setQty("1");
      if (isNew) setName("");
    }
  }

  return (
    <article className="card" style={{ marginBottom: "1rem" }}>
      <h4 style={{ marginTop: 0 }}>{t("kitchen.movementTitle")}</h4>
      <p className="kpi-label">{t("kitchen.movementLead")}</p>
      <div className="stock-scan-actions__dir" role="group" aria-label={t("kitchen.movementMethod")}>
        <button type="button" className={method === "manual" ? "btn" : "btn btn-outline"} onClick={() => setMethod("manual")}>
          {t("kitchen.movementManual")}
        </button>
        <button type="button" className={method === "wedge" ? "btn" : "btn btn-outline"} onClick={() => setMethod("wedge")}>
          {t("kitchen.movementWedge")}
        </button>
        <button type="button" className={method === "camera" ? "btn" : "btn btn-outline"} onClick={() => setMethod("camera")}>
          {t("kitchen.movementCamera")}
        </button>
      </div>
      {method === "manual" ? null : (
        <StockBarcodeScanner onScan={dakinisApplyStockScan} t={t} autoFocus={autoFocus && method === "wedge"} method={method} />
      )}
      <div className="stock-scan-actions stock-scan-actions--stack">
        {method === "manual" ? (
          <label className="mockup-field">
            <span>{t("kitchen.manualProduct")}</span>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">{t("kitchen.manualChoose")}</option>
              {(kitchen?.items || []).map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
              <option value="__new__">{t("kitchen.manualNew")}</option>
            </select>
          </label>
        ) : null}
        {method === "manual" && isNew ? (
          <>
            <label className="mockup-field">
              <span>{t("kitchen.manualName")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="mockup-field">
              <span>{t("kitchen.manualUnit")}</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">L</option>
                <option value="ml">ml</option>
                <option value="u">u</option>
              </select>
            </label>
            <p className="kpi-label">Un producto nuevo solo admite entrada.</p>
          </>
        ) : null}
        {method === "manual" && !itemId ? (
          <p className="kpi-label">
            Ningún producto seleccionado. El tipo de movimiento y la cantidad aparecerán después de identificarlo.
          </p>
        ) : null}
        {method !== "manual" && !pendingScan?.code ? (
          <p className="kpi-label">Identifica el producto con el lector o la cámara para continuar.</p>
        ) : null}
        {(method === "manual" && item && !isNew) || (method !== "manual" && pendingScan?.code) || isNew ? (
          <>
            {!isNew ? (
              <div className="stock-scan-actions__dir" role="group" aria-label={t("kitchen.scanDirection")}>
                <button type="button" className={direction === "in" ? "btn" : "btn btn-outline"} onClick={() => { setDirection("in"); setScanDirection?.("in"); }}>
                  {t("kitchen.scanIn")}
                </button>
                <button type="button" className={direction === "out" ? "btn" : "btn btn-outline"} onClick={() => { setDirection("out"); setScanDirection?.("out"); }}>
                  {t("kitchen.scanOut")}
                </button>
              </div>
            ) : null}
            <label className="mockup-field">
              <span>
                {t("kitchen.manualQty")}
                {item?.unit ? ` (${item.unit})` : pendingScan?.unit ? ` (${pendingScan.unit})` : isNew ? ` (${unit})` : ""}
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                inputMode="decimal"
                value={qty}
                onChange={(e) => {
                  setQty(e.target.value);
                  setScanQty?.(e.target.value);
                }}
              />
            </label>
            {method !== "manual" && pendingScan?.code ? (
              <p className="kpi-label">
                <strong>{pendingScan.name || "Producto identificado"}</strong>
                {" · "}
                {t("kitchen.manualCurrent")}: {dakinisFormatQty(pendingScan.quantity, pendingScan.unit)}
                {" · "}
                {t("kitchen.manualResult")}: {dakinisResultingStock(pendingScan, qty, direction)}
              </p>
            ) : null}
            {item ? (
              <p className="kpi-label">
                {t("kitchen.manualCurrent")}: {dakinisFormatQty(item.quantity, item.unit)}
                {" · "}
                {t("kitchen.manualResult")}:{" "}
                {next != null && next < 0 ? t("kitchen.manualShort") : next != null ? `${next} ${item.unit || ""}` : t("kitchen.manualUnknown")}
              </p>
            ) : null}
            <button
              type="button"
              className="btn"
              disabled={method === "manual" ? !canSubmit : busy || !pendingScan?.code || dakinisScanBlocked(pendingScan, qty, direction)}
              onClick={() => {
                if (method === "manual") {
                  onConfirm();
                  return;
                }
                dakinisConfirmStockScan?.({ quantity: qty, direction });
              }}
            >
              {(method === "manual" ? direction : scanDirection) === "out" && !(method === "manual" && isNew)
                ? t("kitchen.manualConfirmOut")
                : t("kitchen.manualConfirmIn")}
            </button>
          </>
        ) : (
          <button type="button" className="btn" disabled>
            Continuar
          </button>
        )}
      </div>
    </article>
  );
}

export function RestaurantStockScanPanel({
  t,
  dakinisApplyStockScan,
  dakinisConfirmStockScan,
  pendingScan,
  scanQty,
  setScanQty,
  scanDirection,
  setScanDirection,
  scanMessage,
  unknownBarcode,
  newProductName,
  setNewProductName,
  newProductUnit,
  setNewProductUnit,
  newProductMin,
  setNewProductMin,
  newProductExpiry,
  setNewProductExpiry,
  busy,
  dakinisCreateProductFromScan,
  setScanMessage,
  autoFocus = false,
  createOnly = false
}) {
  return (
    <article className="card stock-panel__scan" style={{ marginBottom: "1rem" }}>
      {createOnly ? null : (
        <>
      <h4 style={{ marginTop: 0 }}>{t("kitchen.scanTitle")}</h4>
      <StockBarcodeScanner onScan={dakinisApplyStockScan} t={t} autoFocus={autoFocus} />
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
        {pendingScan?.code ? (
          <div className="kpi-label">
            <p style={{ margin: "0.35rem 0" }}>
              <strong>{pendingScan.name || "Producto identificado"}</strong>
            </p>
            <p style={{ margin: "0.2rem 0" }}>
              Stock actual:{" "}
              {pendingScan.quantity == null
                ? "Sin registro"
                : `${pendingScan.quantity} ${pendingScan.unit || ""}`.trim()}
            </p>
            <p style={{ margin: "0.2rem 0" }}>
              Stock resultante: {dakinisResultingStock(pendingScan, scanQty, scanDirection)}
            </p>
          </div>
        ) : null}
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
          <button
            type="button"
            className="btn"
            disabled={busy || !pendingScan?.code || dakinisScanBlocked(pendingScan, scanQty, scanDirection)}
            onClick={() => dakinisConfirmStockScan?.()}
          >
            Confirmar {scanDirection === "out" ? "salida" : "entrada"}
          </button>
        </div>
      </div>
      {scanMessage ? (
        <p
          className="lead"
          style={{
            fontSize: "0.9rem",
            margin: "0.5rem 0 0",
            color: unknownBarcode ? "var(--dakinis-warning)" : "var(--dakinis-success)"
          }}
        >
          {scanMessage}
        </p>
      ) : null}
        </>
      )}

      {unknownBarcode ? (
        <form className="mockup-form card" style={{ marginTop: "1rem" }} onSubmit={dakinisCreateProductFromScan}>
          <p className="kpi-label">{t("kitchen.scanAddProductLead")}</p>
          <p className="kpi-label">
            {t("kitchen.scanCode")}: <strong>{unknownBarcode}</strong>
          </p>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductName")}</span>
            <input
              value={newProductName}
              onChange={(ev) => setNewProductName(ev.target.value)}
              required
              placeholder={t("kitchen.scanProductNamePlaceholder")}
            />
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductUnit")}</span>
            <select value={newProductUnit} onChange={(ev) => setNewProductUnit(ev.target.value)}>
              <option value="u">u</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.minimum")}</span>
            <input
              type="number"
              min="0"
              step="any"
              value={newProductMin}
              onChange={(ev) => setNewProductMin(ev.target.value)}
            />
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductExpiry")}</span>
            <input
              type="date"
              value={newProductExpiry}
              onChange={(ev) => setNewProductExpiry(ev.target.value)}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="submit" className="btn" disabled={busy || !newProductName.trim()}>
              {t("kitchen.scanAddProduct")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() => {
                setNewProductName("");
                setNewProductUnit("u");
                setNewProductMin("0");
                setNewProductExpiry("");
                setScanMessage(t("kitchen.scanUnknownPrompt"));
              }}
            >
              {t("kitchen.scanAddProductCancel")}
            </button>
          </div>
        </form>
      ) : null}

      <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
        {t("kitchen.scanCodesHint")}
      </p>
    </article>
  );
}

export function RestaurantStockInventoryGrid({
  t,
  kitchen,
  busy,
  dakinisApplyDemoPurchase,
  plan,
  itemNames,
  dakinisUpdatePlanBatch,
  dakinisRunSimulate,
  apiSession,
  dakinisApplyProduction,
  simulation
}) {
  return (
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
                  <td data-label={t("kitchen.stock")} style={dakinisStockTone(item)}>
                    {dakinisStockLabel(item)}
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
        <h5>Historial de movimientos</h5>
        {Array.isArray(kitchen.movements) && kitchen.movements.length ? (
          <ul className="kpi-label">
            {kitchen.movements.map((row) => (
              <li key={row.id}>
                {row.createdAt ? new Date(row.createdAt).toLocaleString("es-ES") : "Sin fecha"} · {row.name} ·{" "}
                {Number(row.delta) > 0 ? "+" : ""}
                {row.delta} {row.unit || ""} · {row.reason || "Sin motivo"}
                {row.actorEmail ? ` · ${row.actorEmail}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="kpi-label">No hay movimientos registrados.</p>
        )}
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
        <ProductionAvailability kitchen={kitchen} plan={plan} itemNames={itemNames} />
        <div className="tenant-action-row">
          <button type="button" className="btn btn-outline tenant-touch-btn" disabled={busy} onClick={dakinisRunSimulate}>
            {t("kitchen.simulate")}
          </button>
          <button
            type="button"
            className="btn tenant-touch-btn"
            disabled={busy || !apiSession?.token || !dakinisProductionAllowed(kitchen, plan)}
            onClick={dakinisApplyProduction}
          >
            {t("kitchen.registerProduction")}
          </button>
        </div>
        {simulation ? (
          <div style={{ marginTop: "0.75rem" }}>
            {simulation.validation?.ok ? (
              <p className="lead" style={{ color: "var(--dakinis-success)" }}>
                {t("kitchen.planOk")}{" "}
                {simulation.outputs?.map((o) => `${o.totalOutput} ${o.outputLabel}`).join(" · ")}
              </p>
            ) : (
              <ul>
                {simulation.validation?.shortages?.map((s) => (
                  <li key={s.itemSlug} style={{ color: "var(--dakinis-warning)" }}>
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
  );
}

function dakinisStockBySlug(kitchen) {
  const stock = {};
  for (const item of kitchen?.items || []) stock[item.slug] = item.quantity;
  return stock;
}

function dakinisProductionAllowed(kitchen, plan) {
  const active = (plan || []).filter((row) => Number(row.batches) > 0);
  if (!active.length || !kitchen?.recipes) return false;
  return dakinisRestaurantValidatePlan(active, kitchen.recipes, dakinisStockBySlug(kitchen)).ok;
}

function dakinisResultingStock(pending, qty, direction) {
  const current = Number(pending?.quantity);
  const amount = Number(qty);
  if (!Number.isFinite(current) || !Number.isFinite(amount)) return "Datos no disponibles";
  const next = direction === "out" ? current - amount : current + amount;
  if (next < 0) return "Insuficiente";
  return `${next} ${pending.unit || ""}`.trim();
}

function dakinisScanBlocked(pending, qty, direction) {
  return direction === "out" && dakinisResultingStock(pending, qty, direction) === "Insuficiente";
}

function dakinisStockLabel(item) {
  if (item?.quantity == null || item.quantity === "") return "Sin registro";
  const qty = Number(item.quantity);
  if (!Number.isFinite(qty)) return "Sin registro";
  const text = dakinisFormatQty(qty, item.unit);
  const min = Number(item.minQuantity);
  if (Number.isFinite(min) && qty < min) return `${text} · por debajo del mínimo`;
  if (qty === 0) return `${text} · stock real`;
  return text;
}

function dakinisStockTone(item) {
  const qty = Number(item?.quantity);
  const min = Number(item?.minQuantity);
  if (Number.isFinite(qty) && Number.isFinite(min) && qty < min) return { color: "var(--dakinis-warning)" };
  return undefined;
}

function ProductionAvailability({ kitchen, plan, itemNames }) {
  const active = (plan || []).filter((row) => Number(row.batches) > 0);
  if (!active.length || !kitchen?.recipes) return null;
  const validation = dakinisRestaurantValidatePlan(active, kitchen.recipes, dakinisStockBySlug(kitchen));
  const rows = Object.entries(validation.needed || {}).map(([slug, needed]) => {
    const available = Number(dakinisStockBySlug(kitchen)[slug] ?? 0);
    return { slug, needed, available, ok: available + 1e-6 >= needed };
  });
  return (
    <div style={{ margin: "0.5rem 0 0.75rem" }}>
      <p className="kpi-label" style={{ marginTop: 0 }}>
        {validation.ok
          ? "Hay stock para estas tandas."
          : "No se puede registrar la producción: falta stock. No hay una autorización de producción excepcional."}
      </p>
      <p className="kpi-label">Coste estimado: no calculado. Los ingredientes no tienen un coste guardado.</p>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th>Disponible</th>
            <th>Necesario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug}>
              <td>{itemNames[row.slug] || row.slug}</td>
              <td>{row.available}</td>
              <td>{row.needed}</td>
              <td>{row.ok ? "Suficiente" : "Insuficiente"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RestaurantStockProductionHistory({ t, kitchen, dateLocale }) {
  if (!kitchen.productionHistory?.length) return null;

  return (
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
  );
}

export function RestaurantStockAllergenSection({ apiSession, fetchOpts, kitchen, reload, busy, setBusy, setError }) {
  return (
    <RestaurantAllergenPanel
      apiSession={apiSession}
      fetchOpts={fetchOpts}
      profile={kitchen.profile}
      onSaved={reload}
      busy={busy}
      setBusy={setBusy}
      setError={setError}
    />
  );
}
