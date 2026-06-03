import {
  dakinisBuildProductLaunchUrl,
  dakinisNeedsEcosystemLaunchBridge,
  dakinisPersistEcosystemSession,
  dakinisProductRequiresIdpExchange
} from "@dakinis/shared-brand/sso";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "./analytics.js";

/**
 * Abre un producto del ecosistema (Core interno o URL externa con contexto SSO preparado).
 */
export function dakinisOpenEcosystemProduct(productId, { session, navigate, returnUrl }) {
  if (session?.token) {
    dakinisPersistEcosystemSession(session);
  }

  if (dakinisNeedsEcosystemLaunchBridge(productId, session) && navigate) {
    const q = returnUrl ? `?return_url=${encodeURIComponent(returnUrl)}` : "";
    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.PRODUCT_OPENED, {
      productId,
      bridge: "ecosystem-launch",
      hasSession: true,
      idpExchange: true
    });
    navigate(`/ecosystem/launch/${encodeURIComponent(productId)}${q}`);
    return;
  }

  const launchUrl = dakinisBuildProductLaunchUrl(productId, { session, returnUrl });

  dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.PRODUCT_OPENED, {
    productId,
    external: launchUrl.startsWith("http"),
    hasSession: Boolean(session?.token),
    idpExchange: dakinisProductRequiresIdpExchange(productId)
  });

  if (launchUrl.startsWith("http")) {
    window.location.href = launchUrl;
    return;
  }

  if (navigate) {
    navigate(launchUrl);
  }
}
