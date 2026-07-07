import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import {
  dakinisFormatBusinessTypeLabel,
  dakinisNormalizeBusinessTypeKey
} from "@dakinis/shared/catalog/business-type-display.js";
import {
  dakinisGetIndustryTemplate,
  dakinisGetIndustryTemplateCatalog
} from "@dakinis/shared/catalog/business-templates.js";
import { dakinisBearerJsonFetch } from "../services/api.js";

export const DAKINIS_TYPE_OTHER = "__other__";

export const DAKINIS_SAAS_PLAN_OPTIONS = [
  { value: "starter", label: "Starter (agenda, reservas, dashboard)" },
  { value: "growth", label: "Growth (+ CRM, leads)" },
  { value: "pro", label: "Pro (+ WhatsApp API en rutas /api/whatsapp/*)" }
];

export function usePlatformAdminPage() {
  const { t } = useLocale();
  const { session } = useDakinisSession();

  const typeSelectOptions = useMemo(() => {
    const catalog = dakinisGetIndustryTemplateCatalog();
    return catalog.map((item) => ({
      value: item.key,
      label: item.label,
      market: item.market,
      featureLabels: item.featureLabels
    }));
  }, []);

  const verticalKeys = useMemo(() => typeSelectOptions.map((o) => o.value), [typeSelectOptions]);

  const [createForm, setCreateForm] = useState(() => ({
    name: "",
    slug: "",
    typeSelect: "clinica",
    typeCustom: "",
    plan: "starter",
    ownerEmail: "",
    ownerPassword: ""
  }));

  const createOnboardingPreview = useMemo(() => {
    const key =
      createForm.typeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(createForm.typeCustom)
        : createForm.typeSelect;
    return key ? dakinisGetIndustryTemplate(key) : null;
  }, [createForm.typeSelect, createForm.typeCustom]);

  const vistaMockupOptions = useMemo(() => {
    const reg = dakinisGetSystemRegistry();
    return Object.keys(reg).map((k) => ({
      value: k,
      label: dakinisFormatBusinessTypeLabel(k)
    }));
  }, []);

  const typeSelectOptionsCreate = useMemo(
    () => [...typeSelectOptions, { value: DAKINIS_TYPE_OTHER, label: t("admin.other") }],
    [typeSelectOptions, t]
  );

  const typeSelectOptionsEdit = useMemo(
    () => [
      ...typeSelectOptions,
      { value: "platform", label: dakinisFormatBusinessTypeLabel("platform") },
      { value: DAKINIS_TYPE_OTHER, label: t("admin.other") }
    ],
    [typeSelectOptions, t]
  );

  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", plan: "" });
  const [editHubProducts, setEditHubProducts] = useState(["core"]);
  const [editTypeSelect, setEditTypeSelect] = useState("clinica");
  const [editTypeCustom, setEditTypeCustom] = useState("");
  const [pilotTelemetry, setPilotTelemetry] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserEmail, setEditUserEmail] = useState("");
  const [userActionMsg, setUserActionMsg] = useState("");
  const [accessActionId, setAccessActionId] = useState(null);
  const [accessForm, setAccessForm] = useState({ action: "suspend", reason: "admin_other", note: "" });

  const DAKINIS_ACCESS_REASONS = useMemo(
    () => [
      { value: "admin_legal", label: t("admin.access.reasonLegal") },
      { value: "admin_abuse", label: t("admin.access.reasonAbuse") },
      { value: "admin_fraud", label: t("admin.access.reasonFraud") },
      { value: "admin_contract", label: t("admin.access.reasonContract") },
      { value: "admin_other", label: t("admin.access.reasonOther") }
    ],
    [t]
  );

  function accessStateLabel(state) {
    const key = state || "active";
    const labels = {
      active: t("admin.access.state.active"),
      degraded: t("admin.access.state.degraded"),
      suspended: t("admin.access.state.suspended"),
      closed: t("admin.access.state.closed")
    };
    return labels[key] || key;
  }

  const tenantUsersOnly = useMemo(
    () => users.filter((u) => u.role !== "platform_admin"),
    [users]
  );

  const load = useCallback(async (signal) => {
    if (!session?.token || session.user?.role !== "platform_admin") return;
    setError("");
    try {
      const [bJson, uJson, telJson] = await Promise.all([
        dakinisBearerJsonFetch("/api/platform/businesses", session.token, { signal }),
        dakinisBearerJsonFetch("/api/platform/users", session.token, { signal }),
        dakinisBearerJsonFetch("/api/platform/telemetry/summary?days=30", session.token, { signal }).catch(
          () => ({ data: { telemetry: { tenants: [] } } })
        )
      ]);
      setBusinesses(bJson?.data?.businesses || []);
      setUsers(uJson?.data?.users || []);
      setPilotTelemetry(telJson?.data?.telemetry?.tenants || []);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  }, [session?.token, session?.user?.role, t]);

  useEffect(() => {
    if (!session?.token || session.user?.role !== "platform_admin") {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [session?.token, session?.user?.role, load]);

  async function submitAccessAction(businessId) {
    if (!session?.token || !businessId) return;
    const confirmMsg =
      accessForm.action === "close"
        ? t("admin.access.confirmClose")
        : accessForm.action === "suspend"
          ? t("admin.access.confirmSuspend")
          : t("admin.access.confirmReactivate");
    if (!window.confirm(confirmMsg)) return;
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch(`/api/platform/businesses/${encodeURIComponent(businessId)}/access`, session.token, {
        method: "PATCH",
        body: accessForm
      });
      setAccessActionId(null);
      setAccessForm({ action: "suspend", reason: "admin_other", note: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.access.error"));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(b) {
    setEditingId(b.id);
    const p = String(b.plan || "")
      .trim()
      .toLowerCase();
    const planSelect =
      p === "growth" || p === "pro" ? p : p === "advanced" || p === "enterprise" ? "pro" : "starter";
    setEditForm({ name: b.name, slug: b.slug, plan: planSelect });
    setEditHubProducts(Array.isArray(b.hubProducts) && b.hubProducts.length ? b.hubProducts : ["core"]);
    const preset = new Set([...verticalKeys, "platform"]);
    if (preset.has(b.type)) {
      setEditTypeSelect(b.type);
      setEditTypeCustom("");
    } else {
      setEditTypeSelect(DAKINIS_TYPE_OTHER);
      setEditTypeCustom(b.type);
    }
  }

  async function submitCreate(e) {
    e.preventDefault();
    if (!session?.token) return;
    const type =
      createForm.typeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(createForm.typeCustom)
        : createForm.typeSelect;
    if (createForm.typeSelect === DAKINIS_TYPE_OTHER && !type) {
      setError(t("admin.typeCustomRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const ownerEmail = createForm.ownerEmail.trim().toLowerCase();
      const ownerPassword = createForm.ownerPassword;
      const body = {
        name: createForm.name.trim(),
        slug: createForm.slug.trim().toLowerCase(),
        type,
        plan: createForm.plan.trim() || "starter"
      };
      if (ownerEmail) {
        body.ownerEmail = ownerEmail;
        if (ownerPassword) body.ownerPassword = ownerPassword;
      }
      const created = await dakinisBearerJsonFetch("/api/platform/businesses", session.token, {
        method: "POST",
        body
      });
      const delivery = created?.data?.credentialsDelivery;
      if (delivery) {
        if (delivery.emailSent) {
          setUserActionMsg(t("admin.credentialsEmailed", { email: delivery.email }));
        } else if (delivery.tempPassword) {
          setUserActionMsg(
            t("admin.credentialsManual", {
              email: delivery.email,
              password: delivery.tempPassword,
              url: delivery.resetUrl || ""
            })
          );
        }
      }
      setCreateForm((prev) => ({
        ...prev,
        name: "",
        slug: "",
        typeCustom: "",
        ownerEmail: "",
        ownerPassword: ""
      }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.createError"));
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!session?.token || !editingId) return;
    const type =
      editTypeSelect === DAKINIS_TYPE_OTHER
        ? dakinisNormalizeBusinessTypeKey(editTypeCustom)
        : editTypeSelect;
    if (editTypeSelect === DAKINIS_TYPE_OTHER && !type) {
      setError(t("admin.typeCustomEditRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await dakinisBearerJsonFetch(`/api/platform/businesses/${encodeURIComponent(editingId)}`, session.token, {
        method: "PATCH",
        body: {
          name: editForm.name.trim(),
          slug: editForm.slug.trim().toLowerCase(),
          type,
          plan: editForm.plan.trim()
        }
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.saveError"));
    } finally {
      setSaving(false);
    }
  }

  const isRestricted = !session?.token || session.user?.role !== "platform_admin";

  return {
    t,
    session,
    isRestricted,
    typeSelectOptionsCreate,
    typeSelectOptionsEdit,
    vistaMockupOptions,
    createForm,
    setCreateForm,
    createOnboardingPreview,
    businesses,
    error,
    loading,
    saving,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    editHubProducts,
    editTypeSelect,
    setEditTypeSelect,
    editTypeCustom,
    setEditTypeCustom,
    pilotTelemetry,
    editingUserId,
    setEditingUserId,
    editUserEmail,
    setEditUserEmail,
    userActionMsg,
    setUserActionMsg,
    accessActionId,
    setAccessActionId,
    accessForm,
    setAccessForm,
    DAKINIS_ACCESS_REASONS,
    accessStateLabel,
    submitAccessAction,
    tenantUsersOnly,
    load,
    startEdit,
    submitCreate,
    submitEdit
  };
}
