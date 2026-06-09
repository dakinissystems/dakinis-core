import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";

const DAKINIS_DEMO_MENU_OPTIONS = {
  whatsapp: [
    { id: "clientHistory", labelKey: "businessDemo.options.whatsapp.clientHistory" },
    { id: "paymentLink", labelKey: "businessDemo.options.whatsapp.paymentLink" },
    { id: "followUpTemplate", labelKey: "businessDemo.options.whatsapp.followUpTemplate" },
    { id: "assignAgent", labelKey: "businessDemo.options.whatsapp.assignAgent" },
    { id: "addCampaign", labelKey: "businessDemo.options.whatsapp.addCampaign" }
  ],
  crm: [
    { id: "clientProfile", labelKey: "businessDemo.options.crm.clientProfile" },
    { id: "whatsappProposal", labelKey: "businessDemo.options.crm.whatsappProposal" },
    { id: "scheduleFollowUp", labelKey: "businessDemo.options.crm.scheduleFollowUp" },
    { id: "markWon", labelKey: "businessDemo.options.crm.markWon" }
  ],
  inventory: [
    { id: "reorderSupplier", labelKey: "businessDemo.options.inventory.reorderSupplier" },
    { id: "adjustStock", labelKey: "businessDemo.options.inventory.adjustStock" },
    { id: "linkToSale", labelKey: "businessDemo.options.inventory.linkToSale" },
    { id: "setAlert", labelKey: "businessDemo.options.inventory.setAlert" },
    { id: "exportList", labelKey: "businessDemo.options.inventory.exportList" }
  ],
  reports: [
    { id: "exportPdf", labelKey: "businessDemo.options.reports.exportPdf" },
    { id: "shareWhatsapp", labelKey: "businessDemo.options.reports.shareWhatsapp" },
    { id: "comparePeriod", labelKey: "businessDemo.options.reports.comparePeriod" },
    { id: "scheduleReport", labelKey: "businessDemo.options.reports.scheduleReport" },
    { id: "drillDown", labelKey: "businessDemo.options.reports.drillDown" }
  ],
  dashboard: [
    { id: "exportSummary", labelKey: "businessDemo.options.dashboard.exportSummary" },
    { id: "shareTeam", labelKey: "businessDemo.options.dashboard.shareTeam" },
    { id: "setGoals", labelKey: "businessDemo.options.dashboard.setGoals" }
  ]
};

const DAKINIS_DEMO_TOAST_CONTEXTS = new Set(["crm", "inventory", "reports", "dashboard"]);

export default function BusinessDemoOptionsMenu({ context = "whatsapp", subjectName = "", className = "" }) {
  const { t } = useLocale();
  const menuId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const options = DAKINIS_DEMO_MENU_OPTIONS[context] || DAKINIS_DEMO_MENU_OPTIONS.whatsapp;

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(""), 5200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function selectOption(optionId) {
    setOpen(false);
    setFeedback(
      t(`businessDemo.options.feedback.${context}.${optionId}`, {
        name: subjectName || t("businessDemo.options.defaultSubject")
      })
    );
  }

  return (
    <div className={`demo-options-menu${className ? ` ${className}` : ""}`} ref={rootRef}>
      <button
        type="button"
        className="demo-options-menu__trigger"
        aria-label={t("businessDemo.options.moreAria")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <span className="demo-options-menu__dots" aria-hidden>
          ⋮
        </span>
      </button>

      {open ? (
        <ul id={menuId} className="demo-options-menu__panel" role="menu">
          {options.map((opt) => (
            <li key={opt.id} role="none">
              <button
                type="button"
                role="menuitem"
                className="demo-options-menu__item"
                onClick={() => selectOption(opt.id)}
              >
                {t(opt.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {feedback ? (
        <p
          className={`demo-options-menu__feedback${
            DAKINIS_DEMO_TOAST_CONTEXTS.has(context) ? " demo-options-menu__feedback--toast" : ""
          }`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
