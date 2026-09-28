import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisResetAuthExpiredFlag } from "../services/auth-events.js";
import { dakinisPersistEcosystemSession, dakinisPersistIdpTokens } from "@dakinis/shared-brand/sso";
import { dakinisPublicJsonFetch, DakinisApiError } from "../services/api.js";
import {
  isIdpAuthEnabled,
  loginViaIdp,
  dakinisResolveExchangeTenantRef,
  setIdpRefreshToken
} from "../services/idp-auth.js";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import { Button } from "@dakinis/shared-ux";
import PasswordInput from "../components/PasswordInput.jsx";

function dakinisReadExpiredSessionMessage() {
  try {
    if (sessionStorage.getItem("dakinis_session_expired") === "1") {
      sessionStorage.removeItem("dakinis_session_expired");
      return "Tu sesión expiró. Inicia sesión de nuevo.";
    }
  } catch {
    /* ignore */
  }
  return "";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setSession } = useDakinisSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState(dakinisReadExpiredSessionMessage);
  const [loading, setLoading] = useState(false);
  const idpEnabled = isIdpAuthEnabled();

  function dakinisApplySession(payload, idpExtra) {
    const { token, user, business } = payload;
    if (!token || !business?.type) {
      throw new Error(t("login.errors.incomplete"));
    }
    const nextSession = {
      token,
      user,
      business,
      ...(idpExtra ? { idp: idpExtra } : {})
    };
    setSession(nextSession);
    dakinisResetAuthExpiredFlag();
    dakinisPersistEcosystemSession(nextSession);
    if (idpExtra?.accessToken) {
      dakinisPersistIdpTokens(idpExtra);
    }
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_SUCCESS, {
      role: user?.role,
      businessType: business?.type,
      viaIdp: Boolean(idpExtra)
    });
    if (user?.mustChangePassword) {
      navigate("/forgot-password", {
        replace: true,
        state: { email: user?.email || "", mustChange: true }
      });
      return;
    }
    const isTenantUser = user?.role !== "platform_admin" && business?.type !== "platform";
    navigate(isTenantUser ? "/app/dashboard" : "/hub", { replace: true });
    setNeedsTotp(false);
    setTotpCode("");
  }

  async function handleIdpSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_STARTED, { via: "idp" });
    let tenantRef = "";
    try {
      const idp = await loginViaIdp(email.trim(), password);
      if (idp.refreshToken) setIdpRefreshToken(idp.refreshToken);
      tenantRef = dakinisResolveExchangeTenantRef(email, idp, businessSlug);
      if (!tenantRef) {
        throw new Error(t("login.errors.idpTenant"));
      }
      const json = await dakinisPublicJsonFetch("/api/auth/exchange", {
        method: "POST",
        headers: { Authorization: `Bearer ${idp.token}` },
        body: { businessSlug: tenantRef }
      });
      const payload = json?.data;
      if (!payload || typeof payload !== "object") {
        throw new Error(t("login.errors.noData"));
      }
      dakinisApplySession(payload, {
        accessToken: idp.token,
        refreshToken: idp.refreshToken || null
      });
    } catch (err) {
      if (err instanceof DakinisApiError && err.code === "UNKNOWN_TENANT") {
        setError(
          `Negocio "${tenantRef}" no existe en Core. Ejecuta el seed dakinis-platform en Supabase o usa un slug válido.`
        );
      } else {
        setError(err instanceof Error ? err.message : t("login.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitLocal(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_STARTED, { via: "local" });
    try {
      if (needsTotp && !totpCode.trim()) {
        setError(t("login.errors.totpRequired"));
        setLoading(false);
        return;
      }
      const body = { email: email.trim(), password };
      if (needsTotp && totpCode.trim()) {
        body.totpCode = totpCode.trim().replace(/\s+/g, "");
      }
      const json = await dakinisPublicJsonFetch("/api/auth/login", {
        method: "POST",
        body
      });

      const payload = json?.data;
      if (!payload || typeof payload !== "object") {
        throw new Error(t("login.errors.noData"));
      }

      dakinisApplySession(payload);
    } catch (err) {
      if (err instanceof DakinisApiError && err.code === "TOTP_REQUIRED") {
        setNeedsTotp(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : t("login.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (idpEnabled) {
      return handleIdpSubmit(e);
    }
    return handleSubmitLocal(e);
  }

  return (
    <section className="modules login-page">
      <div className="container login-page__inner">
        <p className="kicker">{t("login.kicker")}</p>
        <h2 className="login-page__title">{t("login.title")}</h2>
        <p className="lead login-page__lead">{t("login.businessLead")}</p>
        <div className="login-demo-cta card">
          <p className="kpi-label">{t("login.tryWithoutAccount")}</p>
          <Button type="button" variant="primary" onClick={() => navigate("/demo/restaurante")}>
            {t("commercial.tryDemo")}
          </Button>
        </div>
        <form className="mockup-form card login-form" onSubmit={handleSubmit}>
          <label className="mockup-field">
            <span>{t("login.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setNeedsTotp(false);
                setTotpCode("");
              }}
              autoComplete="username"
              required
            />
          </label>
          <label className="mockup-field">
            <span>{t("login.password")}</span>
            <PasswordInput
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {needsTotp ? (
            <label className="mockup-field">
              <span>{t("login.totpLabel")}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={12}
                value={totpCode}
                onChange={(ev) => setTotpCode(ev.target.value)}
                placeholder={t("login.totpPlaceholder")}
              />
            </label>
          ) : null}
          {idpEnabled ? (
            <label className="mockup-field">
              <span>{t("login.businessSlug")}</span>
              <input
                type="text"
                value={businessSlug}
                onChange={(ev) => setBusinessSlug(ev.target.value)}
                placeholder="dakinis-platform"
                autoComplete="organization"
              />
            </label>
          ) : null}
          {error ? <p className="login-form__error">{error}</p> : null}
          <p className="kpi-label" style={{ margin: 0 }}>
            <button type="button" className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => navigate("/forgot-password")}>
              {t("login.forgotPassword")}
            </button>
          </p>
          <div className="login-form__actions">
            <Button type="submit" variant="primary" className="login-form__submit" disabled={loading}>
              {loading
                ? t("login.submitting")
                : idpEnabled
                  ? t("login.submitIdp")
                  : t("login.submit")}
            </Button>
            {idpEnabled && import.meta.env.DEV ? (
              <Button
                type="button"
                variant="secondary"
                className="btn-outline"
                disabled={loading}
                onClick={handleSubmitLocal}
              >
                {loading ? t("login.submitting") : t("login.submitLocalDev")}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" className="btn-outline" onClick={() => navigate("/")}>
              {t("login.back")}
            </Button>
          </div>
        </form>
        {idpEnabled ? <p className="kpi-label login-idp-hint">{t("login.idpHint")}</p> : null}
        <p className="kpi-label login-legal-hint">
          {t("login.legalHint")}{" "}
          <button type="button" className="link-btn" onClick={() => navigate("/terms")}>
            {t("footer.terms")}
          </button>
          {" · "}
          <button type="button" className="link-btn" onClick={() => navigate("/privacy")}>
            {t("footer.privacy")}
          </button>
        </p>
      </div>
    </section>
  );
}
