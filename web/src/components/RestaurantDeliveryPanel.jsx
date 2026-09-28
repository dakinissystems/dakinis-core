import { useCallback, useEffect, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";

/**
 * Delivery — vistas Operación (encargado) vs Configuración (admin).
 * Alias canónico futuro: HospitalityDeliveryModule.
 */
export default function RestaurantDeliveryPanel({ apiSession, fetchOpts, t }) {
  const label = (key, fallback, vars) => {
    try {
      const v = typeof t === "function" ? t(key, fallback, vars) : undefined;
      return v && v !== key ? v : fallback;
    } catch {
      return fallback;
    }
  };
  const [view, setView] = useState("ops"); // ops | config
  const [dashboard, setDashboard] = useState(null);
  const [providers, setProviders] = useState([]);
  const [lists, setLists] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobCounts, setJobCounts] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = useCallback(async () => {
    if (!apiSession?.token) return;
    setError("");
    try {
      const [dash, pl, j, prov] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/dashboard", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/price-lists", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/jobs", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/providers", apiSession, fetchOpts)
      ]);
      setDashboard(dash?.data || null);
      setLists(Array.isArray(pl?.data?.lists) ? pl.data.lists : []);
      setJobs(Array.isArray(j?.data?.jobs) ? j.data.jobs : []);
      setJobCounts(j?.data?.counts || null);
      setProviders(Array.isArray(prov?.data?.providers) ? prov.data.providers : dash?.data?.providers || []);
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
      const dup = json?.data?.duplicate ? " (idempotente)" : "";
      setNotice(
        label("restaurant.deliverySimulated", "Pedido manual simulado") +
          `: #${json?.data?.order?.orderNumber || json?.data?.order?.id || ""}${dup}`
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

  const todayCounts = dashboard?.todayCounts || {};
  const healthRows = providers.length ? providers : dashboard?.integrations || [];

  function statusDot(status) {
    if (status === "online" || status === "ok" || status === "connected") return "●";
    if (status === "error_token" || status === "failed" || status === "stub" || status === "degraded") return "●";
    return "○";
  }

  function statusColor(status) {
    if (status === "online" || status === "ok" || status === "connected") return "#34d399";
    if (status === "error_token" || status === "failed" || status === "stub" || status === "degraded") return "#fb923c";
    return "#94a3b8";
  }

  function jobLine(job) {
    const bits = [job.provider, job.job_type, job.status];
    if (job.retryLabel) bits.push(job.retryLabel);
    if (job.waitingLabel) bits.push(job.waitingLabel);
    if (job.last_error) bits.push(`— ${job.last_error}`);
    return bits.join(" · ");
  }

  return (
    <div className="restaurant-delivery restaurant-delivery--ops" style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className={view === "ops" ? "btn" : "btn btn-outline"}
          onClick={() => setView("ops")}
        >
          {label("restaurant.deliveryViewOps", "Operación")}
        </button>
        <button
          type="button"
          className={view === "config" ? "btn" : "btn btn-outline"}
          onClick={() => setView("config")}
        >
          {label("restaurant.deliveryViewConfig", "Configuración")}
        </button>
      </div>

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

      {view === "ops" ? (
        <>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{label("restaurant.deliveryOrdersTitle", "Pedidos activos")}</h4>
            <p className="kpi-label">
              {label("restaurant.deliveryOrdersLead", "Volumen por canal · incidencias · tiempo.")}
            </p>

            <ul className="restaurant-delivery__channels">
              {Object.keys(todayCounts).length === 0 ? (
                <li className="kpi-label">—</li>
              ) : (
                Object.entries(todayCounts)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .map(([ch, n]) => (
                    <li key={ch}>
                      <strong className="restaurant-delivery__ch-count">{n}</strong>
                      <span className="restaurant-delivery__ch-name">{ch}</span>
                    </li>
                  ))
              )}
            </ul>

            <div style={{ marginTop: "0.75rem" }}>
              <p className="kpi-label" style={{ marginBottom: "0.35rem" }}>
                {label("restaurant.deliveryHealth", "Canales")}
              </p>
              <ul className="kpi-label" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {healthRows.slice(0, 8).map((row) => (
                  <li key={row.provider}>
                    <span style={{ color: statusColor(row.status) }}>{statusDot(row.status)}</span>{" "}
                    {row.label || row.provider}: {row.status}
                    {row.pending != null ? ` · ${row.pending} pend.` : ""}
                    {row.lastSync ? ` · sync ${row.lastSync}` : ""}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <button type="button" className="btn" disabled={busy} onClick={simulateOrder}>
                {label("restaurant.deliverySimulate", "Simular pedido Manual")}
              </button>
              <span className="kpi-label">
                {label("restaurant.deliveryPending", "Pendientes marketplace")}:{" "}
                <strong>{dashboard?.pendingMarketplace ?? 0}</strong>
              </span>
            </div>
          </article>

          {(jobs.length || jobCounts) && (
            <article className="card" style={{ marginTop: "1rem" }}>
              <h4 style={{ marginTop: 0 }}>{label("restaurant.deliveryJobs", "Cola / incidencias")}</h4>
              {jobCounts ? (
                <p className="kpi-label" style={{ marginTop: 0 }}>
                  Pending {jobCounts.pending || 0} · Running {jobCounts.running || 0} · Retry {jobCounts.retry || 0} ·
                  Failed {jobCounts.failed || 0} · Done {jobCounts.completed || 0}
                </p>
              ) : null}
              <ul className="kpi-label" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {jobs.slice(0, 10).map((job) => (
                  <li key={job.id}>{jobLine(job)}</li>
                ))}
              </ul>
            </article>
          )}
        </>
      ) : (
        <>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{label("restaurant.deliveryIntegrations", "Integraciones")}</h4>
            <p className="kpi-label">
              {label(
                "restaurant.deliveryConfigLead",
                "Credenciales, webhooks y tarifas. El encargado opera en la pestaña Operación."
              )}
            </p>
            <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
              {(dashboard?.integrations || []).map((row) => (
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
                    {label("restaurant.deliveryEnabled", "Activo")}
                  </label>
                </div>
              ))}
            </div>
          </article>

          <article className="card" style={{ marginTop: "1rem" }}>
            <h4 style={{ marginTop: 0 }}>{label("restaurant.priceListsTitle", "Tarifas por canal")}</h4>
            <p className="kpi-label">
              {label(
                "restaurant.priceListsLead",
                "PriceResolver: base → reglas canal → overrides. Campaign/coupon/taxes llegan después."
              )}
            </p>
            <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>{label("restaurant.priceListName", "Tarifa")}</th>
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
        </>
      )}
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
