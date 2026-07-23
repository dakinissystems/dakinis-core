import { useEffect, useRef, useState } from "react";
import { dakinisTenantJsonFetch } from "../../services/api.js";
import {
  dakinisTenantProfile,
  dakinisTenantBranches,
  dakinisTenantBillingSummary,
  dakinisTenantAiUsage,
  dakinisTenantPortalSettings,
  dakinisTenantTelemetryAdoption
} from "../../services/tenant-intelligence.js";
import { dakinisTenantFetchKey } from "../../utils/sessionIdentity.js";

export default function useSettingsPageData(session) {
  const [allergiesUrl, setAllergiesUrl] = useState("");
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [billing, setBilling] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [portal, setPortal] = useState(null);
  const [adoption, setAdoption] = useState(null);
  const [adoptionScores, setAdoptionScores] = useState([]);
  const [businessValueScores, setBusinessValueScores] = useState([]);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const fetchKey = dakinisTenantFetchKey(session);

  useEffect(() => {
    const sess = sessionRef.current;
    if (!sess?.token) return undefined;
    let cancelled = false;

    dakinisTenantProfile(sess)
      .then((json) => {
        if (cancelled) return;
        setSettings(json?.data?.settings || null);
        setBranches(json?.data?.branches || []);
        setOnboarding(json?.data?.onboarding || null);
      })
      .catch(() => {});
    dakinisTenantBillingSummary(sess)
      .then((j) => {
        if (!cancelled) setBilling(j?.data?.billing || null);
      })
      .catch(() => {});
    dakinisTenantAiUsage(sess)
      .then((j) => {
        if (!cancelled) setAiUsage(j?.data?.usage || null);
      })
      .catch(() => {});
    dakinisTenantTelemetryAdoption(sess)
      .then((j) => {
        if (cancelled) return;
        setAdoption(j?.data?.adoption || null);
        setAdoptionScores(j?.data?.adoptionScores || []);
        setBusinessValueScores(j?.data?.businessValueScores || []);
      })
      .catch(() => {});
    dakinisTenantPortalSettings(sess)
      .then((j) => {
        if (cancelled) return;
        setPortal({
          ...(j?.data?.portal || {}),
          suggestedFeatures: j?.data?.suggestedFeatures || []
        });
      })
      .catch(() => {});
    if (sess?.business?.type === "restaurante") {
      dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", sess)
        .then((json) => {
          if (cancelled) return;
          const token = json?.data?.profile?.publicToken;
          if (token) setAllergiesUrl(`${window.location.origin}/alergenos/${token}`);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  async function refreshBranches() {
    const sess = sessionRef.current;
    if (!sess?.token) return;
    const json = await dakinisTenantBranches(sess);
    setBranches(json?.data?.branches || []);
  }

  async function refreshOnboarding() {
    const sess = sessionRef.current;
    if (!sess?.token) return;
    const json = await dakinisTenantProfile(sess);
    setOnboarding(json?.data?.onboarding || null);
  }

  return {
    allergiesUrl,
    settings,
    setSettings,
    branches,
    onboarding,
    billing,
    aiUsage,
    portal,
    setPortal,
    adoption,
    adoptionScores,
    businessValueScores,
    refreshBranches,
    refreshOnboarding
  };
}
