import { dakinisSearchConfigured, dakinisSearchRequest } from "./search-client.js";

/**
 * @param {{ scope: string; id: string; title?: string; body?: string; metadata?: object }} doc
 */
export async function dakinisIndexSearchDocument(doc) {
  if (!dakinisSearchConfigured()) return { indexed: false, reason: "not_configured" };
  const result = await dakinisSearchRequest("/v1/index", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: doc.scope,
      id: doc.id,
      title: doc.title || "",
      body: doc.body || "",
      metadata: doc.metadata || {},
    }),
  });
  return { indexed: result.ok, status: result.status, data: result.data };
}

/**
 * @param {string} businessId
 * @param {string} entity
 * @param {{ id: string; [key: string]: unknown }} record
 */
export async function dakinisIndexTenantRecord(businessId, entity, record) {
  const id = String(record.id || "");
  if (!id) return { indexed: false };

  let scope = "global";
  let title = id;
  let body = "";
  let path = "/app/dashboard";

  if (entity === "restaurant_order") {
    scope = "orders";
    title = `Pedido #${record.orderNumber || record.number || id.slice(-6)}`;
    body = [record.customerName, record.table, record.status, record.notes].filter(Boolean).join(" ");
    path = `/app/ventas?order=${encodeURIComponent(id)}`;
  } else if (entity === "restaurant_invoice") {
    scope = "invoices";
    title = `Factura #${record.invoiceNumber || record.number || id.slice(-6)}`;
    body = [record.customerName, record.status, record.total].filter(Boolean).join(" ");
    path = `/app/ventas?invoice=${encodeURIComponent(id)}`;
  } else if (entity === "reserva") {
    scope = "events";
    title = record.guestName ? `Reserva · ${record.guestName}` : `Reserva ${id}`;
    body = [record.date, record.time, record.partySize, record.status].filter(Boolean).join(" ");
    path = "/app/crm";
  } else if (entity === "comanda") {
    scope = "orders";
    title = record.label ? `Comanda · ${record.label}` : `Comanda ${id}`;
    body = [record.status, record.table].filter(Boolean).join(" ");
    path = "/app/ventas";
  } else if (entity === "paciente") {
    scope = "clients";
    title = record.name ? `Paciente · ${record.name}` : `Paciente ${id}`;
    body = [record.phone, record.email, record.notes].filter(Boolean).join(" ");
    path = "/app/crm";
  }

  return dakinisIndexSearchDocument({
    scope,
    id: `${businessId}:${entity}:${id}`,
    title,
    body,
    metadata: { businessId, entity, recordId: id, path, product: "core" },
  });
}

/**
 * @param {string} businessId
 * @param {{ id: string; display_name?: string; phone?: string; wa_profile_name?: string }} contact
 */
export async function dakinisIndexWhatsappContact(businessId, contact) {
  const id = String(contact.id || "");
  if (!id) return { indexed: false };
  const title = contact.display_name || contact.wa_profile_name || contact.phone || id;
  return dakinisIndexSearchDocument({
    scope: "clients",
    id: `${businessId}:contact:${id}`,
    title,
    body: `WhatsApp ${contact.phone || ""}`,
    metadata: {
      businessId,
      recordId: id,
      path: `/app/whatsapp?contact=${encodeURIComponent(id)}`,
      product: "core",
    },
  });
}
