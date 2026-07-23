import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  dakinisLotQrUrl,
  dakinisIsLotLabelCode
} from "@dakinis/shared/catalog/inventory-lots.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisTenantFetchKey } from "../utils/sessionIdentity.js";
import { INVENTORY_LOTS_INITIAL, inventoryLotsReducer } from "./inventoryLotsReducer.js";
import {
  InventoryLotsFridgesTab,
  InventoryLotsGuideTab,
  InventoryLotsReceiveTab,
  InventoryLotsScanTab,
  InventoryLotsSummaryTab,
  InventoryLotsTableTab
} from "./InventoryLotsTabBody.jsx";

const DEMO_LOCATIONS = [
  { id: "demo-nevera-1", slug: "nevera-1", name: "Nevera 1", kind: "fridge" },
  { id: "demo-nevera-2", slug: "nevera-2", name: "Nevera 2", kind: "fridge" },
  { id: "demo-congelador", slug: "congelador", name: "Congelador", kind: "freezer" },
  { id: "demo-almacen", slug: "almacen", name: "Almacén", kind: "storage" }
];

function dakinisDemoLots() {
  const in3 = new Date();
  in3.setDate(in3.getDate() + 3);
  const in7 = new Date();
  in7.setDate(in7.getDate() + 6);
  const in30 = new Date();
  in30.setDate(in30.getDate() + 28);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return [
    {
      id: "demo-1",
      labelCode: "LOT-2026-000042",
      productName: "Yogur natural 1L",
      supplierLot: "YG2548",
      expiryDate: fmt(in3),
      quantityRemaining: 24,
      locationName: "Nevera 1",
      expirySeverity: "critical",
      daysUntilExpiry: 3
    },
    {
      id: "demo-2",
      labelCode: "LOT-2026-000041",
      productName: "Queso manchego",
      supplierLot: "QM1122",
      expiryDate: fmt(in7),
      quantityRemaining: 8,
      locationName: "Nevera 2",
      expirySeverity: "warning",
      daysUntilExpiry: 6
    },
    {
      id: "demo-3",
      labelCode: "LOT-2026-000040",
      productName: "Pollo troceado",
      supplierLot: "PO8891",
      expiryDate: fmt(in30),
      quantityRemaining: 12,
      locationName: "Congelador",
      expirySeverity: "ok",
      daysUntilExpiry: 28
    }
  ];
}

function SeverityBadge({ severity, t }) {
  const label = t(`inventoryLots.severity.${severity}`) || severity;
  return <span className={`inventory-lot-severity inventory-lot-severity--${severity}`}>{label}</span>;
}

function LotLabelCard({ lot, t, onPrint }) {
  const qrUrl = dakinisLotQrUrl(lot.labelCode, 160);
  return (
    <article className="card inventory-lot-label">
      <p className="kicker">{t("inventoryLots.labelPreview")}</p>
      <strong>{lot.productName}</strong>
      <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
        {t("inventoryLots.supplierLot")}: {lot.supplierLot || "—"}
      </p>
      <p className="kpi-label">
        {t("inventoryLots.expiry")}: {lot.expiryDate}
      </p>
      <p style={{ fontFamily: "monospace", fontWeight: 700, margin: "0.5rem 0" }}>{lot.labelCode}</p>
      {qrUrl ? <img src={qrUrl} width={160} height={160} alt="" className="inventory-lot-label__qr" /> : null}
      <button type="button" className="btn btn-outline" style={{ marginTop: "0.5rem" }} onClick={onPrint}>
        {t("inventoryLots.printLabel")}
      </button>
    </article>
  );
}

