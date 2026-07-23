import { useEffect, useRef } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisBearerJsonFetch } from "../services/api.js";
import { dakinisBusinessIdentityFingerprint } from "../utils/sessionIdentity.js";

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
        const json = await dakinisBearerJsonFetch("/api/me", token);
        const business = json?.data?.business;
        if (!business || cancelled) return;

        refreshedForToken.current = token;

        setSession((prev) => {
          if (!prev?.token) return prev;
          const nextBusiness = { ...prev.business, ...business };
          if (
            dakinisBusinessIdentityFingerprint(prev.business) ===
            dakinisBusinessIdentityFingerprint(nextBusiness)
          ) {
            return prev;
          }
          return {
            ...prev,
            business: nextBusiness
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
