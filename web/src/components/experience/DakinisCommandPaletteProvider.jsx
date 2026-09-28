import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommandPalette, { useCommandPaletteShortcut } from "@dakinis/shared-ux/react/CommandPalette.jsx";
import { resolveSearchHitPath } from "@dakinis/shared-ux/command-palette";
import { useLocale } from "../../context/LocaleContext.jsx";
import { dakinisOpenEcosystemProduct } from "../../utils/ecosystemSso.js";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisFetchSearchHits } from "../../services/search.js";
import {
  dakinisHospitalityCommands,
  dakinisHospitalitySearchHits
} from "../../utils/hospitalityCommandPalette.js";

export default function DakinisCommandPaletteProvider() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();
  const { session } = useDakinisSession();

  const onOpen = useCallback(() => setOpen(true), []);
  useCommandPaletteShortcut(onOpen);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("dakinis:open-command-palette", handler);
    return () => window.removeEventListener("dakinis:open-command-palette", handler);
  }, []);

  const hospitalityCommands = useMemo(() => dakinisHospitalityCommands(session, t), [session, t]);

  const fetchSearchHits = useCallback(
    async (query, scope, signal) => {
      const local = dakinisHospitalitySearchHits(session, query, t);
      if (!session?.token) return local;
      try {
        const remote = await dakinisFetchSearchHits(session, query, scope, { signal });
        return [...local, ...(Array.isArray(remote) ? remote : [])];
      } catch {
        return local;
      }
    },
    [session, t]
  );

  function runCommand(cmd) {
    const id = cmd?.id;
    if (cmd?.path) {
      navigate(cmd.path);
      return;
    }
    if (id === "open-hub") navigate("/hub");
    else if (id === "open-core") navigate("/app/dashboard");
    else if (id === "open-lifeflow") dakinisOpenEcosystemProduct("lifeflow", { session, navigate });
    else if (id === "open-stream") dakinisOpenEcosystemProduct("streamautomator", { session, navigate });
    else if (id === "open-akoenet") dakinisOpenEcosystemProduct("akoenet", { session, navigate });
    else if (id === "create-customer") navigate("/app/crm");
    else if (id === "create-invoice" || id === "create-order") navigate("/app/ventas");
    else if (id === "ask-ai" || id === "ai-summary") navigate("/app/dashboard");
    else if (id === "toggle-theme") navigate("/app/settings");
    else if (id === "switch-product") navigate("/hub");
    else if (id === "search") setOpen(true);
    else if (String(id || "").startsWith("rest-")) {
      const match = hospitalityCommands.find((c) => c.id === id);
      if (match?.path) navigate(match.path);
    }
  }

  function handleSearchHit(hit) {
    if (hit?.path) {
      navigate(hit.path);
      return;
    }
    const path = resolveSearchHitPath(hit);
    if (path.startsWith("http")) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(path);
  }

  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      onRun={runCommand}
      extraCommands={hospitalityCommands}
      fetchSearchHits={fetchSearchHits}
      onSelectSearchHit={handleSearchHit}
      t={(key) => {
        const map = {
          "cmdk.title": t("cmdk.title"),
          "cmdk.placeholder": t("cmdk.placeholder"),
          "cmdk.noResults": t("cmdk.noResults"),
          "cmdk.hintNavigate": t("cmdk.hintNavigate"),
          "cmdk.hintAi": t("cmdk.hintAi"),
          "cmdk.searchLoading": t("cmdk.searchLoading"),
          "cmdk.searchResult": t("cmdk.searchResult")
        };
        return map[key] || key;
      }}
    />
  );
}
