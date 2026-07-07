export default function SettingsBillingCard({ t, billing, aiUsage }) {
  if (!billing) return null;

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>{t("app.settings.billingTitle")}</h3>
      <p className="lead">
        {t("app.settings.billingPlan", {
          plan: billing.subscription?.plan,
          base: billing.usage?.commercial?.baseEur ?? billing.usage?.planBaseEur
        })}
      </p>
      {billing.usage?.commercial?.includes?.length ? (
        <p>{billing.usage.commercial.includes.join(" · ")}</p>
      ) : null}
      {aiUsage ? (
        <p>
          {t("app.settings.billingAi", {
            queries: aiUsage.queries,
            days: aiUsage.periodDays
          })}
          {billing.usage?.commercial?.included?.aiQueries
            ? ` · ${t("app.settings.billingAiIncluded", {
                count: billing.usage.commercial.included.aiQueries
              })}`
            : ""}
          {billing.usage?.commercial?.overage?.aiEur > 0
            ? ` · ${t("app.settings.billingAiOverage", {
                amount: billing.usage.commercial.overage.aiEur
              })}`
            : ""}
        </p>
      ) : null}
      {billing.usage?.whatsapp?.messages30d != null ? (
        <p>
          {t("app.settings.billingWhatsapp", {
            messages: billing.usage.whatsapp.messages30d
          })}
          {billing.usage?.commercial?.included?.whatsappMessages
            ? ` · ${t("app.settings.billingWhatsappIncluded", {
                count: billing.usage.commercial.included.whatsappMessages
              })}`
            : ""}
          {billing.usage?.commercial?.overage?.whatsappEur > 0
            ? ` · ${t("app.settings.billingWhatsappOverage", {
                amount: billing.usage.commercial.overage.whatsappEur
              })}`
            : ""}
        </p>
      ) : null}
      <p>
        {t("app.settings.billingEstimate")}{" "}
        <strong>{billing.nextInvoiceEstimate?.amount} €</strong>
        {billing.nextInvoiceEstimate?.note ? ` — ${billing.nextInvoiceEstimate.note}` : ""}
        {billing.stripeConnected ? "" : ` ${t("app.settings.billingStripePending")}`}
      </p>
    </div>
  );
}
