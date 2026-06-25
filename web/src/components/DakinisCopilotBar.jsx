import { useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import DakinisCopilotPanel from "./DakinisCopilotPanel.jsx";

export default function DakinisCopilotBar() {
  const { session } = useDakinisSession();
  const [open, setOpen] = useState(false);

  if (!session?.token || session.user?.role === "platform_admin") return null;

  return (
    <div className="copilot-bar">
      <button
        type="button"
        className="btn btn-outline copilot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        ✨ Pregúntale a Dakinis
      </button>
      {open ? <DakinisCopilotPanel variant="dropdown" /> : null}
    </div>
  );
}
