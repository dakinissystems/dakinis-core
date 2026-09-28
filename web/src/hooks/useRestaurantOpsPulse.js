import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";

const PULSE_INTERVAL_MS = 90_000;

/**
 * Contadores vivos para badges del Command Dock.
 * tone: attention | warn | activity
 * Estabilizado: deps por token/slug, un solo in-flight, intervalo largo.
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

  const token = apiSession?.token || "";
  const slug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical) || "";
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;
  const inFlightRef = useRef(false);
  const pausedUntilRef = useRef(0);

  const reload = useCallback(async () => {
    if (!enabled || !token) return;
    if (inFlightRef.current) return;
    if (Date.now() < pausedUntilRef.current) return;

    inFlightRef.current = true;
    const sess = apiSessionRef.current;
    const fetchOpts = {
      businessId: slug,
      businessTypeHeader: activeSystemKey
    };

    try {
      // Solo 2 llamadas: orders (comandas/caja) + floor (mesas). Delivery/kitchen bajo demanda.
      const [ordersRes, floor] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/orders", sess, fetchOpts),
        dakinisFetchRestaurantFloor(sess, fetchOpts)
      ]);

      const orders = Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : [];
      const kitchenOpen = orders.filter(
        (o) =>
          o.status === "en_cocina" ||
          o.status === "lista" ||
          o.status === "recibida" ||
          o.status === "preparando" ||
          o.status === "nueva" ||
          o.status === "cocina"
      ).length;
      const openOrders = orders.filter((o) => o.status !== "entregada" && o.status !== "cancelada").length;

      const sessions = floor?.sessions && typeof floor.sessions === "object" ? floor.sessions : {};
      const occupiedTables = Object.values(sessions).filter(
        (s) => s && (s.items?.length > 0 || s.status === "open")
      ).length;

      const marketplace = orders.filter((o) => {
        const ch = String(o.channel || "").toLowerCase();
        return (
          (ch === "glovo" || ch === "uber" || ch === "ubereats" || ch === "justeat" || ch === "delivery") &&
          o.status !== "entregada" &&
          o.status !== "cancelada"
        );
      }).length;

      const delivered = orders.filter((o) => o.status === "entregada");
      const cashToday = delivered.reduce((sum, o) => sum + Number(o.totalEur ?? o.total ?? 0), 0);

      setPulse({
        occupiedTables,
        kitchenOpen: kitchenOpen || openOrders,
        deliveryPending: marketplace,
        stockAlerts: 0,
        cashToday,
        loaded: true
      });
    } catch (e) {
      if (e?.status === 429 || e?.code === "RATE_LIMIT_EXCEEDED") {
        pausedUntilRef.current = Date.now() + 60_000;
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [enabled, token, slug, activeSystemKey]);

  useEffect(() => {
    if (!enabled || !token) return undefined;
    reload();
    const id = window.setInterval(reload, PULSE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reload, enabled, token]);

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
