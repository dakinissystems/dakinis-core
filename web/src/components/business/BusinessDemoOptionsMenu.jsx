import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
const DAKINIS_PANEL_MIN_WIDTH = 216;
const DAKINIS_PANEL_EST_HEIGHT = 200;

function dakinisCanUseDom() {
  return typeof document !== "undefined" && typeof window !== "undefined";
}

export default function BusinessDemoOptionsMenu({ context = "whatsapp", subjectName = "", className = "" }) {
  const { t } = useLocale();
  const menuId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);

  const options = DAKINIS_DEMO_MENU_OPTIONS[context] || DAKINIS_DEMO_MENU_OPTIONS.whatsapp;
  const useToast = DAKINIS_DEMO_TOAST_CONTEXTS.has(context);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || !dakinisCanUseDom()) return;

    const rect = trigger.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight || DAKINIS_PANEL_EST_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelHeight + 12 && rect.top > panelHeight + 12;

    let top = openUp ? rect.top - panelHeight - 6 : rect.bottom + 6;
    let left = rect.right - DAKINIS_PANEL_MIN_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - DAKINIS_PANEL_MIN_WIDTH - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - panelHeight - 8));

    setPanelStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${DAKINIS_PANEL_MIN_WIDTH}px`,
      zIndex: 90
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return undefined;
    }
    updatePanelPosition();
    const raf = requestAnimationFrame(() => updatePanelPosition());
    const onLayoutChange = () => updatePanelPosition();
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      const target = e.target;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
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

  const panel =
    open && panelStyle && dakinisCanUseDom() ? (
      <ul
        id={menuId}
        ref={panelRef}
        className="demo-options-menu__panel demo-options-menu__panel--floating"
        role="menu"
        style={panelStyle}
      >
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
    ) : null;

  const feedbackNode = feedback ? (
    <p
      className={`demo-options-menu__feedback${
        useToast ? " demo-options-menu__feedback--toast" : " demo-options-menu__feedback--inline"
      }`}
      role="status"
    >
      {feedback}
    </p>
  ) : null;

  return (
    <div className={`demo-options-menu${className ? ` ${className}` : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className="demo-options-menu__trigger"
        aria-label={t("businessDemo.options.moreAria")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <span className="demo-options-menu__dots" aria-hidden>
          ⋮
        </span>
      </button>

      {panel && dakinisCanUseDom() ? createPortal(panel, document.body) : null}
      {feedbackNode && useToast && dakinisCanUseDom()
        ? createPortal(feedbackNode, document.body)
        : feedbackNode}
    </div>
  );
}
