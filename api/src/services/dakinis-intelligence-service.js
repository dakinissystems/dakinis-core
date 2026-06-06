import { dakinisRunIndustryAiHeuristics } from "@dakinis/shared/catalog/industry-ai-playbooks.js";
import { dakinisSearchKnowledgeChunks } from "./bos-store.js";
import { dakinisLogAiUsage } from "./bos-store.js";
import { dakinisDeriveIntelligenceActions } from "./intelligence-agents.js";
import { dakinisEmitFeatureEvent } from "./telemetry-store.js";

const DAKINIS_OPENAI_MODEL = process.env.DAKINIS_OPENAI_MODEL || "gpt-4o-mini";

export function dakinisIntelligenceIsLlmEnabled() {
  return Boolean(String(process.env.OPENAI_API_KEY || "").trim());
}

function dakinisBuildContextBlock(business, signals, kbSnippets = []) {
  return [
    `Negocio: ${business.name} (${business.type}, plan ${business.plan})`,
    `Contactos CRM: ${signals.crmContacts ?? 0}`,
    `Actividades 7d: ${signals.activities7d ?? 0}`,
    `Reservas/registros 7d: ${signals.reservations7d ?? 0}`,
    `Alertas stock: ${signals.stockAlerts ?? 0}`,
    `Mensajes WhatsApp 7d: ${signals.whatsappMessages7d ?? 0}`,
    kbSnippets.length
      ? `Documentos (RAG):\n${kbSnippets.map((d) => `- [${d.title}] ${d.excerpt}`).join("\n")}`
      : ""
  ]
    .filter(Boolean)
    .join("\n");
}

async function dakinisCallOpenAi(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DAKINIS_OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
  }
  const json = await res.json();
  const answer = json.choices?.[0]?.message?.content?.trim() || "";
  const usage = json.usage || {};
  return {
    answer,
    tokensIn: usage.prompt_tokens || 0,
    tokensOut: usage.completion_tokens || 0
  };
}

/**
 * @param {{ id, name, type, plan }} business
 * @param {Record<string, unknown>} signals
 * @param {{ question?: string, withActions?: boolean }} [opts]
 */
function dakinisEmitIntelligenceQuestionEvent(businessId, opts, mode) {
  const eventKey = opts.telemetrySource === "copilot" ? "copilot.question" : "intelligence.question";
  dakinisEmitFeatureEvent(businessId, opts.userId || null, eventKey, { mode });
}

export async function dakinisIntelligenceAsk(business, signals, opts = {}) {
  const question = String(opts.question || "").trim();
  const heuristics = dakinisRunIndustryAiHeuristics(business, signals);

  let kbSnippets = [];
  if (question) {
    kbSnippets = await dakinisSearchKnowledgeChunks(business.id, question, 5);
  }

  let actions = [];
  if (opts.withActions !== false && question) {
    actions = await dakinisDeriveIntelligenceActions(business, question, signals);
  }

  if (!dakinisIntelligenceIsLlmEnabled()) {
    const match = heuristics.find((h) =>
      question ? question.toLowerCase().includes(h.question.slice(0, 12).toLowerCase()) : false
    );
    const kbHit = kbSnippets[0];
    const answer =
      match?.answer ||
      (kbHit ? `${kbHit.excerpt}` : null) ||
      heuristics[0]?.answer ||
      "Sin datos suficientes.";
    await dakinisLogAiUsage(business.id, { mode: "heuristic", question });
    if (question) dakinisEmitIntelligenceQuestionEvent(business.id, opts, "heuristic");
    return {
      mode: "heuristic",
      question: question || null,
      answer,
      suggestions: heuristics,
      actions,
      knowledgeUsed: kbSnippets.map((d) => d.docId)
    };
  }

  const systemPrompt =
    "Eres Dakinis Copilot, analista BOS para pymes. Responde en español, breve y accionable. Cita documentos internos si aplican. Si propones una acción, indícala claramente.";
  const context = dakinisBuildContextBlock(business, signals, kbSnippets);
  const userPrompt = question
    ? `${context}\n\nPregunta: ${question}`
    : `${context}\n\nGenera 3 recomendaciones accionables para hoy.`;

  try {
    const { answer, tokensIn, tokensOut } = await dakinisCallOpenAi(systemPrompt, userPrompt);
    await dakinisLogAiUsage(business.id, {
      mode: "llm",
      question,
      tokensIn,
      tokensOut
    });
    if (question) dakinisEmitIntelligenceQuestionEvent(business.id, opts, "llm");
    return {
      mode: "llm",
      model: DAKINIS_OPENAI_MODEL,
      question: question || null,
      answer,
      suggestions: heuristics,
      actions,
      knowledgeUsed: kbSnippets.map((d) => d.docId),
      usage: { tokensIn, tokensOut }
    };
  } catch (err) {
    await dakinisLogAiUsage(business.id, { mode: "heuristic_fallback", question });
    if (question) dakinisEmitIntelligenceQuestionEvent(business.id, opts, "heuristic_fallback");
    return {
      mode: "heuristic_fallback",
      error: err instanceof Error ? err.message : "LLM error",
      question: question || null,
      answer: heuristics[0]?.answer || "No se pudo consultar el modelo.",
      suggestions: heuristics,
      actions,
      knowledgeUsed: []
    };
  }
}

export async function dakinisIntelligenceAskWithAgents(business, signals, opts = {}) {
  return dakinisIntelligenceAsk(business, signals, { ...opts, withActions: true });
}
