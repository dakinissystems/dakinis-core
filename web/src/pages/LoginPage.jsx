import { useState, useEffect } from "react";
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
import PasswordInput from "../components/PasswordInput.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setSession } = useDakinisSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const idpEnabled = isIdpAuthEnabled();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dakinis_session_expired") === "1") {
        sessionStorage.removeItem("dakinis_session_expired");
        setError("Tu sesión expiró. Inicia sesión de nuevo.");
      }
    } catch {
      /* ignore */
    }
  }, []);

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
    try {
      const idp = await loginViaIdp(email.trim(), password);
      if (idp.refreshToken) setIdpRefreshToken(idp.refreshToken);
      const tenantRef = dakinisResolveExchangeTenantRef(email, idp);
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
      setError(err instanceof Error ? err.message : t("login.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.LOGIN_STARTED);
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

  return (
    <section className="modules login-page">
      <div className="container login-page__inner">
        <p className="kicker">{t("login.kicker")}</p>
        <h2 className="login-page__title">{t("login.title")}</h2>
        <p className="lead login-page__lead">{t("login.businessLead")}</p>
        <div className="login-demo-cta card">
          <p className="kpi-label">{t("login.tryWithoutAccount")}</p>
          <button type="button" className="btn" onClick={() => navigate("/demo/restaurante")}>
            {t("commercial.tryDemo")}
          </button>
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
          {error ? <p className="login-form__error">{error}</p> : null}
          <p className="kpi-label" style={{ margin: 0 }}>
            <button type="button" className="btn btn-outline" style={{ padding: "0.25rem 0.5rem" }} onClick={() => navigate("/forgot-password")}>
              {t("login.forgotPassword")}
            </button>
          </p>
          <div className="login-form__actions">
            <button type="submit" className="btn login-form__submit" disabled={loading}>
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
            {idpEnabled ? (
              <button
                type="button"
                className="btn btn-outline"
                disabled={loading}
                onClick={handleIdpSubmit}
              >
                {loading ? t("login.submitting") : t("login.submitIdp")}
              </button>
            ) : null}
            <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
              {t("login.back")}
            </button>
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
