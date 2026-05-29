import { legalCoreEs } from "./legal-core.js";

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
  legal: legalCoreEs,
  doc: {
    default: "Dakinis One | Scheduler + CRM + WhatsApp",
    login: "Iniciar sesión · Dakinis One",
    admin: "Administración plataforma · Dakinis One",
    faq: "FAQ · Dakinis One",
    privacy: "Privacidad · Dakinis One",
    terms: "Términos · Dakinis One",
    legal: "Aviso legal · Dakinis One",
    vista: "Vista previa · {label} · Dakinis One",
    sistema: "{label} · Dakinis One",
    app: "Dakinis App",
    allergies: "Cartel de alergias · Dakinis One"
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
  },
  appNav: {
    aria: "Navegación de la app",
    app: "App",
    crm: "CRM",
    messages: "Mensajes",
    settings: "Ajustes"
  },
  allergens: {
    panelTitle: "Alérgenos e intolerancias (carta / cocina)",
    panelLead:
      "Lista de referencia (14 alérgenos UE + extras). Marca Sí si el alérgeno está presente en vuestro menú o cocina; el cartel QR solo muestra los marcados.",
    summary: "marcados como presentes · {euCount} obligatorios UE",
    presentYes: "Sí hay",
    presentNo: "No hay",
    notesPlaceholder: "Dónde aparece (ej. harina, tapas, salsa…)",
    customSummary: "Otros / personalizados",
    customPresent: "Presente",
    customName: "Nombre",
    customNotes: "Notas",
    remove: "Quitar",
    addCustom: "Añadir otro",
    save: "Guardar y actualizar QR",
    loginToEdit: "Inicia sesión como admin del restaurante para editar el checklist.",
    qrAlt: "QR alergias",
    publicViewHint: "Vista pública (tabla): solo alérgenos «Sí hay». También:",
    saveOnceForQr: "Guarda el cartel una vez para generar el enlace y el QR.",
    saveError: "No se guardaron alergias",
    publicTitle: "Información de alergias",
    publicKicker: "Cartel digital",
    publicLead:
      "Alérgenos e ingredientes presentes en nuestra carta o cocina. Consulta con el personal antes de pedir.",
    updated: "Actualizado:",
    declared: "alérgeno declarado en carta",
    declaredPlural: "alérgenos declarados en carta",
    emptyDeclared:
      "Este establecimiento no ha declarado alérgenos presentes en carta. Pregunta al personal.",
    dishCountOne: "plato en carta",
    dishCountMany: "platos en carta",
    dishTapHint: "— pulsa un plato para ver sus alérgenos",
    dishCategoryOther: "Plato",
    dishAllergenCount: "{count} alérgenos",
    dishNoAllergensShort: "Sin alérgenos declarados",
    modalAllergens: "Alérgenos en este plato",
    modalClose: "Cerrar",
    catalogSummaryToggle: "Ver resumen por tipo de alérgeno (UE)",
    editTitle: "Editar cartel (admin)",
    editLead: "Marca los alérgenos presentes y pulsa guardar; el QR y esta página se actualizan al instante.",
    qrUrl: "URL del QR:",
    ownerPrompt: "¿Eres el restaurante?",
    ownerLogin: "Inicia sesión",
    ownerEditHint: "para editar el cartel.",
    footerRef:
      "Referencia: 14 alérgenos obligatorios (UE). Solo se listan los marcados como presentes por el restaurante.",
    loading: "Cargando…",
    loadingEditor: "Cargando editor…",
    retry: "Reintentar",
    tryDemo: "Probar demo (restaurante-demo)",
    signIn: "Iniciar sesión",
    kitchenStock: "Cocina / stock",
    scannedLink: "Enlace escaneado: /alergenos/{token}",
    errorHint:
      "El QR debe apuntar al enlace que aparece en Cocina / stock tras guardar el cartel. Si la API en Railway no está actualizada, redeploy de Core Back y Core Front.",
    loadError: "Error al cargar",
    editorLoadError: "No se pudo cargar el editor",
    notFound: "Cartel de alergias no encontrado"
  },
  kitchen: {
    loading: "Cargando stock y recetas…",
    title: "Stock, recetas y producción",
    lead:
      "Recetas (Manu): Pizza — 1 prepizza con 1 kg harina, 600 ml agua, 25 g sal, 10 g levadura. Empanadas — 3 docenas con 1 kg cebolla, ½ kg morrón, 1 kg carne, 36 tapas, 4 huevos, ¼ frasco aceitunas. Pedido ejemplo → ~4 prepizzas y ~3 docenas.",
    inventory: "Inventario actual",
    ingredient: "Insumo",
    stock: "Stock",
    minimum: "Mínimo",
    demoPurchase: "Cargar pedido",
    recipes: "Recetas y producción",
    maxBatches: "Máximo (solo esta receta): {count} tandas",
    batches: "Tandas",
    simulate: "Simular consumo",
    registerProduction: "Registrar producción",
    planOk: "Plan viable:",
    shortage: "Falta {item}: necesitas {needed}, hay {available}",
    lastProductions: "Últimas producciones",
    loadError: "No se pudo cargar cocina/stock",
    simulateError: "Error al simular",
    purchaseError: "Error al registrar compra",
    productionError: "Stock insuficiente o error al producir"
  },
  system: {
    tenant: "Tenant: {slug}",
    resultsTitle: "Resultados que buscas en {label}",
    home: "Inicio",
    backToSystems: "Volver a sistemas",
    openRealApp: "Abrir app real (/api/v1)",
    mockupPreview: "Vista previa del panel (mockup)",
    sessionLocked:
      "Sesión activa: no puedes cambiar de vertical; solo el panel de tu negocio ({label}).",
    adaptedLead:
      "Esta vista muestra cómo trabaja Dakinis adaptado a {label}: agendas, datos de clientes y avisos, sin exponer aspectos internos para visitantes que exploran la demo.",
    dailyOps: "Operación diaria del negocio",
    automations: "Automatizaciones activas",
    quickActions: "Acciones rápidas",
    suppliers: "Proveedores o aliados",
    products: "Productos o servicios por proveedor",
    colName: "Nombre",
    colContact: "Contacto",
    colScope: "Ámbito",
    colSupplier: "Proveedor",
    colItem: "Ítem",
    colRef: "Ref.",
    colNotes: "Notas",
    dataLoad: "Carga de datos (persistencia por tenant)",
    recordsError: "API registros: {error}. Mostrando local o datos mixtos.",
    recordsSynced: "Últimos datos guardados en tu espacio demo y listos para usar en pantalla.",
    saveEntity: "Guardar {entity}",
    listing: "Listado desde base de datos",
    noRecords: "Sin registros aún para este tenant.",
    includes: "Tu sistema incluye",
    includesLead:
      "Piezas funcionales disponibles para tu tipo de negocio; el detalle técnico y la parametrización quedan bajo tu control en la implementación.",
    ctaPanel: "Un panel por cliente, datos aislados.",
    recordsLoadError: "No se cargaron registros",
    saveLocalFallback: "Guardado solo en local hasta que la API esté disponible"
  },
  admin: {
    restricted: "Acceso restringido a administradores de plataforma.",
    goLogin: "Ir al login",
    kicker: "Plataforma",
    title: "Administración multi-tenant",
    lead:
      "Acceso con cuenta de administrador de plataforma y contraseña configurada en el servidor (seed demo habitual: demo123). Si el servidor define DAKINIS_PLATFORM_TOTP_SECRET, usa también el código TOTP en el login. Esta vista está en /admin o desde Panel plataforma en la barra.",
    backHome: "Volver al inicio",
    mockupsTitle: "Vistas mockup por vertical",
    mockupsLead:
      "Maquetas interactivas del panel por tipo de negocio (solo presentación; no persisten datos). Útiles para revisar UX junto a los tenants demo.",
    vistaButton: "Vista · {label}",
    other: "Otro",
    loadError: "Error al cargar datos",
    createError: "No se pudo crear el negocio",
    saveError: "No se pudo guardar",
    typeCustomRequired:
      "Indica un identificador para el tipo nuevo (solo letras, números y guiones; ej. gimnasio-centro).",
    typeCustomEditRequired: "Indica un identificador para el tipo personalizado."
  },
  app: {
    loginRequired: "Debes iniciar sesión para usar el flujo real con JWT.",
    goLogin: "Ir a login",
    apiError: "Error llamando API",
    dashboard: {
      title: "Dashboard privado",
      kicker: "JWT tenant: {slug}",
      heading: "Dashboard API v1",
      lead: "Pruebas rápidas de appointments y whatsapp usando Authorization Bearer.",
      appointments: "Appointments",
      slots: "Slots",
      canSchedule: "Can schedule",
      link: "Link",
      whatsapp: "WhatsApp",
      rules: "Listar reglas"
    },
    crm: {
      title: "CRM",
      heading: "CRM v1",
      loginLead: "Inicia sesión para usar el tenant real por JWT.",
      client: "Cliente",
      segment: "Segmentar",
      timeline: "Timeline",
      error: "Error CRM"
    },
    messages: {
      title: "Mensajes",
      heading: "Messages v1",
      loginLead: "Inicia sesión para usar endpoints privados del tenant.",
      confirmation: "Confirmación",
      reminder: "Recordatorio",
      reactivation: "Reactivación",
      error: "Error messages"
    },
    settings: {
      title: "Ajustes",
      lead: "Sesión activa y contexto de tenant real.",
      user: "Usuario:",
      role: "Rol:",
      tenant: "Tenant:",
      type: "Tipo:",
      restaurantBlock: "Restaurante — alergias y stock",
      restaurantLead: "Edita alergias y el QR en",
      restaurantLink: "Sistema restaurante",
      publicAllergies: "Cartel público:",
      logout: "Cerrar sesión"
    }
  }
};