export default function InventoryLotsPanel({ apiSession, tenantSlugForVertical, activeSystemKey }) {
  const { t } = useLocale();
  const [state, dispatch] = useReducer(inventoryLotsReducer, INVENTORY_LOTS_INITIAL);
  const {
    tab,
    locations,
    lots,
    summary,
    byLocation,
    error,
    busy,
    lastLabel,
    scanResult,
    productBarcode,
    productName,
    supplierLot,
    expiryDate,
    quantity,
    locationId,
    supplier
  } = state;

  const setTab = (value) => dispatch({ type: "setTab", tab: value });
  const setError = (value) => dispatch({ type: "setError", error: value });
  const setBusy = (value) => dispatch({ type: "setBusy", busy: value });
  const setLastLabel = (value) => dispatch({ type: "setLastLabel", lastLabel: value });
  const setScanResult = (value) => dispatch({ type: "setScanResult", scanResult: value });
  const setProductBarcode = (value) => dispatch({ type: "setField", field: "productBarcode", value });
  const setProductName = (value) => dispatch({ type: "setField", field: "productName", value });
  const setSupplierLot = (value) => dispatch({ type: "setField", field: "supplierLot", value });
  const setExpiryDate = (value) => dispatch({ type: "setField", field: "expiryDate", value });
  const setQuantity = (value) => dispatch({ type: "setField", field: "quantity", value });
  const setLocationId = (value) => dispatch({ type: "setField", field: "locationId", value });
  const setSupplier = (value) => dispatch({ type: "setField", field: "supplier", value });
  const setLots = (value) =>
    dispatch({ type: "setField", field: "lots", value: typeof value === "function" ? value(lots) : value });

  const isDemo = !apiSession?.token;
  const fetchOpts = useMemo(
    () => ({
      businessId: tenantSlugForVertical,
      businessTypeHeader: activeSystemKey
    }),
    [tenantSlugForVertical, activeSystemKey]
  );
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;
  const fetchKey = dakinisTenantFetchKey(apiSession, [tenantSlugForVertical, activeSystemKey]);

  const loadDemo = useCallback(() => {
    const demoLots = dakinisDemoLots();
    dispatch({
      type: "loadedDemo",
      locations: DEMO_LOCATIONS,
      lots: demoLots,
      summary: { critical: 1, warning: 1, ok: 1, expired: 0 },
      byLocation: {
        "Nevera 1": [demoLots[0]],
        "Nevera 2": [demoLots[1]],
        Congelador: [demoLots[2]]
      },
      locationId: locationId || DEMO_LOCATIONS[0]?.id || ""
    });
  }, [locationId]);

  const reload = useCallback(async () => {
    if (isDemo) {
      loadDemo();
      return;
    }
    const sess = apiSessionRef.current;
    dispatch({ type: "setError", error: "" });
    try {
      const [locRes, sumRes] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/inventory/locations", sess, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/inventory/summary", sess, fetchOpts)
      ]);
      const locs = Array.isArray(locRes?.data?.locations) ? locRes.data.locations : [];
      dispatch({
        type: "loadedApi",
        locations: locs,
        lots: Array.isArray(sumRes?.data?.lots) ? sumRes.data.lots : [],
        summary: sumRes?.data?.summary ?? { critical: 0, warning: 0, ok: 0, expired: 0 },
        byLocation: sumRes?.data?.byLocation ?? {},
        locationId: locationId || locs[0]?.id || ""
      });
    } catch (e) {
      // API ausente o no provisionada: seed local sin ruido de error.
      if (e?.status === 404 || e?.code === "NOT_FOUND") {
        loadDemo();
        return;
      }
      dispatch({ type: "setError", error: e instanceof Error ? e.message : t("inventoryLots.loadError") });
      loadDemo();
    }
  }, [fetchKey, fetchOpts, isDemo, loadDemo, locationId, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleReceive(e) {
    e.preventDefault();
    if (isDemo) {
      const loc = locations.find((l) => l.id === locationId);
      const labelCode = `LOT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
      const lot = {
        id: `demo-${Date.now()}`,
        labelCode,
        productName: productName.trim() || "Producto demo",
        supplierLot: supplierLot.trim(),
        expiryDate,
        quantityRemaining: Number(quantity) || 1,
        locationName: loc?.name || "Almacén",
        expirySeverity: "ok",
        daysUntilExpiry: 14
      };
      dispatch({ type: "prependLot", lot });
      return;
    }

    dispatch({ type: "setBusy", busy: true });
    dispatch({ type: "setError", error: "" });
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/inventory/receive", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: {
          productBarcode: productBarcode.trim(),
          productName: productName.trim(),
          supplierLot: supplierLot.trim(),
          expiryDate,
          quantity: Number(quantity),
          locationId,
          supplier: supplier.trim()
        }
      });
      const lot = json?.data?.lot;
      dispatch({ type: "setLastLabel", lastLabel: lot });
      dispatch({ type: "resetReceiveForm" });
      await reload();
    } catch (err) {
      dispatch({ type: "setError", error: err instanceof Error ? err.message : t("inventoryLots.receiveError") });
    } finally {
      dispatch({ type: "setBusy", busy: false });
    }
  }

  async function handleScanCode(code) {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return;

    if (dakinisIsLotLabelCode(normalized)) {
      if (isDemo) {
        const lot = lots.find((l) => l.labelCode.toUpperCase() === normalized);
        setScanResult(lot || { labelCode: normalized, productName: t("inventoryLots.demoNotFound") });
        return;
      }
      try {
        const json = await dakinisTenantJsonFetch(
          `/api/tenant/inventory/lots/resolve/${encodeURIComponent(normalized)}`,
          apiSession,
          fetchOpts
        );
        setScanResult(json?.data?.lot ?? null);
      } catch (err) {
        setScanResult({ error: err instanceof Error ? err.message : t("inventoryLots.scanError") });
      }
      return;
    }

    setProductBarcode(normalized);
    if (tab !== "receive") dispatch({ type: "setTab", tab: "receive" });
  }

  function printLabel(lot) {
    if (!lot) return;
    const qrUrl = dakinisLotQrUrl(lot.labelCode, 200);
    const win = window.open("", "_blank", "width=420,height=520");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${lot.labelCode}</title>
      <style>body{font-family:sans-serif;padding:16px} .code{font-family:monospace;font-size:14px;font-weight:bold}</style></head><body>
      <strong>${lot.productName}</strong><br/>
      ${t("inventoryLots.supplierLot")}: ${lot.supplierLot || "—"}<br/>
      ${t("inventoryLots.expiry")}: ${lot.expiryDate}<br/>
      <span class="code">${lot.labelCode}</span><br/>
      <img src="${qrUrl}" width="200" height="200" alt="QR"/>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  }

  const tabs = [
    { id: "summary", label: t("inventoryLots.tabSummary") },
    { id: "receive", label: t("inventoryLots.tabReceive") },
    { id: "fridges", label: t("inventoryLots.tabFridges") },
    { id: "lots", label: t("inventoryLots.tabLots") },
    { id: "scan", label: t("inventoryLots.tabScan") },
    { id: "guide", label: t("inventoryLots.tabGuide") }
  ];

  return (
    <section className="inventory-lots-panel card" style={{ marginTop: "1.5rem" }}>
      <div className="inventory-lots-panel__head">
        <div>
          <p className="kicker">{t("inventoryLots.kicker")}</p>
          <h3 style={{ margin: "0.25rem 0 0" }}>{t("inventoryLots.title")}</h3>
          <p className="lead" style={{ fontSize: "0.9rem", margin: "0.35rem 0 0" }}>
            {t("inventoryLots.lead")}
          </p>
        </div>
        {isDemo ? <span className="mockup-badge">{t("inventoryLots.demoMode")}</span> : null}
      </div>

      <div className="inventory-lots-panel__tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "btn" : "btn btn-outline"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="lead" style={{ color: "#fdba74", marginTop: "0.75rem" }}>
          {error}
        </p>
      ) : null}

      {tab === "summary" ? <InventoryLotsSummaryTab summary={summary} t={t} /> : null}

      {tab === "receive" ? (
        <InventoryLotsReceiveTab
          t={t}
          busy={busy}
          lastLabel={lastLabel}
          LotLabelCard={LotLabelCard}
          printLabel={printLabel}
          handleReceive={handleReceive}
          locations={locations}
          productBarcode={productBarcode}
          setProductBarcode={setProductBarcode}
          productName={productName}
          setProductName={setProductName}
          supplierLot={supplierLot}
          setSupplierLot={setSupplierLot}
          expiryDate={expiryDate}
          setExpiryDate={setExpiryDate}
          quantity={quantity}
          setQuantity={setQuantity}
          locationId={locationId}
          setLocationId={setLocationId}
          supplier={supplier}
          setSupplier={setSupplier}
        />
      ) : null}

      {tab === "fridges" ? (
        <InventoryLotsFridgesTab byLocation={byLocation} SeverityBadge={SeverityBadge} t={t} />
      ) : null}

      {tab === "lots" ? <InventoryLotsTableTab lots={lots} SeverityBadge={SeverityBadge} t={t} /> : null}

      {tab === "scan" ? (
        <InventoryLotsScanTab t={t} scanResult={scanResult} SeverityBadge={SeverityBadge} handleScanCode={handleScanCode} />
      ) : null}

      {tab === "guide" ? <InventoryLotsGuideTab t={t} /> : null}
    </section>
  );
}
