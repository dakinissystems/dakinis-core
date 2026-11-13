import { dakinisGetIndustryTemplate } from "./business-templates.js";

/** Preguntas y respuestas heurísticas por industria. */
const DAKINIS_INDUSTRY_AI_PLAYBOOKS = {
  restaurante: [
    {
      id: "stock_review",
      question: "Revisar productos bajo mínimo",
      available: (s) => Number(s.stockAlerts) > 0,
      heuristic: (s) => `Hay ${Number(s.stockAlerts)} referencias que necesitan revisión.`,
      basis: (s) => `Se han detectado ${Number(s.stockAlerts)} alertas de inventario.`,
      impact: "No calculado. Faltan cantidades de reposición y costes.",
      action: "inventario"
    },
    {
      id: "promo_dishes",
      question: "¿Qué platos debería promocionar?",
      available: () => false,
      heuristic: () => "No se propone. Hacen falta excedentes medidos, recetas vinculadas y estacionalidad.",
      basis: () => "Una alerta de stock mínimo indica falta de inventario, no un excedente para promocionar.",
      impact: "No calculado.",
      action: null
    }
  ],
  inmobiliaria: [
    {
      id: "close_leads",
      question: "¿Qué leads tienen más probabilidad de cierre?",
      heuristic: (s) =>
        s.crmContacts > 0
          ? `Revisa los ${Math.min(5, s.crmContacts)} contactos con actividad reciente y visitas programadas en CRM.`
          : "Importa leads y registra visitas para priorizar cierres."
    }
  ],
  peluqueria: [
    {
      id: "winback_60",
      question: "¿Qué clientes llevan más de 60 días sin venir?",
      heuristic: (s) =>
        s.crmContacts > 3
          ? "Filtra en CRM clientes sin cita en 60 días; envía campaña WhatsApp de retorno."
          : "Amplía la base CRM para detectar clientes inactivos."
    }
  ],
  clinica: [
    {
      id: "contact_patients",
      question: "¿Qué pacientes debo contactar?",
      heuristic: (s) =>
        s.activities7d < s.crmContacts
          ? "Contacta pacientes sin actividad en 30 días y citas pendientes de confirmación."
          : "Buena actividad reciente; enfócate en recordatorios de tratamiento."
    }
  ]
};

const DAKINIS_GENERIC_PLAYBOOK = [
  {
    id: "recover_clients",
    question: "¿Qué clientes debo recuperar?",
    heuristic: (s) =>
      s.crmContacts > 0
        ? "Clientes sin actividad en 14+ días en CRM."
        : "Crea contactos en CRM para identificar clientes a recuperar."
  },
  {
    id: "declining_products",
    question: "¿Qué productos están bajando?",
    heuristic: (s) =>
      s.stockAlerts > 0
        ? "Revisa rotación de inventario y alertas de stock."
        : "Registra ventas/pedidos para detectar tendencias."
  }
];

export function dakinisGetIndustryAiPlaybook(industryKey) {
  return DAKINIS_INDUSTRY_AI_PLAYBOOKS[industryKey] || DAKINIS_GENERIC_PLAYBOOK;
}

export function dakinisRunIndustryAiHeuristics(business, signals) {
  const template = dakinisGetIndustryTemplate(business?.type);
  const playbook = dakinisGetIndustryAiPlaybook(template?.key || business?.type);
  const alerts = Number(signals.stockAlerts ?? 0);
  const contacts = Number(signals.crmContacts ?? 0);
  const fallbackBasis =
    alerts > 0
      ? `Sale de ${alerts} alertas de stock registradas. No lista ingredientes ni calcula un importe.`
      : contacts > 0
        ? `Sale de ${contacts} contactos en CRM. No calcula un impacto en euros.`
        : "No hay una medición de ingredientes, coste ni margen detrás de este texto.";
  return playbook.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.heuristic(signals),
    source: "heuristic",
    available: typeof item.available === "function" ? item.available(signals) : true,
    basis: typeof item.basis === "function" ? item.basis(signals) : fallbackBasis,
    impact: item.impact ?? null,
    action: item.action || null,
    industry: template?.label || business?.type
  }));
}
