import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommandPalette, { useCommandPaletteShortcut } from "@dakinis/shared-ux/react/CommandPalette.jsx";
import { useLocale } from "../../context/LocaleContext.jsx";
import { dakinisOpenEcosystemProduct } from "../../utils/ecosystemSso.js";
import { useDakinisSession } from "../../context/SessionContext.jsx";

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

  function runCommand(cmd) {
    const id = cmd?.id;
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
  }

  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      onRun={runCommand}
      t={(key) => {
        const map = {
          "cmdk.title": t("cmdk.title"),
          "cmdk.placeholder": t("cmdk.placeholder"),
          "cmdk.noResults": t("cmdk.noResults"),
          "cmdk.hintNavigate": t("cmdk.hintNavigate"),
          "cmdk.hintAi": t("cmdk.hintAi"),
        };
        return map[key] || key;
      }}
    />
  );
}
