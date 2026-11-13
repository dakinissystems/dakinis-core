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
  const [view, setView] = useState("ops"); // ops | config | requirements | diagnose
  const [focusProvider, setFocusProvider] = useState("");
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
        { ...fetchOpts, method: "PATCH", body: { enabled } }
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

  function channelState(row) {
    const value = String(row?.availability || row?.status || row || "");
    const table = {
      available: ["Disponible", "#94a3b8"],
      pending_access: ["Pendiente de acceso", "#fbbf24"],
      not_configured: ["No configurado", "#94a3b8"],
      connected: ["Conectado", "#34d399"],
      connection_error: ["Error de conexión", "#f87171"],
      coming_soon: ["Próximamente", "#94a3b8"],
      online: ["Conectado", "#34d399"],
      ok: ["Conectado", "#34d399"],
      error_token: ["Pendiente de acceso", "#fbbf24"],
      stub: ["Próximamente", "#94a3b8"],
      disabled: ["No configurado", "#94a3b8"],
      disconnected: ["No configurado", "#94a3b8"],
      offline: ["No configurado", "#94a3b8"]
    };
    const pair = table[value] || ["No configurado", "#94a3b8"];
    return { label: pair[0], color: pair[1], locked: value === "coming_soon" || value === "pending_access" || value === "stub" };
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

      {view === "requirements" || view === "diagnose" ? (
        <DeliveryFocusPanel
          view={view}
          row={(dashboard?.integrations || healthRows).find((item) => item.provider === focusProvider)}
          busy={busy}
          onBack={() => setView("ops")}
          onRetry={reload}
        />
      ) : view === "ops" ? (
        <>
          <article className="card">
            <h4 style={{ marginTop: 0 }}>{label("restaurant.deliveryOrdersTitle", "Pedidos activos")}</h4>
            <p className="kpi-label">
              {label("restaurant.deliveryOrdersLead", "Volumen por canal · incidencias · tiempo.")}
            </p>

            <ul className="restaurant-delivery__channels">
              {Object.keys(todayCounts).length === 0 ? (
                <li className="kpi-label">
                  {!dashboard
                    ? "Datos no disponibles"
                    : healthRows.some((row) => row.availability === "connected")
                      ? "No hay pedidos recibidos"
                      : "Sin canales conectados"}
                </li>
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

            <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))" }}>
              {healthRows.slice(0, 8).map((row) => {
                const state = channelState(row);
                return (
                  <article key={row.provider} className="card" style={{ margin: 0 }}>
                    <strong>{row.label || row.provider}</strong>
                    <p className="kpi-label" style={{ color: state.color, margin: "0.25rem 0" }}>{state.label}</p>
                    <p className="kpi-label">
                      {row.pending != null ? `${row.pending} pendientes` : "Pedidos pendientes: datos no disponibles"}
                    </p>
                    {row.lastSync ? <p className="kpi-label">Última sincronización: {row.lastSync}</p> : null}
                    {row.last_error || row.lastError ? <p className="kpi-label">{row.last_error || row.lastError}</p> : null}
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={
                        row.availability === "coming_soon" ||
                        row.status === "stub" ||
                        (row.availability === "connection_error" && !(row.last_error || row.lastError || row.detail))
                      }
                      onClick={() => {
                        setFocusProvider(row.provider);
                        if (row.availability === "pending_access") setView("requirements");
                        else if (row.availability === "connection_error") setView("diagnose");
                        else setView("config");
                      }}
                    >
                      {row.availability === "coming_soon" || row.status === "stub"
                        ? "No disponible aún"
                        : row.availability === "pending_access"
                          ? "Ver requisitos"
                          : row.availability === "connected"
                            ? "Gestionar"
                            : row.availability === "connection_error"
                              ? row.last_error || row.lastError || row.detail
                                ? "Diagnosticar"
                                : "Sin detalle de error"
                              : "Configurar"}
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
              {label("restaurant.deliveryPending", "Pendientes marketplace")}:{" "}
              <strong>{dashboard?.pendingMarketplace == null ? "Datos no disponibles" : dashboard.pendingMarketplace}</strong>
            </p>
          </article>

          <article className="card" style={{ marginTop: "0.75rem" }}>
            <h4 style={{ marginTop: 0 }}>Simulación</h4>
            <p className="kpi-label">Esto no entra un pedido real de un canal. Sirve para probar la pantalla.</p>
            <button type="button" className="btn btn-outline" disabled={busy} onClick={simulateOrder}>
              Crear pedido de prueba
            </button>
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
                    <span style={{ color: channelState(row).color, marginLeft: "0.35rem" }}>
                      {channelState(row).label}
                    </span>
                    <div className="kpi-label" style={{ marginTop: "0.15rem" }}>
                      {row.detail}
                    </div>
                  </div>
                  <label className="kpi-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <input
                      type="checkbox"
                      checked={!!row.enabled && !channelState(row).locked}
                      disabled={busy || channelState(row).locked}
                      onChange={(e) => toggleProvider(row.provider, e.target.checked)}
                    />
                    {channelState(row).locked ? "No activable" : label("restaurant.deliveryEnabled", "Activo")}
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

function DeliveryFocusPanel({ view, row, busy, onBack, onRetry }) {
  const detail = row?.detail || row?.notes || "";
  const errorText = row?.last_error || row?.lastError || "";
  return (
    <article className="card">
      <h4 style={{ marginTop: 0 }}>{view === "diagnose" ? "Diagnóstico" : "Requisitos"}</h4>
      <p className="kpi-label">{row?.label || row?.provider || "Canal"}</p>
      {view === "requirements" ? (
        <p>{detail || "Este canal está pendiente de acceso. No hay una lista de requisitos guardada."}</p>
      ) : (
        <p>{errorText || detail || "No hay un detalle técnico de este error."}</p>
      )}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>Volver</button>
        {view === "diagnose" ? (
          <button type="button" className="btn" disabled={busy} onClick={onRetry}>Reintentar</button>
        ) : null}
      </div>
    </article>
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
