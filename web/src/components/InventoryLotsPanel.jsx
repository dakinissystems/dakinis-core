import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dakinisLotQrUrl,
  dakinisIsLotLabelCode
} from "@dakinis/shared/catalog/inventory-lots.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import StockBarcodeScanner from "./StockBarcodeScanner.jsx";

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
  const [tab, setTab] = useState("summary");
  const [locations, setLocations] = useState([]);
  const [lots, setLots] = useState([]);
  const [summary, setSummary] = useState({ critical: 0, warning: 0, ok: 0, expired: 0 });
  const [byLocation, setByLocation] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastLabel, setLastLabel] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const [productBarcode, setProductBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [supplierLot, setSupplierLot] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [locationId, setLocationId] = useState("");
  const [supplier, setSupplier] = useState("");

  const isDemo = !apiSession?.token;
  const fetchOpts = useMemo(
    () => ({
      businessId: tenantSlugForVertical,
      businessTypeHeader: activeSystemKey
    }),
    [tenantSlugForVertical, activeSystemKey]
  );

  const loadDemo = useCallback(() => {
    const demoLots = dakinisDemoLots();
    setLocations(DEMO_LOCATIONS);
    setLots(demoLots);
    setSummary({ critical: 1, warning: 1, ok: 1, expired: 0 });
    setByLocation({
      "Nevera 1": [demoLots[0]],
      "Nevera 2": [demoLots[1]],
      Congelador: [demoLots[2]]
    });
    if (!locationId && DEMO_LOCATIONS[0]) setLocationId(DEMO_LOCATIONS[0].id);
  }, [locationId]);

  const reload = useCallback(async () => {
    if (isDemo) {
      loadDemo();
      return;
    }
    setError("");
    try {
      const [locRes, sumRes] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/inventory/locations", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/inventory/summary", apiSession, fetchOpts)
      ]);
      const locs = locRes?.data?.locations ?? [];
      setLocations(locs);
      setLots(sumRes?.data?.lots ?? []);
      setSummary(sumRes?.data?.summary ?? { critical: 0, warning: 0, ok: 0, expired: 0 });
      setByLocation(sumRes?.data?.byLocation ?? {});
      if (!locationId && locs[0]) setLocationId(locs[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("inventoryLots.loadError"));
      loadDemo();
    }
  }, [apiSession, fetchOpts, isDemo, loadDemo, locationId, t]);

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
      setLots((prev) => [lot, ...prev]);
      setLastLabel(lot);
      return;
    }

    setBusy(true);
    setError("");
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
      setLastLabel(lot);
      setProductBarcode("");
      setSupplierLot("");
      setExpiryDate("");
      setQuantity("1");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("inventoryLots.receiveError"));
    } finally {
      setBusy(false);
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
    if (tab !== "receive") setTab("receive");
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

      {tab === "summary" ? (
        <div className="inventory-lots-summary">
          <div className="inventory-lots-summary__kpis">
            <article className="card inventory-lot-severity--critical">
              <p className="kpi-label">{t("inventoryLots.expire3d")}</p>
              <p className="kpi-value">{summary.critical ?? 0}</p>
            </article>
            <article className="card inventory-lot-severity--warning">
              <p className="kpi-label">{t("inventoryLots.expire7d")}</p>
              <p className="kpi-value">{summary.warning ?? 0}</p>
            </article>
            <article className="card inventory-lot-severity--ok">
              <p className="kpi-label">{t("inventoryLots.stockOk")}</p>
              <p className="kpi-value">{summary.ok ?? 0}</p>
            </article>
          </div>
          <p className="kpi-label">{t("inventoryLots.fifoNote")}</p>
        </div>
      ) : null}

      {tab === "receive" ? (
        <form className="inventory-lots-receive" onSubmit={handleReceive}>
          <p className="lead" style={{ fontSize: "0.9rem" }}>
            {t("inventoryLots.receiveLead")}
          </p>
          <div className="inventory-lots-receive__grid">
            <label className="mockup-field">
              <span>{t("inventoryLots.productBarcode")}</span>
              <input
                value={productBarcode}
                onChange={(e) => setProductBarcode(e.target.value)}
                placeholder="8412345678901"
              />
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.productName")}</span>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t("inventoryLots.productNamePlaceholder")}
                required
              />
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.supplierLot")}</span>
              <input value={supplierLot} onChange={(e) => setSupplierLot(e.target.value)} placeholder="A245" />
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.expiry")}</span>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.quantity")}</span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.location")}</span>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mockup-field">
              <span>{t("inventoryLots.supplier")}</span>
              <input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            </label>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit" className="btn" disabled={busy}>
              {t("inventoryLots.receiveCta")}
            </button>
          </div>
          {lastLabel ? (
            <div style={{ marginTop: "1rem" }}>
              <LotLabelCard lot={lastLabel} t={t} onPrint={() => printLabel(lastLabel)} />
            </div>
          ) : null}
        </form>
      ) : null}

      {tab === "fridges" ? (
        <div className="inventory-fridge-map">
          {Object.entries(byLocation).length === 0 ? (
            <p className="lead">{t("inventoryLots.noLots")}</p>
          ) : (
            Object.entries(byLocation).map(([locName, locLots]) => (
              <article key={locName} className="card inventory-fridge-map__zone">
                <h4 style={{ marginTop: 0 }}>{locName}</h4>
                <ul className="inventory-fridge-map__list">
                  {(locLots || []).map((lot) => (
                    <li key={lot.id || lot.labelCode}>
                      <strong>{lot.productName}</strong>
                      <span className="kpi-label">
                        {lot.supplierLot ? `${lot.supplierLot} · ` : ""}
                        {t("inventoryLots.expiry")} {lot.expiryDate}
                      </span>
                      <SeverityBadge severity={lot.expirySeverity} t={t} />
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "lots" ? (
        <div className="mockup-table-card">
          <table className="mockup-table">
            <thead>
              <tr>
                <th>{t("inventoryLots.colCode")}</th>
                <th>{t("inventoryLots.colProduct")}</th>
                <th>{t("inventoryLots.colLot")}</th>
                <th>{t("inventoryLots.colExpiry")}</th>
                <th>{t("inventoryLots.colQty")}</th>
                <th>{t("inventoryLots.colLocation")}</th>
                <th>{t("inventoryLots.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id || lot.labelCode}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{lot.labelCode}</td>
                  <td>{lot.productName}</td>
                  <td>{lot.supplierLot || "—"}</td>
                  <td>{lot.expiryDate}</td>
                  <td>{lot.quantityRemaining}</td>
                  <td>{lot.locationName || "—"}</td>
                  <td>
                    <SeverityBadge severity={lot.expirySeverity} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "scan" ? (
        <div>
          <p className="lead" style={{ fontSize: "0.9rem" }}>
            {t("inventoryLots.scanLead")}
          </p>
          <StockBarcodeScanner onScan={handleScanCode} t={t} hint={t("inventoryLots.scanHint")} />
          {scanResult ? (
            <article className="card" style={{ marginTop: "1rem" }}>
              {scanResult.error ? (
                <p>{scanResult.error}</p>
              ) : (
                <>
                  <strong>{scanResult.productName}</strong>
                  <p className="kpi-label">{scanResult.labelCode}</p>
                  <p>
                    {t("inventoryLots.supplierLot")}: {scanResult.supplierLot || "—"} · {t("inventoryLots.expiry")}:{" "}
                    {scanResult.expiryDate}
                  </p>
                  <p>
                    {t("inventoryLots.quantity")}: {scanResult.quantityRemaining} · {scanResult.locationName}
                  </p>
                  {scanResult.daysUntilExpiry != null ? (
                    <SeverityBadge severity={scanResult.expirySeverity} t={t} />
                  ) : null}
                </>
              )}
            </article>
          ) : null}
        </div>
      ) : null}

      {tab === "guide" ? (
        <div className="inventory-lots-guide">
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideQrTitle")}</h4>
            <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideQrLead")}</p>
            <ul>
              {(t("inventoryLots.guideQrBullets") || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideCostTitle")}</h4>
            <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideCostLead")}</p>
            <ul>
              {(t("inventoryLots.guideCostBullets") || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideFridgeTitle")}</h4>
            <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideFridgeLead")}</p>
          </article>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideFifoTitle")}</h4>
            <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideFifoLead")}</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
