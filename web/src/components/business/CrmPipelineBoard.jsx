import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { DAKINIS_CRM_PIPELINE_STAGES } from "../../data/businessDemoContent.js";
import BusinessDemoOptionsMenu from "./BusinessDemoOptionsMenu.jsx";

export default function CrmPipelineBoard({ draggable = true }) {
  const { t } = useLocale();
  const [stages, setStages] = useState(() =>
    DAKINIS_CRM_PIPELINE_STAGES.map((s) => ({ ...s, cards: [...s.cards] }))
  );
  const [dragCard, setDragCard] = useState(null);

  function onDragStart(stageId, cardName) {
    if (!draggable) return;
    setDragCard({ stageId, cardName });
  }

  function onDrop(targetStageId) {
    if (!dragCard || dragCard.stageId === targetStageId) {
      setDragCard(null);
      return;
    }
    setStages((prev) => {
      const next = prev.map((s) => ({ ...s, cards: [...s.cards] }));
      const from = next.find((s) => s.id === dragCard.stageId);
      const to = next.find((s) => s.id === targetStageId);
      if (!from || !to) return prev;
      const idx = from.cards.indexOf(dragCard.cardName);
      if (idx === -1) return prev;
      from.cards.splice(idx, 1);
      to.cards.push(dragCard.cardName);
      from.count = from.cards.length;
      to.count = to.cards.length;
      return next;
    });
    setDragCard(null);
  }

  return (
    <div className="crm-pipeline" aria-label={t("businessDemo.pipeline.aria")}>
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="crm-pipeline__column card"
          onDragOver={(e) => draggable && e.preventDefault()}
          onDrop={() => onDrop(stage.id)}
        >
          <header className="crm-pipeline__header">
            <h4>{t(stage.labelKey)}</h4>
            <span className="crm-pipeline__count">{stage.count}</span>
          </header>
          <ul className="crm-pipeline__cards" role="list">
            {stage.cards.map((name) => (
              <li
                key={`${stage.id}-${name}`}
                className="crm-pipeline__card"
                draggable={draggable}
                onDragStart={() => onDragStart(stage.id, name)}
              >
                <span className="crm-pipeline__card-name">{name}</span>
                <BusinessDemoOptionsMenu context="crm" subjectName={name} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
