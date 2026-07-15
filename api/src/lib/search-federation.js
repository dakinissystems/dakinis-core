import { dakinisQueryAll } from "../db/query.js";
import { dakinisSearchQuery, dakinisSearchConfigured } from "./search-client.js";

function knowledgeBaseUrl() {
  const direct = (process.env.DAKINIS_KNOWLEDGE_URL || "").replace(/\/$/, "");
  if (direct) return direct;
  const gateway = (process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/knowledge`;
  return "";
}

/**
 * @param {string} q
 * @param {string} [scope="knowledge"]
 */
async function dakinisKnowledgeSearch(q, scope = "knowledge") {
  const base = knowledgeBaseUrl();
  if (!base || !String(q).trim()) return [];

  try {
    const res = await fetch(`${base}/v1/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: q, q }),
      signal: AbortSignal.timeout(8_000),
    });
    const json = await res.json().catch(() => ({}));
    const body = json.body || json.data || json;
    const rawHits = body.hits || body.results || [];
    return rawHits.slice(0, 8).map((hit) => ({
      scope: scope === "ai" ? "knowledge" : scope,
      id: hit.id || hit.documentId || hit.slug || hit.title,
      title: hit.title || hit.label || "Documento",
      snippet: (hit.snippet || hit.excerpt || hit.content || "").slice(0, 120),
      score: hit.score ?? 0.85,
      path: hit.slug ? `/faq?slug=${encodeURIComponent(hit.slug)}` : `/faq?q=${encodeURIComponent(hit.title || q)}`,
      product: "knowledge",
    }));
  } catch {
    return [];
  }
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} q
 * @param {string} scopeRaw — scope UI (customers, orders, …)
 */
