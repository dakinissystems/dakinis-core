import { useEffect, useState } from "react";
import { dakinisTenantJsonFetch } from "../../services/api.js";
import {
  dakinisTenantProfile,
  dakinisTenantBranches,
  dakinisTenantBillingSummary,
  dakinisTenantAiUsage,
  dakinisTenantPortalSettings,
  dakinisTenantTelemetryAdoption
} from "../../services/tenant-intelligence.js";

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

  useEffect(() => {
    if (!session?.token) return;
    dakinisTenantProfile(session)
      .then((json) => {
        setSettings(json?.data?.settings || null);
        setBranches(json?.data?.branches || []);
        setOnboarding(json?.data?.onboarding || null);
      })
      .catch(() => {});
    dakinisTenantBillingSummary(session).then((j) => setBilling(j?.data?.billing || null)).catch(() => {});
    dakinisTenantAiUsage(session).then((j) => setAiUsage(j?.data?.usage || null)).catch(() => {});
    dakinisTenantTelemetryAdoption(session)
      .then((j) => {
        setAdoption(j?.data?.adoption || null);
        setAdoptionScores(j?.data?.adoptionScores || []);
        setBusinessValueScores(j?.data?.businessValueScores || []);
      })
      .catch(() => {});
    dakinisTenantPortalSettings(session)
      .then((j) =>
        setPortal({
          ...(j?.data?.portal || {}),
          suggestedFeatures: j?.data?.suggestedFeatures || []
        })
      )
      .catch(() => {});
    if (session?.business?.type !== "restaurante") return;
    dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session)
      .then((json) => {
        const token = json?.data?.profile?.publicToken;
        if (token) setAllergiesUrl(`${window.location.origin}/alergenos/${token}`);
      })
      .catch(() => {});
  }, [session]);

  async function refreshBranches() {
    if (!session?.token) return;
    const json = await dakinisTenantBranches(session);
    setBranches(json?.data?.branches || []);
  }

  async function refreshOnboarding() {
    if (!session?.token) return;
    const json = await dakinisTenantProfile(session);
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
