/**
 * Títulos de bloque en español para la sección "Integración técnica" (más claros que solo el nombre del módulo).
 * Los valores internos siguen siendo `modules.agenda`, `modules.booking`, etc.
 */
export function dakinisBuildModuleFunctionMap(modules) {
  return {
    Agenda: Object.keys(modules.agenda),
    "Reservas online": Object.keys(modules.booking),
    "CRM clientes": Object.keys(modules.crm),
    "WhatsApp y avisos": Object.keys(modules.whatsapp),
    "Embudo de leads": Object.keys(modules.leads),
    Dashboard: Object.keys(modules.dashboard)
  };
}
