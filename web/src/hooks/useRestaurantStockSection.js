import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dakinisResolveStockItemSlug } from "@dakinis/shared/catalog/stock-barcodes.js";
import {
  DAKINIS_DUMPLING_DEMO_PRODUCTION,
  DAKINIS_DUMPLING_DEMO_PURCHASE,
  DAKINIS_DUMPLING_HOUSE_SLUG,
  DAKINIS_FERMINA_DEMO_PRODUCTION,
  DAKINIS_FERMINA_DEMO_PURCHASE,
  DAKINIS_FERMINA_HOUSE_SLUG,
  DAKINIS_RESTAURANT_DEMO_PRODUCTION,
  DAKINIS_RESTAURANT_DEMO_PURCHASE
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { DakinisApiError, dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisReportTenantLoadAlert } from "../utils/reportTenantLoadAlert.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";

export function dakinisFormatQty(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  if (unit === "g" && n >= 1000) return `${(n / 1000).toFixed(2)} kg`;
  if (unit === "ml" && n >= 1000) return `${(n / 1000).toFixed(2)} L`;
  return `${n} ${unit}`;
}

export function useRestaurantStockSection({ apiSession, tenantSlugForVertical, activeSystemKey }) {
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const isFerminaHouse = effectiveSlug === DAKINIS_FERMINA_HOUSE_SLUG;
  const isDumplingHouse = effectiveSlug === DAKINIS_DUMPLING_HOUSE_SLUG;
  const demoProduction = isFerminaHouse
    ? DAKINIS_FERMINA_DEMO_PRODUCTION
    : isDumplingHouse
      ? DAKINIS_DUMPLING_DEMO_PRODUCTION
      : DAKINIS_RESTAURANT_DEMO_PRODUCTION;
  const demoPurchase = isFerminaHouse
    ? DAKINIS_FERMINA_DEMO_PURCHASE
    : isDumplingHouse
      ? DAKINIS_DUMPLING_DEMO_PURCHASE
      : DAKINIS_RESTAURANT_DEMO_PURCHASE;
  const [kitchen, setKitchen] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(() => demoProduction.map((p) => ({ ...p })));
  const [simulation, setSimulation] = useState(null);
  const [scanQty, setScanQty] = useState("1");
  const [scanDirection, setScanDirection] = useState("in");
  const [scanMessage, setScanMessage] = useState("");
  const [unknownBarcode, setUnknownBarcode] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("u");
  const [newProductMin, setNewProductMin] = useState("0");
  const [newProductExpiry, setNewProductExpiry] = useState("");

  const fetchOpts = useMemo(
    () => ({
      businessId: effectiveSlug,
      businessTypeHeader: activeSystemKey
    }),
    [effectiveSlug, activeSystemKey]
  );

  const itemNames = useMemo(() => {
    const map = {};
    for (const item of kitchen?.items ?? []) map[item.slug] = item.name;
    return map;
  }, [kitchen?.items]);

  const sessionToken = apiSession?.token;
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;

  const reload = useCallback(
    async (signal) => {
      const sess = apiSessionRef.current;
      if (!sessionToken || !sess?.token) {
        setKitchen(null);
        setError("");
        setSimulation(null);
        return;
      }
      setError("");
      try {
        const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", sess, {
          ...fetchOpts,
          signal
        });
        if (signal?.aborted) return;
        setKitchen(json?.data);
      } catch (e) {
        if (e?.name === "AbortError") return;
        const message = e instanceof Error ? e.message : t("kitchen.loadError");
        setError(message);
        void dakinisReportTenantLoadAlert({
          apiSession: sess,
          businessId: fetchOpts.businessId,
          businessTypeHeader: fetchOpts.businessTypeHeader,
          moduleKey: "kitchen",
          moduleLabel: "cocina / stock",
          errorMessage: message
        });
      }
    },
    [sessionToken, fetchOpts, t]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    reload(ctrl.signal);
    return () => ctrl.abort();
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
      setError(e instanceof Error ? e.message : t("kitchen.simulateError"));
      setSimulation(null);
    } finally {
      setBusy(false);
    }
  }

  async function dakinisPostStockScan(barcode) {
    const qty = Number(scanQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setScanMessage(t("kitchen.scanQtyInvalid"));
      return false;
    }
    const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/stock/scan", apiSession, {
      ...fetchOpts,
      method: "POST",
      body: { barcode, quantity: qty, direction: scanDirection }
    });
    const item = json?.data?.item;
    setScanMessage(
      t("kitchen.scanOk", {
        name: item?.name || item?.slug,
        qty: dakinisFormatQty(item?.quantity, item?.unit)
      })
    );
    setUnknownBarcode("");
    await reload(undefined);
    return true;
  }

  async function dakinisApplyStockScan(barcode) {
    const code = String(barcode || "").trim();
    if (!code) return;

    const slug = dakinisResolveStockItemSlug(code, kitchen?.items ?? []);
    if (!slug && !apiSession?.token) {
      setUnknownBarcode(code);
      setScanMessage(t("kitchen.scanNotFound"));
      return;
    }
    if (!slug && apiSession?.token) {
      setUnknownBarcode(code);
      setNewProductName("");
      setScanMessage(t("kitchen.scanUnknownPrompt"));
      return;
    }
    if (!apiSession?.token) {
      setScanMessage(`${t("kitchen.scanMatched")}: ${slug}`);
      return;
    }

    setBusy(true);
    setScanMessage("");
    setError("");
    try {
      await dakinisPostStockScan(code);
    } catch (e) {
      if (e instanceof DakinisApiError && (e.code === "BARCODE_UNKNOWN" || e.status === 404)) {
        setUnknownBarcode(code);
        setScanMessage(t("kitchen.scanUnknownPrompt"));
        return;
      }
      setScanMessage(e instanceof Error ? e.message : t("kitchen.scanError"));
    } finally {
      setBusy(false);
    }
  }

  async function dakinisCreateProductFromScan(e) {
    e.preventDefault();
    if (!unknownBarcode.trim() || !newProductName.trim()) return;
    if (!apiSession?.token) return;

    const qty = Number(scanQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setScanMessage(t("kitchen.scanQtyInvalid"));
      return;
    }

    setBusy(true);
    setScanMessage("");
    setError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/stock/items", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: {
          barcode: unknownBarcode.trim(),
          name: newProductName.trim(),
          unit: newProductUnit.trim() || "u",
          minQuantity: Number(newProductMin) || 0,
          initialQuantity: scanDirection === "in" ? qty : 0,
          expiryDate: newProductExpiry.trim() || undefined
        }
      });
      await reload(undefined);
      if (scanDirection === "out") {
        await dakinisPostStockScan(unknownBarcode.trim());
      } else {
        setScanMessage(t("kitchen.scanProductCreated"));
        setUnknownBarcode("");
        setNewProductName("");
        setNewProductExpiry("");
      }
    } catch (err) {
      setScanMessage(err instanceof Error ? err.message : t("kitchen.scanCreateError"));
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
        body: { label: "Pedido", lines: demoPurchase }
      });
      await reload(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("kitchen.purchaseError"));
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
      await reload(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("kitchen.productionError"));
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

  const leadKey = isFerminaHouse
    ? "kitchen.leadRestauranteDemo"
    : isDumplingHouse
      ? "kitchen.leadDumpling"
      : "kitchen.lead";

  return {
    t,
    dateLocale,
    isFerminaHouse,
    isDumplingHouse,
    leadKey,
    kitchen,
    error,
    busy,
    plan,
    simulation,
    scanQty,
    setScanQty,
    scanDirection,
    setScanDirection,
    scanMessage,
    unknownBarcode,
    setUnknownBarcode,
    newProductName,
    setNewProductName,
    newProductUnit,
    setNewProductUnit,
    newProductMin,
    setNewProductMin,
    newProductExpiry,
    setNewProductExpiry,
    itemNames,
    reload,
    fetchOpts,
    apiSession,
    dakinisApplyStockScan,
    dakinisCreateProductFromScan,
    dakinisApplyDemoPurchase,
    dakinisRunSimulate,
    dakinisApplyProduction,
    dakinisUpdatePlanBatch,
    setBusy,
    setError
  };
}
