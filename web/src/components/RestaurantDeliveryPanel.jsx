import { useCallback, useEffect, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";

/**
 * Dashboard Delivery + tarifas por canal (admin hospitality).
 */
export default function RestaurantDeliveryPanel({ apiSession, fetchOpts, t }) {
  const [dashboard, setDashboard] = useState(null);
  const [lists, setLists] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = useCallback(async () => {
    if (!apiSession?.token) return;
    setError("");
    try {
      const [dash, pl, j] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/dashboard", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/price-lists", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/jobs", apiSession, fetchOpts)
      ]);
      setDashboard(dash?.data || null);
      setLists(Array.isArray(pl?.data?.lists) ? pl.data.lists : []);
      setJobs(Array.isArray(j?.data?.jobs) ? j.data.jobs : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando delivery");
    }
  }, [apiSession, fetchOpts]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function toggleProvider(provider, enabled) {
    setBusy(true);
    setError("");
    try {
      await dakinisTenantJsonFetch(
        `/api/tenant/restaurant/delivery/integrations/${encodeURIComponent(provider)}`,
        apiSession,
        { ...fetchOpts, method: "PATCH", body: { enabled, status: enabled ? "online" : "disconnected" } }
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar integración");
    } finally {
      setBusy(false);
    }
  }

  async function simulateOrder() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/simulate", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: {}
      });
      setNotice(
        t?.("restaurant.deliverySimulated", "Pedido manual simulado") +
          `: #${json?.data?.order?.orderNumber || json?.data?.order?.id || ""}`
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulación fallida");
    } finally {
      setBusy(false);
    }
  }

  async function saveMarkup(listKey, markupPct) {
    setBusy(true);
    try {
      await dakinisTenantJsonFetch(`/api/tenant/restaurant/price-lists/${encodeURIComponent(listKey)}`, apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { markupPct: Number(markupPct) }
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando tarifa");
    } finally {
      setBusy(false);
    }
  }

  const integrations = dashboard?.integrations || [];
  const todayCounts = dashboard?.todayCounts || {};

  function statusDot(status) {
    if (status === "online" || status === "ok") return "●";
    if (status === "error_token" || status === "failed") return "●";
    return "○";
  }

  function statusColor(status) {
    if (status === "online" || status === "ok") return "#34d399";
    if (status === "error_token" || status === "failed" || status === "stub") return "#fb923c";
    return "#94a3b8";
  }

  return (
    <div className="restaurant-delivery" style={{ marginTop: "1.25rem" }}>
      <article className="card">
        <h4 style={{ marginTop: 0 }}>{t?.("restaurant.deliveryTitle", "Delivery")}</h4>
        <p className="kpi-label">
          {t?.(
            "restaurant.deliveryLead",
            "Integraciones por adaptador (Manual para pruebas). Glovo/Uber/Just Eat quedan listos cuando haya API partner. Los precios salen de tarifas por canal."
          )}
        </p>

        {error ? (
          <p className="lead" style={{ color: "#fdba74", fontSize: "0.9rem" }}>
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="kpi-label" style={{ color: "#5eead4" }}>
            {notice}
          </p>
        ) : null}

        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
          {integrations.map((row) => (
            <div
              key={row.provider}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--line, #1e293b)"
              }}
            >
              <div>
                <strong>{row.label}</strong>{" "}
                <span style={{ color: statusColor(row.status), marginLeft: "0.35rem" }}>
                  {statusDot(row.status)} {row.status}
                </span>
                <div className="kpi-label" style={{ marginTop: "0.15rem" }}>
                  {row.detail}
                </div>
              </div>
              <label className="kpi-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <input
                  type="checkbox"
                  checked={!!row.enabled}
                  disabled={busy}
                  onChange={(e) => toggleProvider(row.provider, e.target.checked)}
                />
                {t?.("restaurant.deliveryEnabled", "Activo")}
              </label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <button type="button" className="btn" disabled={busy} onClick={simulateOrder}>
            {t?.("restaurant.deliverySimulate", "Simular pedido Manual")}
          </button>
          <span className="kpi-label">
            {t?.("restaurant.deliveryPending", "Pendientes marketplace")}:{" "}
            <strong>{dashboard?.pendingMarketplace ?? 0}</strong>
          </span>
        </div>

        <h5 style={{ marginTop: "1.25rem" }}>{t?.("restaurant.deliveryToday", "Pedidos hoy por canal")}</h5>
        <ul className="kpi-label" style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
          {Object.keys(todayCounts).length === 0 ? (
            <li>—</li>
          ) : (
            Object.entries(todayCounts).map(([ch, n]) => (
              <li key={ch}>
                {ch}: <strong>{n}</strong>
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h4 style={{ marginTop: 0 }}>{t?.("restaurant.priceListsTitle", "Tarifas por canal")}</h4>
        <p className="kpi-label">
          {t?.(
            "restaurant.priceListsLead",
            "Sala / takeaway / Glovo… pueden tener markup distinto. Si no hay precio fijo, se aplica la regla sobre el precio base."
          )}
        </p>
        <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
          <table className="mockup-table">
            <thead>
              <tr>
                <th>{t?.("restaurant.priceListName", "Tarifa")}</th>
                <th>Markup %</th>
                <th>+ fijo (¢)</th>
                <th>Redondeo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lists.map((list) => (
                <PriceListRow key={list.id} list={list} busy={busy} onSave={saveMarkup} />
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {jobs.length ? (
        <article className="card" style={{ marginTop: "1rem" }}>
          <h4 style={{ marginTop: 0 }}>{t?.("restaurant.deliveryJobs", "Cola delivery")}</h4>
          <ul className="kpi-label" style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {jobs.slice(0, 8).map((job) => (
              <li key={job.id}>
                {job.provider} · {job.job_type} · {job.status}
                {job.last_error ? ` — ${job.last_error}` : ""}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}

function PriceListRow({ list, busy, onSave }) {
  const [pct, setPct] = useState(list.markupPct ?? "");
  useEffect(() => {
    setPct(list.markupPct ?? "");
  }, [list.markupPct]);

  return (
    <tr>
      <td>
        {list.name} <span className="kpi-label">({list.key})</span>
      </td>
      <td>
        <input
          type="number"
          value={pct}
          disabled={busy || list.key === "salon" || list.key === "barra"}
          onChange={(e) => setPct(e.target.value)}
          style={{ width: "4.5rem" }}
        />
      </td>
      <td>{list.markupFixedCents ?? "—"}</td>
      <td>{list.roundToCents ?? "—"}</td>
      <td>
        {list.key !== "salon" && list.key !== "barra" ? (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => onSave(list.key, pct)}>
            Guardar
          </button>
        ) : null}
      </td>
    </tr>
  );
}
