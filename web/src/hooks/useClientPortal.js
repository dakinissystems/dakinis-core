import { use } from "react";

const portalPromises = new Map();

function dakinisLoadClientPortal(slug) {
  let entry = portalPromises.get(slug);
  if (!entry) {
    entry = fetch(`/api/public/portal/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) {
          return { portal: null, error: json?.error?.message || "Portal no disponible" };
        }
        return { portal: json.data?.portal || null, error: null };
      })
      .catch((e) => ({
        portal: null,
        error: e instanceof Error ? e.message : "Error"
      }));
    portalPromises.set(slug, entry);
  }
  return entry;
}

/** Resolves public client portal payload for a tenant slug (React 19 `use()`). */
export function useClientPortal(slug) {
  return use(dakinisLoadClientPortal(slug));
}
