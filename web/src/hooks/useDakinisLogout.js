import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dakinisPerformClientLogout } from "@dakinis/shared/auth/client-logout.js";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisClearEcosystemSession } from "@dakinis/shared-brand/sso";
import { dakinisClearAuthToken } from "../services/auth.js";
import { setIdpRefreshToken } from "../services/idp-auth.js";

/**
 * Unified sign-out: clear session storage, legacy token, redirect to /login.
 */
export function useDakinisLogout() {
  const { logout: clearSession } = useDakinisSession();
  const navigate = useNavigate();

  return useCallback(
    () =>
      dakinisPerformClientLogout({
        clearLocalSession: () => {
          clearSession();
          dakinisClearAuthToken();
          dakinisClearEcosystemSession();
          setIdpRefreshToken(null);
        },
        navigate: (to, opts) => navigate(to, opts),
      }),
    [clearSession, navigate]
  );
}
