import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import {
  DAKINIS_BUSINESS_SLUG_BY_VERTICAL,
  DAKINIS_ENTITY_BY_VERTICAL
} from "@dakinis/shared/catalog/business-mapping.js";
import { dakinisGetSystemPageContent } from "../data/getSystemPageContent.js";
import { DAKINIS_SYSTEM_MOCKUPS, dakinisBuildDefaultFormValues } from "../data/systemPages.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import {
  dakinisNormalizeRestaurantTask,
  dakinisParseRestaurantTaskQuery,
  dakinisReadRestaurantTask,
  dakinisWriteRestaurantTask
} from "../utils/restaurantTaskStorage.js";
import { dakinisIsSeedDemoTenantSession } from "../utils/demoSession.js";
import { dakinisTenantFetchKey } from "../utils/sessionIdentity.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

export function useSystemPage(activeSystemKey) {
  const { session } = useDakinisSession();
  const { locale, t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const hideVerticalSwitcher = Boolean(session?.token) && session?.user?.role !== "platform_admin";
  const showDemoWelcome =
    Boolean(session?.token) && hideVerticalSwitcher && dakinisIsSeedDemoTenantSession(session);

  const sistemaSwitcherEntries = useMemo(() => {
    if (hideVerticalSwitcher) return [];
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (session.user?.role === "platform_admin") return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, hideVerticalSwitcher]);

  const selectedSystem = dakinisSystemRegistry[activeSystemKey] || dakinisSystemRegistry.clinica;
  const systemPageContent = dakinisGetSystemPageContent(locale, activeSystemKey);
  const activeMockup = DAKINIS_SYSTEM_MOCKUPS[activeSystemKey] || DAKINIS_SYSTEM_MOCKUPS.clinica;
  const tenantSlugForVertical = DAKINIS_BUSINESS_SLUG_BY_VERTICAL[activeSystemKey];
  const entityName = DAKINIS_ENTITY_BY_VERTICAL[activeSystemKey];

  const apiSession = useMemo(() => {
    if (session?.token && session.business?.slug && session.business?.type === activeSystemKey) {
      return session;
    }
    return {
      token: undefined,
      business: { slug: tenantSlugForVertical, id: undefined }
    };
  }, [session, tenantSlugForVertical, activeSystemKey]);

  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;
  const recordsFetchKey = dakinisTenantFetchKey(apiSession, [tenantSlugForVertical, activeSystemKey, entityName]);

  const [records, setRecords] = useState(() => [...activeMockup.initialRecords]);
  const [recordsError, setRecordsError] = useState("");
  const [recordsSynced, setRecordsSynced] = useState(false);
  const [mockFormValues, setMockFormValues] = useState(() => dakinisBuildDefaultFormValues(activeMockup));
  const parsedQuery = dakinisParseRestaurantTaskQuery(searchParams.get("task"), searchParams.get("sub"));
  const taskFromUrl = parsedQuery.task;
  const [restaurantTask, setRestaurantTask] = useState(() => taskFromUrl || dakinisReadRestaurantTask());
  const [showCommercialChrome, setShowCommercialChrome] = useState(
    () => searchParams.get("mode") === "comercial" || searchParams.get("mode") === "demo"
  );
  const taskSub = parsedQuery.sub || searchParams.get("sub") || "";
  const hasToken = Boolean(session?.token);
  const [prevSystemKey, setPrevSystemKey] = useState(activeSystemKey);
  const [prevHasToken, setPrevHasToken] = useState(hasToken);

  useEffect(() => {
    if (taskFromUrl && taskFromUrl !== restaurantTask) {
      setRestaurantTask(taskFromUrl);
      dakinisWriteRestaurantTask(taskFromUrl);
    }
  }, [taskFromUrl, restaurantTask]);

  // Canonicaliza aliases de URL (?task=stock → ?task=inventario&sub=scan) una sola vez.
  useEffect(() => {
    const raw = searchParams.get("task");
    if (!raw || !taskFromUrl) return;
    const urlSub = searchParams.get("sub") || "";
    const needsTaskRewrite = dakinisNormalizeRestaurantTask(raw) !== raw;
    const needsSubWrite = Boolean(parsedQuery.sub) && urlSub !== parsedQuery.sub;
    if (!needsTaskRewrite && !needsSubWrite) return;
    if (raw === taskFromUrl && urlSub === (parsedQuery.sub || "")) return;
    const next = new URLSearchParams(searchParams);
    next.set("task", taskFromUrl);
    if (parsedQuery.sub) next.set("sub", parsedQuery.sub);
    setSearchParams(next, { replace: true });
  }, [searchParams, taskFromUrl, parsedQuery.sub, setSearchParams]);

  useEffect(() => {
    if (searchParams.get("mode") === "comercial" || searchParams.get("mode") === "demo") {
      setShowCommercialChrome(true);
    }
  }, [searchParams]);


  if (activeSystemKey !== prevSystemKey) {
    setPrevSystemKey(activeSystemKey);
    setMockFormValues(dakinisBuildDefaultFormValues(activeMockup));
    setRecords([...activeMockup.initialRecords]);
    setRecordsError("");
    setRecordsSynced(false);
  }

  if (hasToken !== prevHasToken) {
    setPrevHasToken(hasToken);
    if (!hasToken) {
      setRecordsError("");
      setRecordsSynced(false);
    }
  }

  const reloadRecordsFromApi = useCallback(
    async (signal) => {
      const sess = apiSessionRef.current;
      setRecordsError("");
      try {
        const json = await dakinisTenantJsonFetch(
          `/api/tenant/mock-records?entity=${encodeURIComponent(entityName)}`,
          sess,
          {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          }
        );
        const fromApi = json?.data?.records;
        if (Array.isArray(fromApi)) {
          setRecords(fromApi);
          setRecordsSynced(true);
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setRecordsError(error instanceof Error ? error.message : t("system.recordsLoadError"));
        setRecordsSynced(false);
      }
    },
    [recordsFetchKey, entityName, tenantSlugForVertical, activeSystemKey, t]
  );

  useEffect(() => {
    if (!hasToken) return undefined;
    const controller = new AbortController();
    reloadRecordsFromApi(controller.signal);
    return () => controller.abort();
  }, [reloadRecordsFromApi, hasToken]);

  function dakinisHandleMockFieldChange(fieldKey, value) {
    setMockFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  }

  async function dakinisHandleMockSubmit(event) {
    event.preventDefault();
    const id = `${activeSystemKey}-${Date.now()}`;
    const newRecord = { ...mockFormValues, id };
    setMockFormValues(dakinisBuildDefaultFormValues(activeMockup));

    try {
      await dakinisTenantJsonFetch("/api/tenant/mock-records", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: { record: newRecord }
      });
      await reloadRecordsFromApi();
    } catch (error) {
      setRecords((prev) => [newRecord, ...prev]);
      setRecordsSynced(false);
      const fallbackMsg = error instanceof Error ? error.message : t("system.saveLocalFallback");
      setRecordsError((prevE) => prevE || fallbackMsg);
    }
  }

  function setRestaurantTaskPersisted(next) {
    const normalized = dakinisWriteRestaurantTask(next);
    setRestaurantTask(normalized);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("task", normalized);
    if (normalized !== "inventario" && normalized !== "config") {
      nextParams.delete("sub");
    }
    setSearchParams(nextParams, { replace: true });
  }

  function openCommercialMode() {
    setShowCommercialChrome(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", "comercial");
    setSearchParams(nextParams, { replace: true });
  }

  function closeCommercialMode() {
    setShowCommercialChrome(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("mode");
    setSearchParams(nextParams, { replace: true });
  }

  const isRestaurantOps =
    activeSystemKey === "restaurante" && Boolean(session?.token) && !showCommercialChrome;

  return {
    session,
    t,
    locale,
    navigate,
    activeSystemKey,
    hideVerticalSwitcher,
    showDemoWelcome,
    sistemaSwitcherEntries,
    selectedSystem,
    systemPageContent,
    activeMockup,
    tenantSlugForVertical,
    apiSession,
    records,
    recordsError,
    recordsSynced,
    mockFormValues,
    restaurantTask,
    setRestaurantTask: setRestaurantTaskPersisted,
    taskSub,
    isRestaurantOps,
    showCommercialChrome,
    openCommercialMode,
    closeCommercialMode,
    dakinisHandleMockFieldChange,
    dakinisHandleMockSubmit,
    dakinisIsSeedDemoTenantSession
  };
}
