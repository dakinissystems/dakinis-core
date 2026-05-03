/** Textos por defecto (español). */
export default {
  nav: {
    packages: "Paquetes",
    login: "Login",
    quote: "Solicitar presupuesto",
    platformPanel: "Panel plataforma",
    myBusiness: "Mi negocio",
    panelMockup: "Vista mockup",
    platformAdmin: "Administrador plataforma",
    logout: "Salir",
    language: "Idioma",
    corporateSite: "Dakinis Systems — sitio corporativo",
    homeApp: "Ir al inicio de la aplicación"
  },
  footer: {
    navAria: "Enlaces pie de página",
    copyright:
      "© {year} Dakinis Systems (trading name of Christian Villar). All rights reserved.",
    faq: "FAQ",
    privacy: "Privacidad",
    terms: "Términos",
    legalNotice: "Aviso legal",
    packages: "Paquetes",
    contact: "Contacto",
    access: "Acceso"
  },
  home: {
    hero: {
      kicker: "FASE 2 - SaaS multi-tenant (SQLite MVP)",
      h1Line1: "Menos cancelaciones.",
      h1Line2: "Más clientes.",
      h1Line3: "Más control.",
      benefit:
        "Te ahorra tiempo, organiza tu negocio y evita errores en citas, pedidos y seguimiento — sin líos de spreadsheets.",
      demoLead:
        "Demo técnica: cada negocio con su entorno aislado y login; lista para crecer contigo.",
      ctaQuote: "Solicitar presupuesto",
      ctaTalk: "Hablar sobre tu proyecto",
      loginAdmin: "Login admin",
      viewDemos: "Ver sistemas demo",
      stack: "Stack: React + Node + SQLite (listo para PostgreSQL).",
      cardLi1Prefix: "Datos por ",
      cardLi1Suffix: " en API",
      cardLi2: "Mockups sincronizados con base de datos",
      cardLi3: "JWT + API key maestra solo desarrollo"
    },
    modules: {
      title: "Tenants demo por tipo de negocio",
      lead:
        "Slugs seed: clinica-demo, peluqueria-demo, inmobiliaria-demo, restaurante-demo. API key desarrollo:",
      adminCta: "Administración plataforma (negocios y usuarios)",
      mockTitle: "Vista previa del panel (mockup)",
      mockLead: "Maquetación estática de cómo podría verse el programa por tipo de negocio.",
      vistaPrefix: "Vista ·",
      sessionNote: "Sesión: solo ves tu tipo de negocio (",
      sessionNoteEnd: ")."
    },
    pricing: {
      kicker: "Precios y siguiente paso",
      maintenanceHeading: "Mantenimiento mensual",
      contactTitle: "Hablemos",
      contactLead:
        "Cuéntanos tu idea y te diremos cómo desarrollarla, cuánto costaría y cuánto tiempo llevaría.",
      emailCta: "Escribir por email",
      whatsappCta: "WhatsApp"
    },
    demo: {
      title: "Dakinis One — demo técnica",
      lead: "Explora tenants demo, mockups y login JWT. Listo para Postgres y Stripe en siguiente fase.",
      enterAdmin: "Entrar como admin",
      viewSystems: "Ver sistemas"
    },
    demoTenant: {
      ribbonTitle: "Estás en una cuenta demo",
      ribbonLead:
        "Usa el mockup para ver el panel tipo app y el bloque inferior para datos guardados por tenant. Contraseña: demo123.",
      toPanel: "Ir a mi panel funcional",
      toMockup: "Abrir mockup interactivo",
      benefitIntro: "Ventajas de probar tu vertical:"
    }
  },
  systemDemo: {
    badge: "Cuenta demo (seed)",
    accountLine: "Sesión: {email}",
    passwordLabel: "Contraseña de esta demo",
    benefitsTitle: "Qué puedes explorar en esta vertical",
    mockupPrimary: "Ver mockup del panel — {label}",
    toHome: "Volver al inicio",
    functionalHint:
      "Más abajo: formularios y listados con persistencia real por tenant (SQLite). El mockup es solo maquetación interactiva.",
    verticals: {
      clinica: {
        headline: "Clínica demo: agenda y pacientes sin líos",
        lead: "Este entorno aísla tus datos de otros negocios. Combina el mockup visual con el flujo funcional de abajo.",
        benefits: [
          "Mockup: navega por el panel como si fuera la app final (sin API).",
          "Panel funcional: registros que se guardan en base de datos por tenant.",
          "Automatizaciones de ejemplo para recordatorios y seguimiento comercial."
        ]
      },
      peluqueria: {
        headline: "Peluquería demo: agenda por estilista y reservas",
        lead: "Prueba cómo se organizan turnos y proveedores en un solo lugar.",
        benefits: [
          "Mockup: vista previa del salón con secciones típicas.",
          "Datos demo persistidos para citas y stock orientativo.",
          "Enlaces rápidos a reservas y fidelización en el contenido de la página."
        ]
      },
      restaurante: {
        headline: "Restaurante demo: sala y operación diaria",
        lead: "Ideal para ver cómo encajan comandas, turnos y alertas en el mismo panel.",
        benefits: [
          "Mockup: maquetación de sala y back-of-house.",
          "Formularios con persistencia para simular carga operativa.",
          "KPIs y textos orientados a ticket medio y ocupación."
        ]
      },
      inmobiliaria: {
        headline: "Inmobiliaria demo: visitas y embudo comercial",
        lead: "Une leads, visitas y proveedores en una demo coherente con tu tipo de negocio.",
        benefits: [
          "Mockup: embudo y tablero visual para presentar a equipo comercial.",
          "Registros por tenant para leads y seguimiento.",
          "Proveedores y alertas como en operación real."
        ]
      }
    }
  },
  pricing: {
    intro: {
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
    },
    deliveryLabel: "Entrega:",
    pack: {
      mvp: {
        badge: "Pack 1",
        name: "MVP rápido",
        audience: "Para clientes pequeños — tu entrada",
        delivery: "5 – 10 días",
        pitch: "Te dejo un sistema funcional en menos de 10 días para empezar a trabajar.",
        includes: [
          "Login básico",
          "Panel funcional",
          "1 módulo (agenda / clientes / pedidos)",
          "Deploy incluido"
        ]
      },
      pro: {
        badge: "Pack 2",
        name: "Sistema profesional",
        audience: "Tu producto principal",
        delivery: "2 – 4 semanas",
        pitch: "Te construyo un sistema completo adaptado a tu negocio.",
        includes: [
          "Todo lo del MVP +",
          "2 – 3 módulos (agenda + CRM + automatización)",
          "Roles de usuario",
          "Mejoras UX",
          "Base escalable"
        ]
      },
      advanced: {
        badge: "Pack 3",
        name: "Solución a medida avanzada",
        audience: "Solo si tu caso lo pide",
        delivery: "Según alcance (lo cerramos en propuesta)",
        pitch: "Integraciones, reglas de negocio y automatización cuando el estándar no basta.",
        includes: [
          "Integraciones (WhatsApp, APIs externas)",
          "Automatizaciones complejas",
          "Lógica específica de tu operativa"
        ]
      }
    },
    maintenancePitch:
      "Después del desarrollo puedes mantenerlo y mejorarlo poco a poco — sin sorpresas.",
    maintenance: {
      basic: {
        name: "Soporte básico",
        description: "Incidencias, pequeños ajustes y que el sistema siga vivo en producción."
      },
      plus: {
        name: "Soporte + mejoras",
        description:
          "Prioridad en soporte y hueco mensual para mejoras pequeñas encaminadas."
      }
    }
  },
  login: {
    kicker: "Acceso SaaS multi-tenant",
    title: "Iniciar sesión",
    demoPassword: "Contraseña demo para todos los tenants:",
    tenants: {
      clinic: "Clínica estética",
      barber: "Peluquería premium",
      restaurant: "Restaurante premium",
      estate: "Inmobiliaria"
    },
    platformAdmin:
      "Plataforma — si el servidor define DAKINIS_PLATFORM_TOTP_SECRET, hace falta código TOTP además de la contraseña.",
    email: "Email",
    password: "Contraseña",
    totpLabel: "Código TOTP (administrador plataforma)",
    totpPlaceholder: "6 dígitos",
    submitting: "Entrando...",
    submit: "Entrar",
    back: "Volver",
    errors: {
      totpRequired: "Introduce el código de 6 dígitos de tu aplicación autenticadora.",
      noData:
        "Login: respuesta sin datos. Comprueba la URL de la API (VITE_API_BASE_URL) y que el seed exista en la base de datos.",
      incomplete: "Login incompleto: falta token o tipo de negocio en la respuesta.",
      generic: "Error de login"
    }
  },
  legal: {
    back: "← Inicio",
    faq: {
      title: "FAQ",
      body:
        "Preguntas frecuentes sobre Dakinis One. Este contenido se ampliará; si necesitas ayuda concreta, usa la sección de contacto en la página principal."
    },
    privacy: {
      title: "Privacidad",
      body:
        "Información sobre el tratamiento de datos personales en el uso de esta aplicación. Texto legal completo en preparación; para ejercer derechos ARCO o consultas de privacidad, contacta a través de los canales indicados en el sitio corporativo de Dakinis Systems."
    },
    terms: {
      title: "Términos",
      body:
        "Términos y condiciones de uso del servicio. Borrador; el uso de la demo y entornos de prueba queda sujeto a lo acordado por escrito en cada proyecto."
    },
    notice: {
      title: "Aviso legal",
      body:
        "Aviso legal e información del titular del sitio y del servicio. Dakinis Systems (nombre comercial de Christian Villar). Detalle de datos registrales y normativa aplicable: en actualización."
    }
  },
  doc: {
    default: "Dakinis One | Scheduler + CRM + WhatsApp",
    login: "Iniciar sesión · Dakinis One",
    admin: "Administración plataforma · Dakinis One",
    faq: "FAQ · Dakinis One",
    privacy: "Privacidad · Dakinis One",
    terms: "Términos · Dakinis One",
    legal: "Aviso legal · Dakinis One",
    vista: "Vista previa · {label} · Dakinis One",
    sistema: "{label} · Dakinis One"
  },
  vistaMockup: {
    kicker: "Vista previa · solo maquetación",
    title: "Panel tipo app — {label}",
    lead:
      "Ejemplo visual de cómo podría verse el programa en este tipo de negocio; no persiste datos ni llama a la API.",
    home: "Inicio",
    platformAdmin: "Administración plataforma",
    goDemoSystem: "Ir al sistema demo",
    myFunctionalPanel: "Mi panel funcional"
  }
};
