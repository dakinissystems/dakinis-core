import { useEffect, useRef } from "react";
import { dakinisPathToTelemetryFeature } from "@dakinis/shared/catalog/telemetry-features.js";
import { dakinisTenantTelemetryFeature } from "../services/tenant-intelligence.js";
import { dakinisIsBusinessDemoSession } from "../utils/businessDemoMode.js";

function dakinisEndTelemetrySession(session, sessionId) {
  if (!session?.token || !sessionId) return;
  dakinisTenantTelemetryFeature(session, {
    event: "end",
    sessionId
  }).catch(() => {});
}

function dakinisStartTelemetrySession(session, pathname) {
  const feature = dakinisPathToTelemetryFeature(pathname);
  if (!session?.token || !feature) return Promise.resolve(null);
  return dakinisTenantTelemetryFeature(session, {
    event: "start",
    feature,
    path: pathname
  })
    .then((json) => json?.data?.telemetry?.sessionId || null)
    .catch(() => null);
}

/**
 * Registra inicio/fin de sesión por pantalla en /app/* (fire-and-forget, no bloquea UI).
 */
export function useDakinisFeatureTelemetry(session, pathname) {
  const activeRef = useRef({ sessionId: null, path: null });

  useEffect(() => {
    if (!session?.token || !pathname.startsWith("/app/")) return undefined;
    if (dakinisIsBusinessDemoSession(session)) return undefined;

    const prev = activeRef.current;
    if (prev.sessionId && prev.path !== pathname) {
      dakinisEndTelemetrySession(session, prev.sessionId);
      activeRef.current = { sessionId: null, path: null };
    }

    let cancelled = false;
    dakinisStartTelemetrySession(session, pathname).then((sessionId) => {
      if (cancelled || !sessionId) return;
      activeRef.current = { sessionId, path: pathname };
    });

    const onHide = () => {
      const current = activeRef.current;
      if (current.sessionId) {
        dakinisEndTelemetrySession(session, current.sessionId);
        activeRef.current = { sessionId: null, path: null };
      }
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      const current = activeRef.current;
      if (current.sessionId && current.path === pathname) {
        dakinisEndTelemetrySession(session, current.sessionId);
        activeRef.current = { sessionId: null, path: null };
      }
    };
  }, [session?.token, pathname]);
}
