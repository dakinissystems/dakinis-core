import { dakinisCreatePendingAction } from "./bos-store.js";
import { dakinisCrmListContacts } from "./crm-store.js";

/**
 * Deriva acciones ejecutables desde pregunta + señales tenant.
 */
export async function dakinisDeriveIntelligenceActions(business, question, signals) {
  const q = String(question || "").toLowerCase();
  const actions = [];

  const inactivePattern =
    /sin comprar|sin venir|recuperar|perdidos|90 días|60 días|inactivos|llamar/.test(q);
  const stockPattern = /stock|comprar|reponer|productos bajando/.test(q);
  const reminderPattern = /recordatorio|reservas mañana|citas mañana/.test(q);

  if (inactivePattern) {
    const contacts = await dakinisCrmListContacts(business.id, { limit: 500 }).catch(() => []);
    const count = Math.max(0, contacts.length - (signals.activities7d || 0));
    const est = count > 0 ? Math.min(count, 50) : Math.max(3, Math.floor((signals.crmContacts || 0) * 0.2));
    const actionId = await dakinisCreatePendingAction(business.id, {
      actionType: "whatsapp_campaign",
      label: `Enviar WhatsApp a ${est} clientes inactivos`,
      payload: { contactCount: est, channel: "whatsapp", reason: "winback" }
    });
    actions.push({
      id: actionId,
      type: "whatsapp_campaign",
      label: `Encontré ~${est} clientes a recuperar. ¿Enviar WhatsApp?`,
      confirmLabel: "Preparar campaña WhatsApp",
      payload: { contactCount: est }
    });
  }

  if (stockPattern && (signals.stockAlerts || 0) > 0) {
    const qty = Math.max(5, signals.stockAlerts * 5);
    const actionId = await dakinisCreatePendingAction(business.id, {
      actionType: "stock_reorder",
      label: `Comprar ${qty} unidades (stock bajo)`,
      payload: { quantity: qty, itemSlug: "insumo-critico", reason: "low_stock" }
    });
    actions.push({
      id: actionId,
      type: "stock_reorder",
      label: `Stock bajo: sugerencia comprar ${qty} unidades`,
      confirmLabel: "Registrar sugerencia de compra",
      payload: { quantity: qty }
    });
  }

  if (reminderPattern) {
    const est = Math.max(1, Math.floor((signals.reservations7d || 0) / 7));
    const actionId = await dakinisCreatePendingAction(business.id, {
      actionType: "crm_followup",
      label: `Recordatorios para ${est} reservas/citas`,
      payload: { contactCount: est, kind: "reminder" }
    });
    actions.push({
      id: actionId,
      type: "crm_followup",
      label: `~${est} reservas/citas: ¿enviar recordatorios?`,
      confirmLabel: "Preparar recordatorios",
      payload: { contactCount: est }
    });
  }

  return actions;
}
