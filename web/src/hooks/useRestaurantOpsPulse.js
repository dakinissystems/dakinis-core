import { useCallback, useEffect, useMemo, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";

/**
 * Contadores vivos para badges del Command Dock.
 * tone: attention | warn | activity
 */
export function useRestaurantOpsPulse({ apiSession, tenantSlugForVertical, activeSystemKey, enabled }) {
  const [pulse, setPulse] = useState({
    occupiedTables: 0,
    kitchenOpen: 0,
    deliveryPending: 0,
    stockAlerts: 0,
    cashToday: null,
    loaded: false
  });

  const fetchOpts = useMemo(
    () => ({
      businessId: dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical),
      businessTypeHeader: activeSystemKey
    }),
    [apiSession, tenantSlugForVertical, activeSystemKey]
  );

  const reload = useCallback(async () => {
    if (!enabled || !apiSession?.token) return;
    try {
      const [ordersRes, floor, dash, stockRes] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/orders", apiSession, fetchOpts).catch(() => null),
        dakinisFetchRestaurantFloor(apiSession, fetchOpts).catch(() => null),
        dakinisTenantJsonFetch("/api/tenant/restaurant/delivery/dashboard", apiSession, fetchOpts).catch(() => null),
        dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", apiSession, fetchOpts).catch(() => null)
      ]);

      const orders = Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : [];
      const kitchenOpen = orders.filter(
        (o) => o.status === "en_cocina" || o.status === "lista" || o.status === "recibida" || o.status === "preparando"
      ).length;
      const openOrders = orders.filter((o) => o.status !== "entregada" && o.status !== "cancelada").length;

      const sessions = floor?.sessions && typeof floor.sessions === "object" ? floor.sessions : {};
      const occupiedTables = Object.values(sessions).filter((s) => s && (s.items?.length > 0 || s.status === "open")).length;

      const deliveryPending = Number(dash?.data?.pendingMarketplace ?? 0);
      const todayCounts = dash?.data?.todayCounts || {};
      const deliveryToday = Object.values(todayCounts).reduce((a, n) => a + Number(n || 0), 0);

      const kitchenPayload = stockRes?.data?.kitchen || stockRes?.data || {};
      const items = Array.isArray(kitchenPayload?.items) ? kitchenPayload.items : [];
      const stockAlerts = items.filter((it) => {
        const qty = Number(it.quantity ?? it.qty ?? 0);
        const min = Number(it.minQuantity ?? it.min_qty ?? 0);
        return min > 0 && qty <= min;
      }).length;

      const delivered = orders.filter((o) => o.status === "entregada");
      const cashToday = delivered.reduce((sum, o) => sum + Number(o.totalEur ?? o.total ?? 0), 0);

      setPulse({
        occupiedTables,
        kitchenOpen: kitchenOpen || openOrders,
        deliveryPending: deliveryPending || deliveryToday,
        stockAlerts,
        cashToday,
        loaded: true
      });
    } catch {
      /* silent — dock sigue sin badges */
    }
  }, [enabled, apiSession, fetchOpts]);

  useEffect(() => {
    reload();
    if (!enabled) return undefined;
    const id = window.setInterval(reload, 45000);
    return () => window.clearInterval(id);
  }, [reload, enabled]);

  const badges = useMemo(() => {
    /** @type {Record<string, { value: string|number, tone: 'attention'|'warn'|'activity' }|null>} */
    const out = {};
    if (pulse.occupiedTables > 0) {
      out.sala = { value: pulse.occupiedTables, tone: "activity" };
    }
    if (pulse.kitchenOpen > 0) {
      out.cocina = {
        value: pulse.kitchenOpen,
        tone: pulse.kitchenOpen >= 5 ? "attention" : "activity"
      };
    }
    if (pulse.stockAlerts > 0) {
      out.inventario = {
        value: "!",
        tone: pulse.stockAlerts >= 3 ? "attention" : "warn"
      };
    }
    if (pulse.deliveryPending > 0) {
      out.delivery = {
        value: pulse.deliveryPending,
        tone: pulse.deliveryPending >= 3 ? "attention" : "activity"
      };
    }
    return out;
  }, [pulse]);

  return { pulse, badges, reload };
}
