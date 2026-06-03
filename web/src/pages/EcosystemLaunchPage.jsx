import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { dakinisGetProduct } from "@dakinis/shared-brand";
import { dakinisBuildProductLaunchUrl } from "@dakinis/shared-brand/sso";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";

const HASH_TOKEN_KEY = "platform_token";

/**
 * Puente SSO: pasa el JWT IdP al producto externo vía fragment (no va al servidor).
 */
export default function EcosystemLaunchPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useDakinisSession();
  const { t } = useLocale();
  const [error, setError] = useState("");

  useEffect(() => {
    const product = dakinisGetProduct(productId);
    if (!product?.external) {
      setError(t("ecosystemLaunch.invalidProduct"));
      return;
    }

    const idpToken = session?.idp?.accessToken;
    if (!idpToken) {
      navigate("/login", { replace: true });
      return;
    }

    const returnUrl = searchParams.get("return_url") || undefined;
    const target = dakinisBuildProductLaunchUrl(productId, { session, returnUrl });
    if (!target.startsWith("http")) {
      setError(t("ecosystemLaunch.invalidTarget"));
      return;
    }

    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.PRODUCT_OPENED, {
      productId,
      bridge: "ecosystem-launch",
      hasIdp: true
    });

    const url = new URL(target);
    url.hash = `${HASH_TOKEN_KEY}=${encodeURIComponent(idpToken)}`;
    window.location.replace(url.href);
  }, [productId, session, searchParams, navigate, t]);

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("ecosystemLaunch.title")}</h2>
        {error ? <p className="lead">{error}</p> : <p className="lead muted">{t("ecosystemLaunch.redirecting")}</p>}
      </div>
    </section>
  );
}