export async function dakinisFederatedLocalSearch(req, q, scopeRaw) {
  const needle = String(q || "").trim().toLowerCase();
  if (!needle || needle.length < 2) {
    return { hits: [], total: 0, mode: "local_empty" };
  }

  const businessId = req.dakinisBusiness?.id;
  if (!businessId) return { hits: [], total: 0, mode: "local_no_tenant" };

  /** @type {object[]} */
  const hits = [];
  const like = `%${needle}%`;

  const scope = scopeRaw || "all";
  const wants = (names) =>
    scope === "all" || names.includes(scope) || (scope === "orders" && names.includes("global"));

  if (wants(["customers", "clients", "all"])) {
    const contacts = await dakinisQueryAll(
      `SELECT id, phone, display_name, wa_profile_name
       FROM tenant_whatsapp_contacts
       WHERE business_id = ?
         AND (lower(COALESCE(display_name,'')) LIKE ? OR lower(phone) LIKE ? OR lower(COALESCE(wa_profile_name,'')) LIKE ?)
       LIMIT 10`,
      [businessId, like, like, like]
    );
    for (const row of contacts) {
      hits.push({
        scope: "clients",
        id: row.id,
        title: row.display_name || row.wa_profile_name || row.phone,
        snippet: `WhatsApp · ${row.phone || ""}`,
        score: 1,
        path: `/app/whatsapp?contact=${encodeURIComponent(row.id)}`,
        product: "core",
      });
    }
  }

  if (wants(["orders", "invoices", "global", "all"])) {
    const stock = await dakinisQueryAll(
      `SELECT id, name, slug
       FROM tenant_stock_items
       WHERE business_id = ?
         AND (lower(name) LIKE ? OR lower(slug) LIKE ?)
       LIMIT 8`,
      [businessId, like, like]
    );
    for (const row of stock) {
      hits.push({
        scope: "orders",
        id: row.id,
        title: row.name,
        snippet: row.slug ? `Inventario · ${row.slug}` : "Inventario",
        score: 0.92,
        path: `/app/ventas?item=${encodeURIComponent(row.id)}`,
        product: "core",
      });
    }

    const recipes = await dakinisQueryAll(
      `SELECT id, name, slug
       FROM tenant_recipes
       WHERE business_id = ?
         AND (lower(name) LIKE ? OR lower(slug) LIKE ?)
       LIMIT 6`,
      [businessId, like, like]
    ).catch(() => []);
    for (const row of recipes) {
      hits.push({
        scope: "orders",
        id: row.id,
        title: row.name,
        snippet: `Receta · ${row.slug || ""}`,
        score: 0.88,
        path: `/app/ventas?recipe=${encodeURIComponent(row.slug || row.id)}`,
        product: "core",
      });
    }
  }

  if (wants(["orders", "invoices", "events", "all"])) {
    const entities =
      scope === "invoices"
        ? ["restaurant_invoice"]
        : scope === "orders"
          ? ["restaurant_order", "comanda"]
          : scope === "events"
            ? ["reserva"]
            : ["restaurant_order", "restaurant_invoice", "reserva", "comanda", "paciente"];

    const placeholders = entities.map(() => "?").join(", ");
    const rows = await dakinisQueryAll(
      `SELECT id, entity, payload
       FROM tenant_records
       WHERE business_id = ?
         AND entity IN (${placeholders})
         AND lower(payload) LIKE ?
       ORDER BY created_at DESC
       LIMIT 12`,
      [businessId, ...entities, like]
    );

    for (const row of rows) {
      let payload = {};
      try {
        payload = JSON.parse(row.payload || "{}");
      } catch {
        payload = {};
      }

      if (row.entity === "restaurant_order") {
        hits.push({
          scope: "orders",
          id: row.id,
          title: `Pedido #${payload.orderNumber || payload.number || row.id.slice(-6)}`,
          snippet: [payload.customerName, payload.status, payload.table].filter(Boolean).join(" · "),
          score: 0.95,
          path: `/app/ventas?order=${encodeURIComponent(row.id)}`,
          product: "core",
        });
      } else if (row.entity === "restaurant_invoice") {
        hits.push({
          scope: "invoices",
          id: row.id,
          title: `Factura #${payload.invoiceNumber || payload.number || row.id.slice(-6)}`,
          snippet: [payload.customerName, payload.status].filter(Boolean).join(" · "),
          score: 0.94,
          path: `/app/ventas?invoice=${encodeURIComponent(row.id)}`,
          product: "core",
        });
      } else if (row.entity === "reserva") {
        hits.push({
          scope: "events",
          id: row.id,
          title: payload.guestName ? `Reserva · ${payload.guestName}` : `Reserva ${row.id}`,
          snippet: [payload.date, payload.time, payload.status].filter(Boolean).join(" · "),
          score: 0.9,
          path: "/app/crm",
          product: "core",
        });
      } else if (row.entity === "paciente") {
        hits.push({
          scope: "clients",
          id: row.id,
          title: payload.name ? `Paciente · ${payload.name}` : `Paciente ${row.id}`,
          snippet: [payload.phone, payload.email].filter(Boolean).join(" · "),
          score: 0.9,
          path: "/app/crm",
          product: "core",
        });
      }
    }
  }

  if (wants(["messages", "chats", "all"])) {
    const messages = await dakinisQueryAll(
      `SELECT id, peer_phone, body_text, direction, created_at
       FROM tenant_whatsapp_messages
       WHERE business_id = ?
         AND lower(COALESCE(body_text,'')) LIKE ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [businessId, like]
    );
    for (const row of messages) {
      hits.push({
        scope: scope === "chats" ? "chats" : "messages",
        id: row.id,
        title: row.peer_phone || "Mensaje WhatsApp",
        snippet: `${row.direction === "outbound" ? "↑" : "↓"} ${String(row.body_text || "").slice(0, 100)}`,
        score: 0.86,
        path: `/app/whatsapp?phone=${encodeURIComponent(row.peer_phone || "")}`,
        product: "core",
      });
    }
  }

  if (wants(["events", "all"])) {
    const alerts = await dakinisQueryAll(
      `SELECT id, title, severity, condition_text
       FROM tenant_supply_alerts
       WHERE business_id = ?
         AND (lower(title) LIKE ? OR lower(condition_text) LIKE ?)
       LIMIT 6`,
      [businessId, like, like]
    ).catch(() => []);
    for (const row of alerts) {
      hits.push({
        scope: "events",
        id: row.id,
        title: row.title,
        snippet: `${row.severity || "info"} · ${row.condition_text || ""}`.slice(0, 120),
        score: 0.8,
        path: "/app/dashboard",
        product: "core",
      });
    }
  }

  if (wants(["knowledge", "documents", "ai", "all"])) {
    const knowledgeHits = await dakinisKnowledgeSearch(q, scope === "ai" ? "ai" : "knowledge");
    hits.push(...knowledgeHits);
  }

  if (scope === "all" && needle.length >= 3) {
    const ecosystem = [
      { match: ["stream", "twitch", "directo", "obs", "campaña"], title: "StreamAutomator", path: "/hub", product: "streamautomator", scope: "streams" },
      { match: ["akoenet", "discord", "servidor", "comunidad"], title: "AkoeNet", path: "/hub", product: "akoenet", scope: "chats" },
      { match: ["lifeflow", "finanzas", "coach"], title: "LifeFlow", path: "/hub", product: "lifeflow", scope: "global" },
    ];
    for (const item of ecosystem) {
      if (item.match.some((m) => needle.includes(m))) {
        hits.push({
          scope: item.scope,
          id: `product:${item.product}`,
          title: `Abrir ${item.title}`,
          snippet: "Producto del ecosistema Dakinis",
          score: 0.75,
          path: item.path,
          product: item.product,
        });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return { hits: hits.slice(0, 25), total: hits.length, mode: "local_federation" };
}

/**
 * @param {string} q
 * @param {string} scope
 * @param {string} [tenantId]
 */
export async function dakinisRemoteSearch(q, scope, tenantId) {
  if (!dakinisSearchConfigured()) return { hits: [], mode: "remote_off" };
  const result = await dakinisSearchQuery(q, scope, tenantId);
  if (!result.ok) return { hits: [], mode: "remote_error" };
  const payload = result.data || {};
  const hits = (payload.hits || []).map((hit) => ({
    ...hit,
    path: hit.path || hit.metadata?.path,
    product: hit.product || hit.metadata?.product,
  }));
  return { hits, mode: payload.mode || "remote", total: payload.total ?? hits.length };
}

/**
 * @param {object[]} lists
 */
export function dakinisMergeSearchHits(...lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const hit of list || []) {
      const key = `${hit.scope}:${hit.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }
  }
  merged.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return merged.slice(0, 25);
}
