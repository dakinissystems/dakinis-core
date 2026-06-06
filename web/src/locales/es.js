import { legalCoreEs } from "./legal-core.js";

/** Textos por defecto (español). */
export default {
  common: {
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    unexpectedError: "Error inesperado",
    unexpectedErrorHint: "Recarga la página. Si persiste, contacta soporte."
  },
  nav: {
    packages: "Paquetes y contacto",
    login: "Iniciar sesión",
    quote: "Solicitar presupuesto",
    hub: "Hub",
    platformPanel: "Panel plataforma",
    myBusiness: "Mi negocio",
    panelMockup: "Vista mockup",
    platformAdmin: "Administrador plataforma",
    logout: "Salir",
    language: "Idioma",
    corporateSite: "Dakinis Systems — sitio corporativo",
    homeApp: "Ir al inicio de Dakinis One",
    byCompany: "by Dakinis Systems"
  },
  productHome: {
    tagline: "Business Operating System para tu negocio.",
    lead: "Planes desde 29 €/mes: CRM, agenda, inventario y WhatsApp con cuotas incluidas y exceso predecible.",
    login: "Iniciar sesión",
    openHub: "Abrir Hub",
    requestDemo: "Solicitar demo",
    corporateSite: "Sitio corporativo",
    whatsappPitch:
      "Comunícate con tus clientes por WhatsApp desde Dakinis One — parte del ecosistema, no un añadido suelto.",
    whatsIncluded: "Módulos del producto",
    modules: ["CRM", "Comunicaciones", "Inventario", "Restaurante", "Reservas", "Facturación (roadmap)"],
    bullet1: "Multi-tenant con datos aislados por negocio",
    bullet2: "Verticales: clínica, restaurante, inmobiliaria, peluquería",
    bullet3: "Entra por el Hub y abre StreamAutomator o AkoeNet cuando los necesites"
  },
  hub: {
    title: "Dakinis Hub",
    lead: "Centro de aplicaciones Dakinis One y marketplace del ecosistema.",
    login: "Iniciar sesión",
    requestDemo: "Solicitar demo",
    sessionHello: "Sesión: {email} · negocio {business}",
    applicationsTitle: "Aplicaciones",
    applicationsLead:
      "Módulos de Dakinis One: CRM, comunicaciones, reservas e inventario. Algunos requieren plan Growth o Pro.",
    marketplaceTitle: "Marketplace",
    marketplaceLead: "Productos conectados con SSO: StreamAutomator, AkoeNet y desarrollo a medida.",
    productsTitle: "Productos del ecosistema",
    oneModulesTitle: "Dakinis One — módulos",
    oneModulesLead: "Accede a la operativa diaria. Algunos módulos requieren plan Growth o Pro.",
    moduleLocked: "No incluido en tu plan o sin sesión",
    requiresPlanUpgrade: "Requiere plan Growth o Pro",
    upgradePlanCta: "Ver planes",
    currentPlan: "Plan actual: {plan}",
    requiresLogin: "Requiere login",
    platformAdmin: "Administración plataforma",
    ssoHint:
      "Sesión activa en Dakinis One. AkoeNet usa SSO vía cuenta Dakinis (IdP) cuando VITE_DAKINIS_AUTH_URL está configurado.",
    ssoPending: "Requiere cuenta Dakinis (IdP)",
    roadmap: "Próximamente",
    dashboard: {
      greeting: {
        morning: "Buenos días, {name}",
        afternoon: "Buenas tardes, {name}",
        evening: "Buenas noches, {name}"
      },
      guestName: "equipo",
      statApplications: "Aplicaciones: {count}",
      statMarketplace: "Marketplace: {count}",
      statTenant: "Tenant: {tenant}",
      tenantUnknown: "—",
      quickActions: "Acciones rápidas",
      actionNewClient: "Nuevo cliente",
      actionNewOrder: "Nuevo pedido",
      actionSendWhatsApp: "Enviar WhatsApp",
      actionOpenInventory: "Abrir inventario"
    }
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
      kicker: "Proyectos a medida",
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
    bos: {
      kicker: "Suscripción BOS",
      title: "Planes mensuales Dakinis One",
      subtitle:
        "El producto principal: operación diaria con precio fijo, cuotas de IA y WhatsApp incluidas y exceso transparente.",
      perMonth: "/mes",
      recommended: "recomendado",
      overageLead:
        "Exceso de consumo: {aiRate} € / 1.000 consultas IA extra (plan Pro) · {waRate} € / 500 mensajes WhatsApp extra.",
      implementationTitle: "Implantación inicial (pago único)",
      implementationLead: "Configuración, migración y puesta en marcha según complejidad del negocio.",
      projectsHint:
        "¿Necesitas desarrollo a medida o integraciones especiales? Consulta los paquetes de proyecto en el sitio corporativo o contáctanos.",
      servicesTitle: "Servicios profesionales",
      servicesLead: "Tarifa orientativa: {hourly} €/h para personalización, integraciones y automatizaciones.",
      bundlesLead: "Paquetes cerrados habituales: {bundles} € según alcance.",
      examples: [
        "Migración de datos",
        "Personalización vertical",
        "Integraciones (WhatsApp, APIs)",
        "Automatizaciones a medida"
      ],
      plans: {
        starter: {
          name: "Starter",
          audience: "Negocios que empiezan con agenda y CRM básico",
          includes: ["CRM básico", "Agenda", "Reservas", "Portal cliente"]
        },
        growth: {
          name: "Growth",
          audience: "Operación completa con inventario y comunicaciones",
          includes: [
            "Inventario",
            "CRM completo",
            "Analytics y benchmark",
            "250 mensajes WhatsApp/mes incluidos"
          ]
        },
        pro: {
          name: "Pro",
          audience: "IA, automatizaciones y ecosistema completo",
          includes: [
            "WhatsApp",
            "IA + Copilot",
            "Automatizaciones",
            "Dakinis Network",
            "2.000 consultas IA/mes incluidas",
            "2.000 mensajes WhatsApp/mes incluidos"
          ]
        }
      }
    },
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
      priceFormat: "{amount} €/mes",
      basic: {
        name: "Soporte básico",
        description: "Incidencias, pequeños ajustes y que el sistema siga vivo en producción."
      },
      plus: {
        name: "Soporte + mejoras",
        description:
          "Prioridad en soporte y hueco mensual para mejoras pequeñas encaminadas."
      }
    },
    implementation: {
      light: { label: "Configuración ligera" },
      standard: { label: "Implantación estándar" },
      advanced: { label: "Implantación avanzada" },
      enterprise: { label: "Proyecto a medida" }
    }
  },
  login: {
    kicker: "Acceso SaaS multi-tenant",
    title: "Iniciar sesión",
    demoPassword: "Contraseña demo para todos los tenants:",
    demoAccounts: "Cuentas demo",
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
      generic: "Error de login",
      idpTenant: "No se pudo resolver el negocio para SSO. Usa login local o configura tenant en el JWT IdP."
    },
    submitIdp: "Entrar con cuenta Dakinis (SSO)",
    idpHint: "El SSO del ecosistema requiere IdP y enlaza AkoeNet sin volver a escribir contraseña allí.",
    forgotPassword: "¿Olvidaste la contraseña?"
  },
  forgotPassword: {
    kicker: "Recuperación de acceso",
    title: "Restablecer contraseña",
    lead: "Introduce tu email y te enviaremos un enlace válido 24 horas.",
    mustChangeLead:
      "Debes confirmar tu negocio y elegir una contraseña nueva. Solicita un enlace al correo de tu cuenta.",
    email: "Email",
    submitting: "Enviando…",
    submit: "Enviar enlace",
    back: "Volver al login",
    success: "Si el email existe, recibirás un enlace en unos minutos.",
    errors: {
      generic: "No se pudo procesar la solicitud"
    }
  },
  resetPassword: {
    kicker: "Nueva contraseña",
    title: "Confirmar acceso",
    lead: "Elige una contraseña nueva (mínimo 8 caracteres).",
    newPassword: "Nueva contraseña",
    confirmPassword: "Repetir contraseña",
    submitting: "Guardando…",
    submit: "Guardar contraseña",
    goLogin: "Ir al login",
    success: "Contraseña actualizada. Ya puedes iniciar sesión.",
    errors: {
      noToken: "Falta el token del enlace. Usa «Olvidé la contraseña» o el correo de bienvenida.",
      short: "La contraseña debe tener al menos 8 caracteres.",
      mismatch: "Las contraseñas no coinciden.",
      generic: "No se pudo restablecer la contraseña"
    }
  },
  ecosystemLaunch: {
    title: "Abriendo producto",
    redirecting: "Redirigiendo con sesión segura…",
    invalidProduct: "Producto no válido.",
    invalidTarget: "URL de destino no configurada."
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
    hub: "Dakinis Hub",
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
    communications: "Comunicaciones",
    whatsapp: "WhatsApp",
    hub: "Hub",
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
    save: "Guardar y actualizar cartel",
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
    dishSearchLabel: "Buscar plato",
    dishSearchPlaceholder: "Buscar comida o plato…",
    dishSearchClear: "Borrar búsqueda",
    dishSearchResults: "de {total} en carta",
    dishSearchNoMatch: "Ningún plato coincide con «{query}». Prueba otro nombre.",
    dishCategoryOther: "Plato",
    dishAllergenCount: "{count} alérgenos",
    dishNoAllergensShort: "Sin alérgenos declarados",
    modalAllergens: "Alérgenos en este plato",
    modalClose: "Cerrar",
    catalogSummaryToggle: "Ver resumen por tipo de alérgeno (UE)",
    mushroomTitle: "Hongos en carta",
    mushroomLead:
      "Marca los tipos de hongo que pueden usarse (p. ej. en noodles). Se actualizan el cartel público y los platos UDON / Pad Thai / Noodles.",
    mushroomEnable: "Activar declaración de hongos",
    mushroomSelected: "{count} tipos seleccionados",
    mushroomNoneSelected: "Ningún hongo seleccionado (no se mostrará en el cartel).",
    modalMushrooms: "Hongos que pueden estar presentes",
    qrUrlStable:
      "El enlace del QR no cambia al guardar; solo se actualiza el contenido del cartel (no hace falta reimprimir el QR).",
    editTitle: "Editar cartel (admin)",
    editLead:
      "Marca los alérgenos presentes y pulsa guardar; el cartel público se actualiza al instante (misma URL del QR).",
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
    leadDumpling:
      "Recetas Dumpling House: Gyozas (8 uds) — harina, pollo/cerdo/verduras, salsa de soja y sésamo. También noodles vegetal y rollitos. «Cargar pedido» repone insumos; plan demo ~4 tandas gyozas pollo, 2 de cerdo y 3 raciones noodles.",
    leadFermina:
      "Fermina Food: bites de bolsa (cheddar/jalapeños ~9 uds por porción de ~50; chicken ~11 de ~120) y choripán. Recetas consumen unidades del inventario.",
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
    productionError: "Stock insuficiente o error al producir",
    scanTitle: "Escanear insumo (QR / barras)",
    scanLead:
      "Lector USB/Bluetooth (modo teclado), cámara del móvil o foto. Al leer, suma o resta stock del insumo.",
    scanWedgeTitle: "Lector de código de barras (USB / pistola)",
    scanWedgeHint:
      "Conecta el lector, pulsa el campo y escanea. La mayoría envía Enter al final. Compatible con EAN-13, EAN-8, UPC-A/E, Code 128, Code 39, etc.",
    scanWedgeInput: "Entrada lector código de barras",
    scanWedgePlaceholder: "Clic aquí y escanea con el lector…",
    scanWedgeFocus: "Activar campo para lector",
    scanOrCamera: "O usa la cámara del dispositivo",
    scanStart: "Iniciar cámara",
    scanStop: "Detener escáner",
    scanFlipCamera: "Cambiar cámara",
    scanCameraRear: "Trasera",
    scanCameraFront: "Frontal",
    scanImage: "Cargar imagen",
    scanPlaceholder: "Vista previa cámara / foto",
    scanCode: "Código leído",
    scanCodePlaceholder: "Escanea un código…",
    scanStabilizing: "Enfocando código… mantén el móvil quieto un instante.",
    scanCodeCol: "Código",
    scanQtyLabel: "Cantidad por escaneo",
    scanDirection: "Movimiento",
    scanIn: "+ Entrada",
    scanOut: "− Salida",
    scanNotFound: "Código no reconocido en este inventario.",
    scanUnknownPrompt: "Código nuevo: completa el formulario para dar de alta el insumo.",
    scanAddProductLead: "Alta de insumo desde escaneo",
    scanProductName: "Nombre del producto / insumo",
    scanProductNamePlaceholder: "Ej. Aceite de oliva 1L",
    scanProductUnit: "Unidad",
    scanAddProduct: "Crear y registrar movimiento",
    scanAddProductCancel: "Cancelar",
    scanProductCreated: "Insumo creado y stock actualizado.",
    scanCreateError: "No se pudo crear el insumo",
    scanQtyInvalid: "Indica una cantidad mayor que cero.",
    scanMatched: "Coincide (demo sin API)",
    scanOk: "{name} — stock actual: {qty}",
    scanError: "Error al registrar escaneo",
    scanCameraError: "No se pudo acceder a la cámara",
    scanImageFail: "No se detectó código en la imagen.",
    scanCodesHint: "Cada insumo tiene un código estable (columna Código). Puedes imprimir QR con ese valor."
  },
  fermina: {
    subtitle: "Comida argentina · comandas e impresión",
    title: "Comandas y facturación",
    leadGeneric: "Módulo de comandas para restaurantes con menú en config.",
    newOrder: "Nueva comanda",
    customer: "Cliente",
    table: "Mesa / zona",
    channel: "Canal",
    channelSalon: "Salón",
    channelTakeaway: "Para llevar",
    channelDelivery: "Delivery propio",
    channelGlovo: "Glovo",
    channelUber: "Uber Eats",
    paymentMethod: "Forma de cobro",
    paymentCash: "Efectivo",
    paymentCard: "Tarjeta",
    orderNotes: "Notas cocina",
    sendKitchen: "Enviar a cocina",
    invoiceCart: "Facturar carrito",
    activeOrders: "Comandas activas",
    noOrders: "Sin comandas aún.",
    print: "Imprimir",
    invoice: "Factura",
    invoicesTitle: "Facturas",
    invoiceType: "Tipo de factura",
    invoiceClient: "Cliente (ticket)",
    invoiceManager: "Gestor / contabilidad",
    taxId: "CUIT / DNI",
    noInvoices: "Sin facturas emitidas.",
    colNumber: "Número",
    colType: "Tipo",
    colTotal: "Total",
    colItem: "Plato",
    colQty: "Cant.",
    colPrice: "Importe",
    printNow: "Imprimir ahora",
    closePrint: "Cerrar vista impresión",
    printComanda: "Comanda #{n}",
    printFactura: "Factura {n}",
    printBusiness: "Negocio",
    printOrderRef: "Comanda",
    printOrderTime: "Hora del pedido",
    portionHint: "{qty} uds/porción (bolsa ~{pack})",
    loadError: "No se pudo cargar comandas",
    orderError: "Error al crear comanda",
    statusError: "Error al actualizar estado",
    invoiceError: "Error al crear factura",
    dayCloseTitle: "Cierre del día (control)",
    dayCloseLead: "Totales de comandas en estado entregada — para cuadrar caja y plataformas al cerrar.",
    dayCloseDelivered: "{count} entregadas",
    dayCloseByPayment: "Por forma de cobro",
    dayCloseByChannel: "Por canal (Glovo / Uber / salón…)",
    dayCloseOrdersCol: "Pedidos",
    dayCloseCashTotal: "Caja (entregadas)",
    dayCloseEmpty: "Marca comandas como entregada para verlas en el cierre.",
    colChannel: "Canal",
    colPayment: "Cobro",
    noOpenOrders: "No hay comandas abiertas.",
    cartSummary: "{total} € · {channel} · {payment}",
    flowLead:
      "Flujo en pasos: tarifa (canal) → pedido → cobro. Operación y cierre en pestañas aparte.",
    viewMesas: "Mesas",
    viewTarifa: "Tarifa",
    viewCobro: "Cobro",
    viewActivas: "Activas",
    viewCierre: "Cierre día",
    viewFacturas: "Facturas",
    tarifaTitle: "Canal y tarifa",
    tarifaLead: "Elige dónde se vende el pedido. Los precios del menú se aplican según la carta configurada.",
    tarifaLocalGroup: "En restaurante / para llevar",
    tarifaAppGroup: "Apps (Glovo / Uber)",
    tarifaContinue: "Continuar al pedido →",
    pedidoTitle: "Armar pedido",
    pedidoTariff: "Tarifa: {channel}",
    pedidoChangeTariff: "Cambiar",
    pedidoBackTarifa: "← Tarifa",
    pedidoGoCobro: "Ir a cobro →",
    pedidoClear: "Vaciar",
    pedidoUnits: "· {count} unidades",
    cobroTitle: "Cobro",
    cobroEmpty: "Primero arma el pedido en la pestaña Pedido.",
    cobroQuestion: "¿Cómo cobra el cliente?",
    cobroBackPedido: "← Pedido",
    cobroTotal: "Total: {total} €",
    newOrderBtn: "+ Nuevo pedido"
  },
  restaurant: {
    roleNav: "Vista del restaurante",
    roleWaiter: "Camareros",
    roleKitchen: "Cocina",
    roleAdmin: "Administración",
    waiterLead: "Plano de mesas, pedidos y cobro en sala. Arrastra mesas para reorganizar el salón.",
    kitchenLead: "Solo comandas pendientes: marcar estado y reimprimir ticket.",
    adminComandasLead: "Cierre de caja y facturas emitidas.",
    adminTitle: "Administración del restaurante",
    adminLead: "Proveedores, precios de carta, stock y diseño del plano de mesas.",
    adminFloorTitle: "Plano de mesas (diseño)",
    adminFloorLead: "Añade o quita mesas y colócalas en el salón. Los camareros ven el mismo plano al tomar pedidos.",
    adminPricesTitle: "Precios de carta",
    adminPricesEmpty: "Sin platos en la configuración del negocio.",
    adminPricesSave: "Guardar precios",
    priceEur: "Precio (€)",
    saving: "Guardando…",
    floorSaveError: "No se guardó el plano de mesas",
    menuSaveError: "No se guardaron los precios",
    floorPlan: "Plano de mesas",
    floorAdd: "Añadir mesa",
    floorRemove: "Quitar mesa seleccionada",
    floorDragHint:
      "Mantén pulsado y arrastra cada mesa; al soltar se guarda la posición (como en la tienda StreamAutomator).",
    floorDragTitle: "Arrastrar para mover",
    floorDragLegend: "Arrastrable",
    floorFree: "Libre",
    floorBusy: "Con cuenta",
    floorSelected: "Seleccionada",
    zoneSalon: "Salón",
    zoneTerraza: "Terraza",
    zoneBarra: "Barra",
    mesasTitle: "Mesas en sala",
    mesasLead: "Toca una mesa en el plano, añade platos y envía a cocina o cierra con cobro.",
    mesasOccupied: "{count} mesas con cuenta",
    mesaSelectHint: "Selecciona una mesa en el plano.",
    mesaNotesPlaceholder: "Ej. sin picante",
    mesaCloseLabel: "Cerrar mesa:",
    mesaClear: "Vaciar mesa",
    kitchenQueue: "Cola de cocina"
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
    typeCustomEditRequired: "Indica un identificador para el tipo personalizado.",
    ownerHint:
      "Opcional: primer propietario del negocio. Si solo indicas email, se genera contraseña temporal y se envía por correo con enlace de confirmación.",
    ownerEmail: "Email propietario",
    ownerEmailPlaceholder: "vacío si gestionas usuarios después",
    ownerPasswordOptional: "Contraseña temporal (opcional)",
    ownerPasswordPlaceholder: "vacío = generar y enviar por email",
    credentialsEmailed: "Credenciales enviadas a {email}.",
    credentialsManual:
      "Email no enviado (configura RESEND). Email: {email} · Contraseña temporal: {password} · Enlace: {url}",
    usersTitle: "Usuarios",
    userEmail: "Email",
    userRole: "Rol",
    userBusiness: "Negocio",
    userType: "Tipo negocio",
    editEmail: "Editar email",
    saveEmail: "Guardar",
    cancel: "Cancelar",
    resendReset: "Reenviar reset",
    userEmailSaved: "Email actualizado.",
    resetEmailed: "Enlace de restablecimiento enviado a {email}.",
    resetManual: "Email no enviado. Reenvía manualmente a {email}: {url}",
    resetError: "No se pudo reenviar el correo",
    catalog: {
      title: "Catálogo ecosistema (Hub / Landing)",
      lead:
        "Edita productos y módulos del Hub. Se guarda en base de datos y, si el servidor puede escribir en el repo, sincroniza packages/shared-brand.",
      meta: "Fuente: {source} · actualizado: {updatedAt}",
      jsonLabel: "JSON (products + hubModules)",
      loading: "Cargando catálogo…",
      loadError: "No se pudo cargar el catálogo",
      saveError: "No se pudo guardar",
      saved: "Catálogo guardado. Hub y Landing usarán esta versión tras recargar.",
      save: "Guardar catálogo",
      saving: "Guardando…",
      reload: "Recargar desde servidor",
      invalidShape: "El JSON debe incluir un array «products»."
    }
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
      heading: "Contactos y actividades",
      lead: "Núcleo del negocio: el cliente conecta reservas, pedidos, facturación y WhatsApp.",
      leadPersisted:
        "Contactos y actividades guardados por tenant. Los mensajes WhatsApp entrantes crean o enlazan la ficha automáticamente.",
      loginLead: "Inicia sesión para usar el tenant real por JWT.",
      client: "Cliente",
      segment: "Segmentar",
      timeline: "Timeline",
      error: "Error CRM",
      notReady: "CRM no migrado: ejecuta docs/supabase/schemas/04-crm-core.sql o reinicia la API SQLite local.",
      search: "Buscar",
      searchPlaceholder: "Nombre, teléfono o email",
      refresh: "Actualizar",
      loading: "Cargando…",
      noContacts: "Sin contactos. Crea uno o recibe un WhatsApp.",
      newContact: "Nuevo contacto",
      firstName: "Nombre",
      lastName: "Apellidos",
      phone: "Teléfono",
      email: "Email",
      saveContact: "Guardar contacto",
      selectContact: "Selecciona un contacto de la lista.",
      emptyTimeline: "Sin actividades ni mensajes aún.",
      timelineWhatsapp: "WhatsApp",
      activityType: "Tipo de actividad",
      activityNotes: "Notas",
      activityNotesPlaceholder: "Llamada, reunión, seguimiento…",
      addActivity: "Registrar actividad",
      journeyAria: "Recorrido del cliente",
      journeyHint: "Deals y pipeline comercial: próximo sprint.",
      linkReservations: "Reservas y agenda",
      linkWhatsApp: "Comunicaciones",
      linkCommunications: "Comunicaciones",
      activity: {
        note: "Nota",
        call: "Llamada",
        whatsapp: "WhatsApp",
        email: "Email",
        meeting: "Reunión",
        booking: "Reserva",
        order: "Pedido"
      },
      journey: {
        client: "Cliente",
        booking: "Reserva",
        order: "Pedido",
        invoice: "Factura",
        whatsapp: "WhatsApp",
        followUp: "Seguimiento"
      }
    },
    messages: {
      title: "Mensajes",
      heading: "WhatsApp (demo API)",
      loginLead: "Inicia sesión para usar endpoints privados del tenant.",
      confirmation: "Confirmación cita",
      reminder: "Recordatorio",
      reactivation: "Reactivación",
      orderReady: "Pedido listo",
      lowStock: "Stock bajo",
      rulesTitle: "Reglas evento → mensaje",
      rulesLead: "Automatizaciones planificadas (envío real requiere WhatsApp Business API).",
      preview: "Vista previa",
      error: "Error al generar mensaje"
    },
    communications: {
      title: "Comunicaciones",
      kicker: "Dakinis Communications",
      heading: "Conversaciones",
      lead: "Canales, automatizaciones y WhatsApp en un solo lugar. Otros canales llegan en próximas versiones.",
      loginLead: "Inicia sesión para usar comunicaciones con tu tenant.",
      channelsTitle: "Canales",
      channels: {
        whatsapp: "WhatsApp",
        email: "Email",
        telegram: "Telegram",
        discord: "Discord",
        sms: "SMS",
        push: "Push"
      },
      automationsTitle: "Automatizaciones",
      automationsLead: "Reglas conectadas a eventos del negocio (vista previa disponible).",
      automations: {
        lowStock: "Stock bajo",
        bookingCreated: "Reserva creada",
        orderReady: "Pedido listo"
      },
      rulesConfigured: "Reglas configuradas",
      ruleOn: "activa",
      ruleOff: "inactiva",
      whatsappToolsTitle: "WhatsApp",
      whatsappToolsLead: "Plantillas y vistas previa vía API (demo).",
      confirmation: "Confirmación cita",
      reminder: "Recordatorio",
      reactivation: "Reactivación",
      comingSoonTitle: "Próximamente",
      comingSoonItems: ["Inbox omnicanal", "IA contextual", "Plantillas avanzadas"],
      preview: "Vista previa",
      previewResult: "Resultado de vista previa",
      lastPreview: "Última vista previa",
      error: "Error al generar mensaje",
      legalHint: "WhatsApp Business API y herramientas de Meta: ver secciones 10–12 de la",
      legalLink: "política de privacidad"
    },
    whatsapp: {
      title: "WhatsApp",
      kicker: "Hub · WhatsApp",
      heading: "WhatsApp Business",
      lead: "Conversaciones, contactos, plantillas, automatizaciones e IA en un solo módulo.",
      loginLead: "Inicia sesión para conectar tu tenant con WhatsApp Business API.",
      navAria: "Secciones de WhatsApp",
      nav: {
        conversations: "Conversaciones",
        contacts: "Contactos",
        templates: "Plantillas",
        automations: "Automatizaciones",
        ai: "IA"
      },
      conversationsLead: "Mensajes guardados en PostgreSQL vía webhook y envíos desde la API.",
      contactsLead: "Contactos detectados en mensajes entrantes o registrados manualmente.",
      templatesLead: "Vistas previa de textos; el envío real usa plantillas aprobadas en Meta.",
      automationsLead: "Reglas del negocio conectadas a eventos (booking, pedidos, CRM).",
      aiLead: "Fase 5: respuestas asistidas con OpenAI y contexto CRM (próximamente).",
      aiItems: [
        "Borrador de respuesta según historial del hilo",
        "Resumen de conversación para el equipo",
        "Creación de ticket CRM desde mensaje entrante"
      ],
      threadList: "Conversaciones",
      noThreads: "Sin conversaciones aún. Configura el webhook y envía o recibe un mensaje.",
      selectThread: "Selecciona una conversación",
      noContacts: "Sin contactos. Llegarán con el primer mensaje entrante.",
      unnamed: "Sin nombre",
      noRules: "Sin reglas cargadas.",
      autoSendHint: "Envío automático: DAKINIS_WHATSAPP_AUTO_SEND=true en el servidor (requiere phone en el evento).",
      sendPhone: "Teléfono (E.164 sin +)",
      sendMessage: "Mensaje",
      send: "Enviar por WhatsApp",
      sending: "Enviando…",
      sendError: "No se pudo enviar",
      refresh: "Actualizar",
      loading: "Cargando…",
      error: "Error WhatsApp"
    },
    settings: {
      title: "Ajustes",
      lead: "Sesión activa y contexto de tenant real.",
      user: "Usuario:",
      role: "Rol:",
      tenant: "Tenant:",
      type: "Tipo:",
      billingTitle: "Facturación (modelo híbrido BOS)",
      billingPlan: "Plan {plan} · Base {base} €/mes",
      billingAi: "IA: {queries} consultas ({days} días)",
      billingAiIncluded: "incluidas {count}",
      billingAiOverage: "exceso +{amount} €",
      billingWhatsapp: "WhatsApp: {messages} msg (30d)",
      billingWhatsappIncluded: "incluidos {count}",
      billingWhatsappOverage: "exceso +{amount} €",
      billingEstimate: "Próxima factura estimada:",
      billingStripePending: "(Stripe no conectado)",
      restaurantBlock: "Restaurante — alergias y stock",
      restaurantLead: "Edita alergias y el QR en",
      restaurantLink: "Sistema restaurante",
      publicAllergies: "Cartel público:",
      logout: "Cerrar sesión"
    }
  }
};
