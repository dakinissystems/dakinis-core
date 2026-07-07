import { useEffect } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

/** Refresca accessState/plan en sesión tras login (p. ej. post-checkout o restore). */
export function useBillingSessionRefresh() {
  const { session, setSession } = useDakinisSession();

  useEffect(() => {
    const token = session?.token;
    if (!token || session?.user?.role === "platform_admin") return undefined;

    let cancelled = false;

    (async () => {
      try {
        const json = await dakinisTenantJsonFetch("/api/me", session);
        const business = json?.data?.business;
        if (!business || cancelled) return;

        setSession((prev) => ({
          ...prev,
          business: {
            ...prev?.business,
            ...business,
          },
        }));
      } catch {
        /* ignore — banner uses cached session */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, setSession]);
}
