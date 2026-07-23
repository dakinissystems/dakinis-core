import { useCallback, useEffect, useRef, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisTenantFetchKey } from "../utils/sessionIdentity.js";

function dakinisSeverityStyle(severity) {
  if (severity === "warning") return { color: "#fb923c", fontWeight: 600 };
  if (severity === "critical") return { color: "#f87171", fontWeight: 600 };
  return { color: "#94a3b8" };
}

function dakinisSeverityLabel(severity) {
  if (severity === "warning") return "Atención";
  if (severity === "critical") return "Urgente";
  return "Info";
}

function dakinisNormalizeAlertRow(row) {
  return {
    id: row.id,
    title: row.title,
    productRef: row.productRef ?? row.product_ref ?? "—",
    condition: row.condition ?? row.condition_text ?? "",
    severity: row.severity || "info"
  };
}

function dakinisNormalizeDeliveryRow(row) {
  return {
    id: row.id,
    supplier: row.supplier,
    arrivalWindow: row.arrivalWindow ?? row.arrival_window ?? "",
    contents: row.contents ?? "",
    status: row.status ?? "Programado"
  };
}

const EMPTY_STRING_LIST = [];

export function useSupplyDeliveriesAndAlerts({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  supplierNames = EMPTY_STRING_LIST,
  productRefs = EMPTY_STRING_LIST,
  fallbackDeliveries = EMPTY_STRING_LIST,
  fallbackAlerts = EMPTY_STRING_LIST
}) {
  const canMutate = Boolean(apiSession?.token);
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;
  const supplyFetchKey = dakinisTenantFetchKey(apiSession, [tenantSlugForVertical, activeSystemKey]);

  const [deliveries, setDeliveries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSupply = useCallback(
    async (signal) => {
      const sess = apiSessionRef.current;
      if (!sess?.token) {
        setLoadError("");
        setLoading(false);
        setDeliveries(
          fallbackDeliveries.map((r, i) =>
            dakinisNormalizeDeliveryRow({ ...r, id: r.id || `fb-d-${i}` })
          )
        );
        setAlerts(
          fallbackAlerts.map((r, i) => dakinisNormalizeAlertRow({ ...r, id: r.id || `fb-a-${i}` }))
        );
        return;
      }
      setLoadError("");
      setLoading(true);
      try {
        const [dJson, aJson] = await Promise.all([
          dakinisTenantJsonFetch("/api/tenant/supply/deliveries", sess, {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          }),
          dakinisTenantJsonFetch("/api/tenant/supply/alerts", sess, {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          })
        ]);
        const dlist = dJson?.data?.deliveries;
        const alist = aJson?.data?.alerts;
        setDeliveries(Array.isArray(dlist) ? dlist.map(dakinisNormalizeDeliveryRow) : []);
        setAlerts(Array.isArray(alist) ? alist.map(dakinisNormalizeAlertRow) : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setLoadError(e instanceof Error ? e.message : "No se pudo cargar proveedores");
        setDeliveries(
          fallbackDeliveries.map((r, i) =>
            dakinisNormalizeDeliveryRow({ ...r, id: r.id || `fb-d-${i}` })
          )
        );
        setAlerts(
          fallbackAlerts.map((r, i) => dakinisNormalizeAlertRow({ ...r, id: r.id || `fb-a-${i}` }))
        );
      } finally {
        setLoading(false);
      }
    },
    [supplyFetchKey, tenantSlugForVertical, activeSystemKey, fallbackDeliveries, fallbackAlerts]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    loadSupply(ctrl.signal);
    return () => ctrl.abort();
  }, [loadSupply]);

  const [deliveryForm, setDeliveryForm] = useState({
    supplier: "",
    arrivalWindow: "",
    contents: "",
    status: "Programado"
  });

  const [alertForm, setAlertForm] = useState({
    title: "",
    productRef: "",
    condition: "",
    severity: "info"
  });

  async function handleAddDelivery(event) {
    event.preventDefault();
    if (!canMutate) return;
    if (!deliveryForm.supplier.trim() || !deliveryForm.arrivalWindow.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/supply/deliveries", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: {
          supplier: deliveryForm.supplier.trim(),
          arrivalWindow: deliveryForm.arrivalWindow.trim(),
          contents: deliveryForm.contents.trim(),
          status: deliveryForm.status
        }
      });
      setDeliveryForm({ supplier: "", arrivalWindow: "", contents: "", status: "Programado" });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar la entrega");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDelivery(id) {
    if (!canMutate || !id || String(id).startsWith("fb-")) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch(`/api/tenant/supply/deliveries/${encodeURIComponent(id)}`, apiSession, {
        method: "DELETE",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey
      });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAlert(event) {
    event.preventDefault();
    if (!canMutate) return;
    if (!alertForm.title.trim() || !alertForm.condition.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/supply/alerts", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: {
          title: alertForm.title.trim(),
          productRef: alertForm.productRef.trim(),
          condition: alertForm.condition.trim(),
          severity: alertForm.severity
        }
      });
      setAlertForm({ title: "", productRef: "", condition: "", severity: "info" });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo crear la alerta");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlert(id) {
    if (!canMutate || !id || String(id).startsWith("fb-")) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch(`/api/tenant/supply/alerts/${encodeURIComponent(id)}`, apiSession, {
        method: "DELETE",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey
      });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  return {
    canMutate,
    deliveries,
    alerts,
    loadError,
    actionError,
    loading,
    saving,
    deliveryForm,
    setDeliveryForm,
    alertForm,
    setAlertForm,
    supplierNames,
    productRefs,
    handleAddDelivery,
    handleDeleteDelivery,
    handleAddAlert,
    handleDeleteAlert,
    dakinisSeverityStyle,
    dakinisSeverityLabel
  };
}
