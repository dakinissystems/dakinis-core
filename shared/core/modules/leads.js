import { dakinisAssert } from "../utils.js";

export function dakinisCreateLeadsModule(config) {
  /** Avanza el lead a una etapa del embudo (validada contra `config.leads.stages`). */
  function dakinisUpdateLeadStage(lead, nextStage) {
    const stageIsValid = config.leads.stages.includes(nextStage);
    dakinisAssert(stageIsValid, `Etapa no válida: ${nextStage}`);
    return { ...lead, stage: nextStage, updatedAt: new Date().toISOString() };
  }

  /** Conteo de leads por etapa para el pipeline. */
  function dakinisSummarizePipelineByStage(leads) {
    return config.leads.stages.reduce((acc, stage) => {
      acc[stage] = leads.filter((lead) => lead.stage === stage).length;
      return acc;
    }, {});
  }

  return {
    dakinisUpdateLeadStage,
    dakinisSummarizePipelineByStage
  };
}
