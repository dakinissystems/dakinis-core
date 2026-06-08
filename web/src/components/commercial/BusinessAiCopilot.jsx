import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";

const VERTICAL_QUESTION_KEYS = {
  restaurante: ["restock", "inactive", "cancellations"],
  clinica: ["inactive", "noShow", "upsell"],
  peluqueria: ["inactive", "noShow", "restock"],
  inmobiliaria: ["followUp", "inactive", "visits"]
};

export default function BusinessAiCopilot({ verticalKey = "restaurante" }) {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState(null);

  const questionIds = VERTICAL_QUESTION_KEYS[verticalKey] || VERTICAL_QUESTION_KEYS.restaurante;
  const questions = t("commercial.ai.questions") || {};

  return (
    <section className="commercial-ai card">
      <p className="kicker">{t("commercial.ai.kicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{t("commercial.ai.title")}</h3>
      <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
        {t("commercial.ai.lead")}
      </p>

      <div className="commercial-ai__chips">
        {questionIds.map((id) => {
          const q = questions[id];
          if (!q) return null;
          const isActive = activeId === id;
          return (
            <button
              key={id}
              type="button"
              className={isActive ? "btn" : "btn btn-outline"}
              onClick={() => setActiveId(isActive ? null : id)}
            >
              {q.prompt}
            </button>
          );
        })}
      </div>

      {activeId && questions[activeId] ? (
        <article className="commercial-ai__answer">
          <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
            {t("commercial.ai.answerLabel")}
          </p>
          <p style={{ margin: 0 }}>{questions[activeId].answer}</p>
        </article>
      ) : (
        <p className="kpi-label" style={{ margin: "0.75rem 0 0" }}>
          {t("commercial.ai.hint")}
        </p>
      )}
    </section>
  );
}
