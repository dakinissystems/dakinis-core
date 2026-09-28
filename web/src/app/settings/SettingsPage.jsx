import { useState } from "react";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { useDakinisLogout } from "../../hooks/useDakinisLogout.js";
import {
  dakinisTenantPatchSettings,
  dakinisTenantAdvanceOnboarding
} from "../../services/tenant-intelligence.js";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import SettingsDemoView from "./SettingsDemoView.jsx";
import SettingsAccountCard from "./SettingsAccountCard.jsx";
import SettingsOnboardingCard from "./SettingsOnboardingCard.jsx";
import SettingsBusinessForm from "./SettingsBusinessForm.jsx";
import SettingsBillingCard from "./SettingsBillingCard.jsx";
import SettingsAdoptionCard from "./SettingsAdoptionCard.jsx";
import SettingsPortalCard from "./SettingsPortalCard.jsx";
import SettingsMarketplaceCard from "./SettingsMarketplaceCard.jsx";
import SettingsBranchesCard from "./SettingsBranchesCard.jsx";
import SettingsRestaurantBlock from "./SettingsRestaurantBlock.jsx";
import useSettingsPageData from "./useSettingsPageData.js";

export default function SettingsPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const {
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
  } = useSettingsPageData(session);

  async function saveSettings(e) {
    e.preventDefault();
    if (!session?.token || !settings) return;
    setSaving(true);
    setMsg("");
    try {
      await dakinisTenantPatchSettings(session, settings);
      setMsg("Configuración guardada");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function completeOnboarding() {
    if (!session?.token) return;
    await dakinisTenantAdvanceOnboarding(session, { markComplete: true });
    await refreshOnboarding();
  }

  if (dakinisIsBusinessDemoSession(session)) {
    return <SettingsDemoView t={t} session={session} navigate={navigate} onSignOut={signOut} />;
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.settings.title")}</h2>
        <p className="lead">{t("app.settings.lead")}</p>

        <SettingsAccountCard t={t} session={session} />
        <SettingsOnboardingCard onboarding={onboarding} onComplete={completeOnboarding} />
        <SettingsBusinessForm
          settings={settings}
          setSettings={setSettings}
          saving={saving}
          msg={msg}
          onSubmit={saveSettings}
        />
        <SettingsBillingCard t={t} billing={billing} aiUsage={aiUsage} />
        <SettingsAdoptionCard
          adoption={adoption}
          adoptionScores={adoptionScores}
          businessValueScores={businessValueScores}
        />
        <SettingsPortalCard session={session} portal={portal} setPortal={setPortal} onSaved={setMsg} />
        <SettingsMarketplaceCard session={session} onInstalled={setMsg} />
        <SettingsBranchesCard branches={branches} onRefresh={refreshBranches} />
        {dakinisIsHospitalityBusiness(session?.business?.type) ? (
          <SettingsRestaurantBlock t={t} navigate={navigate} allergiesUrl={allergiesUrl} />
        ) : null}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("businessDemo.hub.ctaButton")}
          </button>
          <button type="button" className="btn" onClick={() => signOut()}>
            {t("app.settings.logout")}
          </button>
        </div>
      </div>
    </section>
  );
}
