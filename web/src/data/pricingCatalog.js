/**
 * Catálogo comercial público: paquetes cerrados (no venta por horas) + mantenimiento.
 */

export const dakinisPricingIntro = {
  title: "Paquetes claros",
  subtitle:
    "No vendemos horas sueltas: eliges un alcance con precio y plazo cerrados. En la llamada te recomiendo un pack concreto dentro de estos rangos — sin “depende” ni “ya veremos”.",
  portfolioNote:
    "Precios reducidos mientras amplío cartera de proyectos reales; misma base probada que acelera entrega.",
  valuePoints: [
    "Ya tengo una base hecha: no empezamos desde cero.",
    "Eso reduce coste, plazo y riesgo para ti.",
    "Solución a tu operativa (tiempo, líos, errores), no un discurso técnico."
  ]
};

export const dakinisPackMvp = {
  key: "mvp",
  badge: "Pack 1",
  name: "MVP rápido",
  audience: "Para clientes pequeños — tu entrada",
  priceRange: "300 € – 600 €",
  delivery: "5 – 10 días",
  pitch: "Te dejo un sistema funcional en menos de 10 días para empezar a trabajar.",
  includes: [
    "Login básico",
    "Panel funcional",
    "1 módulo (agenda / clientes / pedidos)",
    "Deploy incluido"
  ]
};

export const dakinisPackPro = {
  key: "pro",
  badge: "Pack 2",
  name: "Sistema profesional",
  audience: "Tu producto principal",
  priceRange: "800 € – 1.500 €",
  delivery: "2 – 4 semanas",
  pitch: "Te construyo un sistema completo adaptado a tu negocio.",
  includes: [
    "Todo lo del MVP +",
    "2 – 3 módulos (agenda + CRM + automatización)",
    "Roles de usuario",
    "Mejoras UX",
    "Base escalable"
  ],
  featured: true
};

export const dakinisPackAdvanced = {
  key: "advanced",
  badge: "Pack 3",
  name: "Solución a medida avanzada",
  audience: "Solo si tu caso lo pide",
  priceRange: "1.500 € – 3.000 €+",
  delivery: "Según alcance (lo cerramos en propuesta)",
  pitch: "Integraciones, reglas de negocio y automatización cuando el estándar no basta.",
  includes: [
    "Integraciones (WhatsApp, APIs externas)",
    "Automatizaciones complejas",
    "Lógica específica de tu operativa"
  ]
};

export const dakinisMaintenanceTiers = [
  {
    key: "basic",
    name: "Soporte básico",
    price: "20 €/mes",
    description: "Incidencias, pequeños ajustes y que el sistema siga vivo en producción."
  },
  {
    key: "plus",
    name: "Soporte + mejoras",
    price: "50 €/mes",
    description: "Prioridad en soporte y hueco mensual para mejoras pequeñas encaminadas."
  }
];

export const dakinisMaintenancePitch =
  "Después del desarrollo puedes mantenerlo y mejorarlo poco a poco — sin sorpresas.";
