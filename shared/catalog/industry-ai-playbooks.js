import { dakinisGetIndustryTemplate } from "./business-templates.js";

/** Preguntas y respuestas heurísticas por industria. */
const DAKINIS_INDUSTRY_AI_PLAYBOOKS = {
  restaurante: [
    {
      id: "promo_dishes",
      question: "¿Qué platos debería promocionar?",
      heuristic: (s) =>
        s.stockAlerts > 0
          ? "Prioriza platos con ingredientes en exceso de stock y menú de temporada."
          : "Promociona el menú del día y platos con mejor margen (consulta ventas en dashboard)."
    },
    {
      id: "stock_buy",
      question: "¿Cuánto stock debo comprar?",
      heuristic: (s) =>
        s.stockAlerts > 0
          ? `Reponer ${s.stockAlerts} SKU bajo mínimo según alertas de inventario.`
          : "Stock estable; compra habitual según consumo de la última semana."
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
  return playbook.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.heuristic(signals),
    source: "heuristic",
    industry: template?.label || business?.type
  }));
}
