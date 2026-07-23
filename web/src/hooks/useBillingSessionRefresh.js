import { useEffect, useRef } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

function dakinisBusinessBillingFingerprint(business) {
  if (!business || typeof business !== "object") return "";
  return [
    business.id,
    business.slug,
    business.plan,
    business.type,
    business.accessState,
    business.subscriptionStatus,
    business.trialEndsAt
  ]
    .map((v) => String(v ?? ""))
    .join("|");
}

/** Refresca accessState/plan en sesión tras login (una vez por token; sin bucle setSession). */
export function useBillingSessionRefresh() {
  const { session, setSession } = useDakinisSession();
  const token = session?.token;
  const isPlatformAdmin = session?.user?.role === "platform_admin";
  const refreshedForToken = useRef(null);

  useEffect(() => {
    if (!token || isPlatformAdmin) return undefined;
    if (refreshedForToken.current === token) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const json = await dakinisTenantJsonFetch("/api/me", { token });
        const business = json?.data?.business;
        if (!business || cancelled) return;

        refreshedForToken.current = token;

        setSession((prev) => {
          if (!prev?.token) return prev;
          const prevFp = dakinisBusinessBillingFingerprint(prev.business);
          const nextFp = dakinisBusinessBillingFingerprint({ ...prev.business, ...business });
          if (prevFp === nextFp) return prev;
          return {
            ...prev,
            business: {
              ...prev.business,
              ...business
            }
          };
        });
      } catch {
        /* ignore — banner uses cached session */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, isPlatformAdmin, setSession]);
}
