import { dakinisAssert } from "../utils.js";

export function dakinisCreateLeadsModule(config) {
  function dakinisMoveLeadToStage(lead, nextStage) {
    const stageIsValid = config.leads.stages.includes(nextStage);
    dakinisAssert(stageIsValid, `Etapa no válida: ${nextStage}`);
    return { ...lead, stage: nextStage, updatedAt: new Date().toISOString() };
  }

  function dakinisBuildPipelineSummary(leads) {
    return config.leads.stages.reduce((acc, stage) => {
      acc[stage] = leads.filter((lead) => lead.stage === stage).length;
      return acc;
    }, {});
  }

  return {
    dakinisMoveLeadToStage,
    dakinisBuildPipelineSummary
  };
}
