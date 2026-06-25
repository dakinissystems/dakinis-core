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
    packages: "Paquetes",
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
    kicker: "Dakinis One",
    h1: "Deja de gestionar tu negocio con Excel.",
    tagline: "Ventas, clientes e inventario en un solo lugar.",
    lead: "Sin saltar entre hojas de Excel, WhatsApp y papeles. Migramos tus datos y te acompañamos en la implantación.",
    heroOutcomes: ["Ventas", "Clientes", "Inventario", "Citas"],
    calcLink: "Calcular ahorro",
    viewPlans: "Ver planes y paquetes",
    pricingCtaKicker: "Sin sorpresas",
    pricingCtaTitle: "Controla ventas, clientes e inventario sin complicaciones",
    pricingCtaLead:
      "Migramos tus Excel, configuramos el sistema y te acompañamos. Más de 15 años ayudando empresas con tecnología.",
    login: "Iniciar sesión",
    openHub: "Abrir Hub",
    seeAllDemos: "Ver todas las demos",
    requestDemo: "Solicitar demo",
    corporateSite: "Sitio corporativo",
    trustKicker: "¿Por qué Dakinis?",
    trustTitle: "No solo desarrollamos software: entendemos cómo trabajan las empresas",
    trustExperience: "Más de 15 años trabajando junto a empresas, universidades y comercios.",
    trustSubtitle: "Implantación, soporte, migración de datos y formación de usuarios reales.",
    trustStory:
      "Dakinis lo creó alguien que pasó 15 años en soporte IT viendo cómo negocios, universidades y comercios gestionan su día a día con Excel, papel, WhatsApp y sistemas que no se hablan entre sí — no alguien que solo vende licencias desde un despacho.",
    trustBullets: [
      "Sabemos cómo trabajan los usuarios porque llevamos años formándolos y resolviendo sus incidencias",
      "Migramos tus Excel, configuramos el sistema y te acompañamos en la implantación",
      "Formación incluida para que tu equipo lo use desde el primer día"
    ],
    showcase: {
      kicker: "Así se ve en la práctica",
      title: "Problemas reales, pantallas que entiendes",
      lead: "Capturas reales de la demo — empezando por el dolor que casi todas las pymes comparten: WhatsApp sin contexto.",
      cta: "Probar en la demo interactiva",
      items: [
        {
          key: "whatsapp",
          icon: "📱",
          problemLabel: "WhatsApp",
          title: "¿Aún buscas entre WhatsApp, Excel y la factura?",
          text: "Cliente escribe → aparece quién es, cuánto ha gastado y su última compra. Sin preguntar al empleado ni abrir hojas.",
          imageAlt: "Conversación de WhatsApp con ficha de cliente vinculada: última compra y total gastado"
        },
        {
          key: "inventory",
          icon: "📊",
          problemLabel: "Inventario",
          title: "¿Sigues controlando el stock en Excel?",
          text: "⚠️ Productos por debajo del mínimo y caducidades esta semana — antes de perder dinero en el mostrador.",
          imageAlt: "Panel de inventario con alertas de stock bajo y productos que caducan pronto"
        },
        {
          key: "sales",
          icon: "📈",
          problemLabel: "Ventas",
          title: "¿Cuánto vendiste este mes?",
          text: "Consulta ingresos, pedidos y evolución mensual en segundos — sin montar tablas a mano.",
          imageAlt: "Informe de ventas con ingresos, pedidos, ticket medio y gráfico de evolución mensual"
        }
      ]
    },
    video: {
      kicker: "En 60 segundos",
      title: "De Excel y WhatsApp a una sola pantalla",
      lead: "El recorrido completo en menos de un minuto — sin jerga técnica.",
      playerAria: "Vídeo de presentación",
      placeholder: "Vídeo en preparación",
      placeholderNote: "Mientras grabamos el vídeo, prueba la demo interactiva o pide una llamada sin compromiso.",
      scenes: [
        "¿Aún gestionas tu negocio con Excel y WhatsApp?",
        "Cuando un cliente escribe…",
        "Con Dakinis ves quién es, cuánto ha gastado y qué compró.",
        "Controla ventas e inventario desde un solo lugar.",
        "Te ayudamos a migrar tus datos."
      ],
      cta: "Probar la demo",
      ctaPricing: "Ver planes"
    },
    socialProof: {
      kicker: "Próximamente",
      title: "Casos reales de negocios como el tuyo",
      lead: "Estamos recogiendo los primeros testimonios en Málaga, Lugo, Jerez y alrededores. Si quieres ser referencia en tu sector, hablemos.",
      quotePreview:
        "«Pasamos de 8 hojas de Excel a una sola pantalla» — así sonará tu caso cuando lo tengamos.",
      cta: "Quiero ser el primero"
    },
    gettingStarted: {
      kicker: "Sin miedo al cambio",
      title: "Cómo empezar con Dakinis",
      lead: "El mayor miedo no es el software: es perder datos, parar el negocio o no saber usarlo. Por eso vamos paso a paso contigo.",
      steps: [
        { title: "Subimos tu Excel", text: "Tus hojas y listas pasan al sistema sin que pierdas el historial." },
        { title: "Configuramos tu negocio", text: "Tu sector, usuarios y datos quedan listos para trabajar." },
        { title: "Te enseñamos a usarlo", text: "Formación con tu equipo, en lenguaje claro — no un manual técnico." },
        { title: "Empiezas a trabajar", text: "Operas con normalidad. Tu negocio no se para." }
      ],
      timeline: "Tiempo estimado: 1–3 días",
      reassurance: [
        "No pierdes tus datos",
        "No tienes que aprenderlo solo",
        "No paras tu negocio",
        "Si algo no encaja, lo ajustamos contigo"
      ]
    },
    whatsIncluded: "Ventas, clientes e inventario en un solo lugar",
    screenItems: ["Ventas", "Clientes", "Inventario", "Citas", "Reportes", "Alertas de stock"],
    whatsappPitch:
      "Cuando un cliente escribe por WhatsApp, ves su historial, compras y datos en la misma pantalla — sin copiar nada a Excel.",
    extrasHint:
      "WhatsApp, automatizaciones e IA avanzada están disponibles cuando tu negocio ya tiene lo esencial bajo control — no hace falta empezar por ahí.",
    demosTitle: "Prueba cómo se ve en tu sector",
    demosLead:
      "Demos por tipo de negocio — no un software genérico. Elige clínica, restaurante, peluquería o inmobiliaria.",
    valueKicker: "Antes de que te cueste dinero",
    valueTitle: "Controla tu inventario a tiempo",
    valueBullets: [
      "Stock en tiempo real con alertas de faltantes",
      "Control de vencimientos antes de perder mercancía",
      "Reportes automáticos sin montar tablas a mano"
    ]
  },
  commercial: {
    tryDemo: "Probar demo",
    executive: {
      kicker: "Vista del dueño",
      title: "Resumen del negocio",
      lead: "Lo primero que mira el responsable antes de inventario o CRM.",
      demoBadge: "Datos demo",
      monthSales: "Ventas del mes",
      newClients: "Clientes nuevos",
      topProduct: "Producto más vendido",
      estimatedProfit: "Beneficio estimado",
      alertsTitle: "Alertas importantes"
    },
    simulator: {
      kicker: "Calculadora de ahorro",
      title: "¿Cuántas horas dedicas a la semana a Excel?",
      lead: "Elige una estimación realista. Muchas pymes no cuentan el tiempo que pierden en hojas, copiar datos y buscar información.",
      hoursLabel: "Horas por semana en Excel y tareas manuales",
      presetHours: "{hours} h/semana",
      resultHours: "Pierdes aproximadamente {hours} horas al mes.",
      resultMoney: "Eso puede suponer unos {amount} €/mes en tiempo de equipo (a 18 €/h).",
      resultAutomation: "Con Dakinis puedes automatizar gran parte de ese trabajo.",
      calcCta: "Ver cómo quedaría en tu negocio"
    },
    excelCompare: {
      kicker: "Comparativa",
      title: "¿Aún controlas tu negocio con Excel?",
      lead: "Mismo negocio, menos líos: información útil en un solo sitio en lugar de hojas sueltas.",
      colExcel: "Excel / WhatsApp suelto",
      colDakinis: "Dakinis One",
      rows: [
        { excel: "Datos dispersos en hojas", dakinis: "Todo integrado en un panel" },
        { excel: "Inventario manual", dakinis: "Stock automatizado con alertas" },
        { excel: "Clientes sin seguimiento", dakinis: "Historial y seguimiento de clientes" },
        { excel: "Sin reservas online", dakinis: "Reservas online y recordatorios" },
        { excel: "WhatsApp sin historial", dakinis: "WhatsApp integrado al negocio" }
      ]
    },
    marketplace: {
      kicker: "Crece cuando lo necesites",
      title: "Empieza simple, añade después",
      lead: "Primero ordenas ventas, clientes e inventario. El resto se activa cuando tu negocio lo pida.",
      modules: {
        crm: { name: "CRM", defaultOn: true, roi: "Cierra más ventas con seguimiento automático" },
        whatsapp: { name: "WhatsApp", defaultOn: true, roi: "Menos no-show y respuestas más rápidas" },
        inventory: { name: "Inventario", defaultOn: true, roi: "Reduce pérdidas por caducidad y faltantes" },
        reservations: { name: "Reservas", defaultOn: true, roi: "Más ocupación sin llamadas manuales" },
        ai: { name: "IA", defaultOn: false, roi: "Respuestas útiles para el dueño, no para programadores" },
        portal: { name: "Portal Cliente", defaultOn: false, roi: "Autoservicio y menos carga en recepción" }
      }
    },
    ai: {
      kicker: "IA para negocio",
      title: "Preguntas que un dueño sí haría",
      lead: "Sin jerga técnica: respuestas accionables sobre tu operación.",
      answerLabel: "Respuesta demo",
      hint: "Pulsa una pregunta para ver un ejemplo de respuesta.",
      questions: {
        restock: {
          prompt: "¿Qué productos debo reponer?",
          answer:
            "Jalapeños (caduca en 3 días, 2 porciones restantes), harina 00 (bajo mínimo) y aceite fritura. Pedido sugerido a proveedor habitual: 4 kg jalapeños, 10 kg harina."
        },
        inactive: {
          prompt: "¿Qué clientes llevan 30 días sin comprar?",
          answer:
            "12 clientes sin visita en 30+ días. Top 3 por ticket: García (€84), Ortega (€62), Vega (€58). Campaña WhatsApp de reactivación lista con 8 % descuento."
        },
        cancellations: {
          prompt: "¿Qué citas podrían cancelarse?",
          answer:
            "4 reservas de viernes sin confirmar WA. Riesgo alto: mesa T4 20:00 y terraza T2 21:30. Envía recordatorio automático antes de las 18:00."
        },
        noShow: {
          prompt: "¿Quién tiene riesgo de no-show?",
          answer:
            "6 citas mañana sin confirmar. Prioridad: Botox 10:30 (VIP) y color 16:00 (nuevo cliente). Recordatorio WA programado 24 h y 2 h antes."
        },
        upsell: {
          prompt: "¿Dónde puedo vender más?",
          answer:
            "18 pacientes con tratamiento facial sin upsell de peeling. 4 presupuestos abiertos > €400. Sugerencia: pack post-tratamiento con 12 % margen extra."
        },
        followUp: {
          prompt: "¿Qué leads necesitan seguimiento?",
          answer:
            "3 leads sin contacto > 48 h: piso centro (Martínez), ático norte (López), local comercial (Ruiz). Plantilla WA de seguimiento lista para cada uno."
        },
        visits: {
          prompt: "¿Qué visitas están en riesgo?",
          answer:
            "2 visitas sin confirmar mañana. Piso 3 hab. — lead caliente, sin respuesta desde ayer. Reenvía confirmación por WhatsApp."
        }
      }
    },
    flow: {
      kicker: "Proceso completo"
    },
    flows: {
      restaurante: {
        title: "De la reserva a la venta en un solo flujo",
        lead: "No son pantallas sueltas: todo conectado como en operación real.",
        steps: [
          "Cliente reserva mesa (web o WhatsApp)",
          "Camarero recibe pedido en el plano de mesas",
          "Cocina recibe comanda en tiempo real",
          "Stock disminuye al cerrar la venta",
          "La venta aparece en el dashboard ejecutivo"
        ]
      },
      clinica: {
        title: "De la cita al cobro sin fricción",
        lead: "Agenda, paciente y facturación en el mismo circuito.",
        steps: [
          "Paciente reserva cita online",
          "Recordatorio automático reduce ausencias",
          "Tratamiento registrado en ficha CRM",
          "Consumibles descontados del stock",
          "Facturación y KPIs en resumen del negocio"
        ]
      },
      peluqueria: {
        title: "De la reserva web al ticket medio",
        lead: "Menos huecos vacíos y más clientes que repiten.",
        steps: [
          "Cliente reserva por web o Instagram",
          "Estilista ve agenda por silla",
          "Productos consumidos bajan stock",
          "WhatsApp pide reseña y próxima cita",
          "Dashboard muestra ocupación y ticket medio"
        ]
      },
      inmobiliaria: {
        title: "Del lead al cierre con seguimiento",
        lead: "Ningún contacto se pierde entre Excel y WhatsApp.",
        steps: [
          "Lead entra desde web o portal",
          "CRM asigna agente y siguiente paso",
          "Visita confirmada por WhatsApp",
          "Propuesta y negociación en pipeline",
          "Cierre reflejado en informe ejecutivo"
        ]
      }
    },
    roi: {
      restaurante: [
        "Reduce pérdidas por caducidad y faltantes de stock",
        "Menos errores en comandas y más rotación de mesas",
        "Reservas con recordatorio: menos mesas vacías"
      ],
      clinica: [
        "Menos ausencias con recordatorios automáticos",
        "Seguimiento post-tratamiento que aumenta repetición",
        "Visión comercial del paciente sin hojas sueltas"
      ],
      peluqueria: [
        "Reduce ausencias y aumenta reservas automáticas",
        "Agenda por estilista: más ocupación sin caos",
        "Campañas de retorno que suben recurrencia"
      ],
      inmobiliaria: [
        "Seguimiento automático para cerrar más ventas",
        "Pipeline visible: ningún lead olvidado",
        "Visitas coordinadas sin doble llamada"
      ]
    }
  },
  inventoryLots: {
    kicker: "Inventario · lotes",
    title: "Control de lotes y caducidades",
    lead: "Recepción con QR interno, FIFO automático y mapa de neveras. Ideal para mercado, restaurante y clínica.",
    demoMode: "Modo demo (sin login)",
    loadError: "No se pudieron cargar los lotes",
    receiveError: "Error al registrar la recepción",
    scanError: "Lote no encontrado",
    demoNotFound: "Lote demo no encontrado",
    tabSummary: "Resumen",
    tabReceive: "Recepción",
    tabFridges: "Mapa neveras",
    tabLots: "Todos los lotes",
    tabScan: "Escanear QR",
    tabGuide: "Guía y costes",
    expire3d: "Vencen en 3 días",
    expire7d: "Vencen en 7 días",
    stockOk: "Stock correcto",
    fifoNote: "Al vender, el sistema descuenta primero el lote que vence antes (FIFO/FEFO).",
    receiveLead: "Escanea el EAN del fabricante, introduce lote y vencimiento, y genera la etiqueta QR interna.",
    productBarcode: "Código producto (EAN)",
    productName: "Nombre producto",
    productNamePlaceholder: "Leche entera 1L",
    supplierLot: "Lote proveedor",
    expiry: "Vencimiento",
    quantity: "Cantidad",
    location: "Ubicación",
    supplier: "Proveedor",
    receiveCta: "Registrar y generar QR",
    labelPreview: "Etiqueta interna",
    printLabel: "Imprimir etiqueta",
    noLots: "Sin lotes activos en ubicaciones.",
    colCode: "Código QR",
    colProduct: "Producto",
    colLot: "Lote",
    colExpiry: "Vence",
    colQty: "Ud.",
    colLocation: "Ubicación",
    colStatus: "Estado",
    scanLead: "Escanea el QR de la etiqueta (LOT-2026-000123) o el EAN para recepción.",
    scanHint: "QR de lote o código de barras del producto",
    severity: {
      critical: "Urgente",
      warning: "Próximo",
      ok: "OK",
      expired: "Caducado",
      unknown: "—"
    },
    guideQrTitle: "Etiqueta QR propia (recomendado)",
    guideQrLead: "El QR solo guarda el código interno; producto, lote y vencimiento viven en la base de datos.",
    guideQrBullets: [
      "Formato: LOT-2026-000123 — pequeño, rápido de leer y escalable",
      "Puedes cambiar datos sin reimprimir si corriges en el sistema",
      "No sustituye el EAN del fabricante: es etiqueta interna de lote"
    ],
    guideCostTitle: "Coste de etiquetas térmicas",
    guideCostLead: "Muy bajo para pymes — sin tinta, impresora 60–120 €.",
    guideCostBullets: [
      "Etiqueta 40×30 mm: ~0,005–0,02 € (5.000–20 € por 10.000 uds)",
      "Papel resistente frío/humedad (nevera): ~0,01–0,03 € por etiqueta",
      "Mercado pequeño (~1.000 etiquetas/mes): ~10–30 €/mes"
    ],
    guideFridgeTitle: "Neveras y cámaras",
    guideFridgeLead:
      "Pega una etiqueta por caja o bandeja. El empleado escanea al guardar y ve producto, lote, vencimiento y días restantes.",
    guideFifoTitle: "Sin etiqueta (opción 0 €)",
    guideFifoLead:
      "Registra lote al entrar mercancía y deja que FIFO descuente el más antiguo al vender. Menos control físico en nevera."
  },
  demoCommercial: {
    kicker: "Demo comercial · {label}",
    title: "Así gestionarías tu {label} con Dakinis One",
    lead: "Explora el panel interactivo y comprueba el retorno antes de contratar.",
    panelKicker: "Operativa de tu negocio",
    panelTitle: "Así trabajarías cada día — {label}",
    openCommercialPanel: "Abrir panel comercial",
    tryInteractive: "Probar operativa en vivo"
  },
  hub: {
    title: "Tu espacio de trabajo",
    lead: "Accede a clientes, ventas, inventario y las apps conectadas de tu negocio.",
    login: "Iniciar sesión",
    requestDemo: "Solicitar demo",
    sessionHello: "Sesión: {email} · negocio {business}",
    applicationsTitle: "Módulos de tu negocio",
    applicationsLead:
      "Clientes, WhatsApp, inventario y más. Activa solo lo que necesitas.",
    marketplaceTitle: "Apps conectadas",
    marketplaceLead: "Herramientas del ecosistema Dakinis que puedes enlazar a tu cuenta.",
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
      statModules: "Módulos activos: {count}",
      statIntegrations: "Apps conectadas: {count}",
      statBusiness: "Negocio: {name}",
      tenantUnknown: "—",
      subtitle: "Todo pasa aquí — tus apps, notificaciones e IA en un solo lugar.",
      quickActions: "Acciones rápidas",
      actionNewClient: "Nuevo cliente",
      actionNewOrder: "Nuevo pedido",
      actionSendWhatsApp: "Enviar WhatsApp",
      actionOpenInventory: "Abrir inventario"
    },
    widgets: {
      lifeflowHint: "Tu score subió esta semana.",
      viewSales: "Ver ventas",
      openCalendar: "Abrir calendario",
      viewCommunity: "Ver comunidad",
      aiHint: "Tengo 3 recomendaciones para hoy.",
      viewRecs: "Ver recomendaciones"
    },
    notifications: {
      title: "Notificaciones",
      scoreUp: "LifeFlow Score +12",
      newOrder: "Nuevo pedido en Core",
      published: "Vídeo publicado en Stream",
      newUsers: "15 usuarios nuevos en AkoeNet",
      aiRec: "Nueva recomendación de IA"
    },
    timeline: {
      title: "Actividad de hoy",
      invoice: "Factura creada",
      ai: "IA respondió en Copilot",
      score: "Score LifeFlow actualizado",
      customer: "Nuevo cliente registrado"
    }
  },
  cmdk: {
    title: "Buscar y comandos",
    placeholder: "Buscar clientes, abrir apps, preguntar a IA…",
    noResults: "Sin resultados — prueba otro término",
    hintNavigate: "↑↓ navegar · Enter ejecutar · Esc cerrar",
    hintAi: "Pregunta a Dakinis AI desde «Preguntar a Dakinis AI»"
  },
  footer: {
    navAria: "Enlaces pie de página",
    copyright:
      "© {year} Dakinis Systems (Christian David Villar Colodro). Todos los derechos reservados.",
    faq: "FAQ",
    privacy: "Privacidad",
    terms: "Términos",
    legalNotice: "Aviso legal",
    cookies: "Cookies",
    security: "Seguridad",
    sla: "SLA",
    refunds: "Reembolsos",
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
        "Explora el dashboard comercial con clientes, ventas, inventario y WhatsApp ya cargados.",
      toPanel: "Ir a mi panel funcional",
      toMockup: "Abrir mockup interactivo",
      benefitIntro: "Ventajas de probar tu vertical:"
    }
  },
  systemDemo: {
    badge: "Demo comercial",
    accountLine: "Sesión: {email}",
    businessLine: "Negocio: {name}",
    passwordLabel: "Contraseña de esta demo",
    benefitsTitle: "Qué puedes explorar en esta vertical",
    mockupPrimary: "Ver mockup del panel — {label}",
    toHome: "Volver al inicio",
    functionalHint:
      "Más abajo puedes probar la operativa diaria de este sector con datos de ejemplo.",
    dashboardPrimary: "Ver mi panel comercial",
    operationalPanel: "Operativa {label}",
    verticals: {
      clinica: {
        headline: "Clínica demo: menos no-show, más repetición",
        lead: "Agenda, CRM y stock con ROI visible para el responsable del centro.",
        benefits: [
          "Menos ausencias con recordatorios automáticos 24 h y 2 h.",
          "Seguimiento post-tratamiento que fideliza pacientes.",
          "Resumen ejecutivo: citas, facturación y alertas de stock."
        ]
      },
      peluqueria: {
        headline: "Peluquería demo: más reservas, menos ausencias",
        lead: "Agenda online, recordatorios y dashboard del dueño en un solo sitio.",
        benefits: [
          "Reduce ausencias y aumenta reservas automáticas.",
          "Agenda por estilista sin solapamientos.",
          "Campañas WhatsApp para clientes que no vuelven."
        ]
      },
      restaurante: {
        headline: "Restaurante demo: de la mesa al dashboard",
        lead: "Toca una mesa, añade platos y sigue el flujo hasta cocina y cierre de caja.",
        benefits: [
          "Reduce pérdidas por caducidad y faltantes de stock.",
          "Plano de mesas: pedido, cocina y cobro conectados.",
          "Dashboard ejecutivo con ventas y alertas del mes."
        ]
      },
      inmobiliaria: {
        headline: "Inmobiliaria demo: cierra más ventas",
        lead: "CRM, visitas y seguimiento automático sin perder leads en Excel.",
        benefits: [
          "Seguimiento automático para cerrar más operaciones.",
          "Pipeline visual: de lead nuevo a cierre.",
          "Alertas de leads sin contacto y visitas en riesgo."
        ]
      }
    }
  },
  pricingPage: {
    kicker: "Paquetes",
    title: "Deja Excel y centraliza tu negocio",
    valueHeadline: "Ventas, clientes e inventario en un solo lugar.",
    valueSubheadline:
      "Controla ventas, clientes e inventario sin complicaciones. Migramos tus datos y te formamos.",
    leadPoints: [
      "Suscripción mensual clara",
      "Implantación y migración de Excel incluidas en el arranque",
      "Formación para tu equipo"
    ]
  },
  pricing: {
    clientIntro:
      "Un precio mensual claro para tu día a día. Nosotros implantamos y migramos tus Excel: tú sigues atendiendo clientes mientras el sistema queda listo.",
    includesTitle: "Qué incluye",
    planCta: "Quiero este plan",
    stripeCta: "Suscríbete",
    stripeLoading: "Redirigiendo a Stripe…",
    stripeError: "No se pudo abrir el pago. Inténtalo de nuevo o escríbenos por WhatsApp.",
    planCtaWhatsapp: "Prefiero hablar por WhatsApp",
    planWhatsappMessage:
      "Hola, me interesa el plan {plan} de Dakinis One ({price} €/mes). ¿Podemos hablar de implantación y plazos?",
    planMailtoSubject: "Dakinis One — plan {plan}",
    selectedPlanLabel: "Plan seleccionado: {plan} ({price} €/mes)",
    contactMessageLabel: "Mensaje de contacto:",
    selectPlanHint: "Pulsa «Quiero este plan» en una tarjeta y el mensaje de email y WhatsApp se adaptará automáticamente.",
    contactWhatsappCta: "Escribir por WhatsApp",
    recommendedBadge: "Más elegido",
    quotaWaLead: "WhatsApp integrado para responder clientes desde el mismo panel.",
    quotaWaFootnote: "Hasta {count} mensajes mensuales incluidos.",
    quotaAiLead:
      "Asistente IA para ayudarte a responder clientes, redactar mensajes y gestionar información.",
    quotaAiFootnote: "Hasta {count} interacciones mensuales incluidas.",
    implBridge:
      "La mensualidad es tu suscripción al software. La implantación es un pago único al inicio, adaptada al plan que elijas.",
    problemsSolved: {
      title: "¿Te suena familiar?",
      items: [
        "Buscas un dato entre tres hojas de Excel y un chat de WhatsApp",
        "No sabes el stock real hasta que falta algo en el mostrador",
        "Las citas se pierden porque no hay recordatorio automático",
        "Llevas clientes y ventas a mano y siempre va algo desactualizado"
      ]
    },
    compare: {
      title: "Comparación de planes",
      lead: "Todo lo esencial en una tabla para ver de un vistazo qué incluye cada plan.",
      featureCol: "Función",
      included: "Incluido",
      notIncluded: "No incluido",
      rows: {
        crm: { label: "Clientes y ventas", starter: true, growth: true, pro: true },
        agenda: { label: "Agenda y citas", starter: true, growth: true, pro: true },
        reservations: { label: "Reservas online", starter: true, growth: true, pro: true },
        inventory: { label: "Inventario y stock", starter: false, growth: true, pro: true },
        whatsapp: { label: "WhatsApp en el panel", starter: false, growth: true, pro: true },
        analytics: { label: "Reportes automáticos", starter: false, growth: true, pro: true },
        ai: { label: "Asistente avanzado", starter: false, growth: false, pro: true },
        automations: { label: "Recordatorios automáticos", starter: false, growth: false, pro: true }
      }
    },
    implementationByPlan: {
      starter: {
        label: "Implantación Starter",
        range: "199 € – 300 €",
        description: "Configuración básica, datos iniciales y formación del equipo en una sesión."
      },
      growth: {
        label: "Implantación Growth",
        range: "500 €",
        description: "Migración de clientes y citas, inventario inicial y puesta en marcha acompañada."
      },
      pro: {
        label: "Implantación Pro",
        range: "1.000 €+",
        description: "Migración completa, automatizaciones y conexiones según tu operativa real."
      }
    },
    customDev: {
      kicker: "Solo si lo necesitas",
      title: "Desarrollo a medida",
      lead: "La solución estándar es Dakinis One. Los proyectos personalizados son para cuando tu operativa no encaja en los planes mensuales.",
      note: "No sustituyen la suscripción: son trabajos puntuales de desarrollo, integración o migración cuando el producto estándar no basta."
    },
    overageTitle: "Si te pasas de la cuota",
    contactHint: "Te respondemos con propuesta concreta: plan, implantación y plazo — sin letra pequeña.",
    whatsappFabHint: "El botón flotante verde usa el mismo mensaje si ya elegiste un plan.",
    bos: {
      kicker: "Suscripción mensual",
      title: "Elige el plan según el tamaño de tu negocio",
      subtitle:
        "Ventas, clientes, inventario y citas en un solo sitio. Pagas un fijo al mes y nosotros te ayudamos a arrancar.",
      perMonth: "/mes",
      recommended: "recomendado",
      overageLead:
        "Exceso de consumo: {aiRate} € / 1.000 consultas IA extra (plan Pro) · {waRate} € / 500 mensajes WhatsApp extra.",
      implementationTitle: "Implantación inicial (pago único)",
      implementationLead:
        "Cada plan tiene su rango de implantación. No pagas 500 € si empiezas con Starter: el coste de arranque va acorde al plan que elijas.",
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
          tagline: "Tu primer paso digital",
          audience: "Para negocios que empiezan a ordenar clientes y citas",
          outcome:
            "Ideal si hoy vives entre WhatsApp, papel y Excel: centralizas agenda, clientes y reservas sin pagar por funciones que aún no necesitas.",
          includes: [
            "CRM con historial de clientes",
            "Agenda y calendario del equipo",
            "Reservas y recordatorios",
            "Portal para que el cliente reserve solo"
          ]
        },
        growth: {
          name: "Growth",
          tagline: "Operación completa del día a día",
          audience: "Para negocios con stock, equipo y comunicación activa",
          outcome:
            "Cuando ya no basta con la agenda: controlas inventario, ves métricas del negocio y respondes clientes por WhatsApp con cuota mensual incluida.",
          includes: [
            "Todo lo del Starter",
            "Inventario y alertas de stock",
            "CRM avanzado y pipeline comercial",
            "Analytics y comparativa con tu sector",
            "WhatsApp integrado (cuota mensual incluida)"
          ]
        },
        pro: {
          name: "Pro",
          tagline: "Menos trabajo manual cada día",
          audience: "Para negocios con mucho volumen que no pueden seguir a mano",
          outcome:
            "Automatizas recordatorios, centralizas WhatsApp y ganas tiempo sin contratar más personal administrativo.",
          valueAnchor:
            "Valorado normalmente en más de 250 €/mes si contrataras varias herramientas sueltas. Todo integrado en una sola plataforma.",
          includes: [
            "Todo lo del Growth",
            "Asistente IA integrado",
            "Automatizaciones y flujos personalizados",
            "WhatsApp avanzado con mayor cuota",
            "Acceso al ecosistema Dakinis Network"
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
      light: {
        label: "Configuración ligera",
        description: "Cuenta nueva, catálogo o menú básico y formación del equipo en una sesión."
      },
      standard: {
        label: "Implantación estándar",
        description: "Migración de clientes y citas, ajustes de tu vertical y puesta en marcha acompañada."
      },
      advanced: {
        label: "Implantación avanzada",
        description: "Varios módulos activos, reglas de negocio y conexiones según tu operativa real."
      },
      enterprise: {
        label: "Proyecto a medida",
        description: "Alcance personalizado cuando tu caso necesita integraciones o lógica especial."
      }
    }
  },
  login: {
    kicker: "Accede a tu negocio",
    title: "Iniciar sesión",
    businessLead: "Gestiona clientes, ventas e inventario desde un solo panel.",
    tryWithoutAccount: "¿Sin cuenta? Prueba la demo comercial sin configurar nada:",
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
    submitLocalDev: "Login local (dev SQLite)",
    businessSlug: "Negocio (slug del tenant)",
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
    idpHint: "En producción el login usa Auth central (auth.dakinissystems.com). Admin plataforma: tenant dakinis-platform.",
    legalHint: "Al iniciar sesión aceptas los",
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
    cookies: "Cookies · Dakinis One",
    refunds: "Reembolsos · Dakinis One",
    security: "Seguridad · Dakinis One",
    sla: "SLA · Dakinis One",
    vista: "Vista previa · {label} · Dakinis One",
    sistema: "{label} · Dakinis One",
    app: "Dakinis App",
    hub: "Dakinis Hub",
    pricing: "Planes y paquetes · Dakinis One",
    checkoutSuccess: "Suscripción confirmada · Dakinis One",
    allergies: "Cartel de alergias · Dakinis One"
  },
  checkout: {
    success: {
      kicker: "Pago",
      title: "¡Suscripción activada!",
      genericTitle: "Gracias por tu suscripción",
      genericLead:
        "Si acabas de pagar en Stripe, en unos minutos tendrás acceso al plan contratado. Si aún no tienes cuenta, te contactaremos con los siguientes pasos.",
      planActivated: "Tu plan {plan} está en proceso de activación.",
      nextSteps:
        "Usa el mismo email que en Stripe para iniciar sesión. Si es tu primer acceso, revisa el correo de bienvenida o escríbenos.",
      verifying: "Confirmando tu pago…",
      errorTitle: "No pudimos verificar el pago",
      error: "Sesión de pago no válida o expirada.",
      goLogin: "Iniciar sesión",
      viewPlans: "Ver planes",
      backToPricing: "Volver a precios"
    }
  },
  vistaMockup: {
    kicker: "Vista previa",
    title: "Así se vería tu {label}",
    lead:
      "Maquetación visual del panel para este tipo de negocio. Para datos reales, usa el panel comercial.",
    home: "Inicio",
    platformAdmin: "Administración plataforma",
    goDemoSystem: "Ir al sistema demo",
    myFunctionalPanel: "Mi panel funcional"
  },
  appNav: {
    aria: "Navegación de la app",
    app: "App",
    crm: "CRM",
    clients: "👥 Clientes",
    inventory: "📦 Inventario",
    sales: "💰 Ventas",
    reports: "📊 Analytics",
    messages: "Mensajes",
    communications: "Comunicaciones",
    whatsapp: "💬 WhatsApp",
    hub: "Hub",
    settings: "Ajustes"
  },
  businessDemo: {
    hero: {
      title: "Todo tu negocio en un solo lugar",
      lead: "Clientes, ventas, inventario, reportes y WhatsApp conectados — sin configurar nada.",
      aiKicker: "Asistente IA",
      aiTitle: "Pregúntale a Dakinis",
      aiLead: "Analiza clientes, ventas e inventario con datos reales de tu negocio.",
      askPlaceholder: "Pregunta por clientes perdidos, ventas, alertas de stock…",
      askAria: "Pregunta a Dakinis IA",
      askButton: "Preguntar",
      answerLabel: "Respuesta",
      loginForAi: "Inicia sesión para usar el asistente IA.",
      stubHint: "Modo desarrollo sin OpenAI. Añade OPENAI_API_KEY en platform/ai/.env para respuestas GPT.",
      tiles: {
        clients: "Clientes",
        inventory: "Inventario",
        sales: "Ventas",
        reports: "Analytics",
        whatsapp: "WhatsApp"
      }
    },
    dashboard: {
      kicker: "Resumen del negocio",
      greeting: "Hola, {name}",
      lead: "Lo primero que mira el responsable antes de operar el día.",
      fallbackBusiness: "Tu negocio",
      activeClients: "Clientes activos",
      monthSales: "Ventas este mes",
      products: "Productos",
      conversion: "Conversión",
      ctaPipeline: "Ver embudo de ventas",
      ctaWhatsapp: "Abrir WhatsApp",
      insightsTitle: "Lo que importa hoy",
      insights: [
        "3 clientes sin respuesta > 48 h — plantilla WhatsApp lista",
        "Stock bajo en 7 referencias — revisar pedido a proveedor",
        "Ventas +12 % vs. mes anterior — embudo con 4 propuestas abiertas"
      ],
      trends: {
        clients: "+8 % vs. mes anterior",
        sales: "+12 % vs. mes anterior",
        products: "523 referencias activas",
        conversion: "+3 pts vs. trimestre"
      }
    },
    clients: {
      kicker: "Clientes",
      title: "Tu cartera de clientes",
      lead: "Historial, compras y seguimiento en un solo sitio.",
      demoHint: "Arrastra las oportunidades entre columnas para ver cómo sigues cada venta."
    },
    sales: {
      kicker: "Ventas",
      title: "Embudo comercial",
      lead: "Arrastra oportunidades entre etapas y cierra más rápido.",
      realHint: "Conecta CRM real para ver tu pipeline en vivo."
    },
    pipeline: {
      aria: "Pipeline de ventas",
      sectionTitle: "Oportunidades por etapa",
      lead: "Nuevo lead",
      contacted: "Contactado",
      proposal: "Propuesta",
      client: "Cliente"
    },
    whatsapp: {
      kicker: "WhatsApp",
      title: "Conversaciones con clientes",
      pageLead:
        "Cuando un cliente escribe, ves quién es, cuánto ha gastado y qué compró — sin buscar en hojas de cálculo.",
      lead: "Cada chat vinculado al cliente: historial, última compra y ticket en el mismo sitio.",
      conversations: "Conversaciones",
      linkedClient: "Cliente vinculado",
      clientLabel: "Cliente",
      lastPurchase: "Última compra",
      totalSpent: "Total gastado",
      phone: "Teléfono"
    },
    options: {
      moreAria: "Más opciones",
      defaultSubject: "este cliente",
      whatsapp: {
        clientHistory: "Ver historial CRM",
        paymentLink: "Generar enlace de pago",
        followUpTemplate: "Enviar plantilla de seguimiento",
        assignAgent: "Asignar a mi equipo",
        addCampaign: "Añadir a campaña"
      },
      crm: {
        clientProfile: "Ver ficha del cliente",
        whatsappProposal: "Enviar propuesta por WhatsApp",
        scheduleFollowUp: "Programar seguimiento",
        markWon: "Marcar como ganada"
      },
      inventory: {
        reorderSupplier: "Pedir a proveedor",
        adjustStock: "Ajustar stock",
        linkToSale: "Vincular a venta",
        setAlert: "Alerta de mínimo",
        exportList: "Exportar listado"
      },
      reports: {
        exportPdf: "Exportar informe PDF",
        shareWhatsapp: "Compartir por WhatsApp",
        comparePeriod: "Comparar periodo",
        scheduleReport: "Programar envío mensual",
        drillDown: "Ver detalle por producto"
      },
      dashboard: {
        exportSummary: "Exportar resumen",
        shareTeam: "Compartir con equipo",
        setGoals: "Objetivos del mes"
      },
      feedback: {
        whatsapp: {
          clientHistory:
            "Historial de {name}: compras, citas y conversaciones en un solo sitio — sin buscar en Excel.",
          paymentLink: "Enlace de cobro generado para {name}. Envíalo por WhatsApp y cierra la venta al momento.",
          followUpTemplate:
            "Plantilla «¿Te reservo unidades?» lista para {name}. Un clic y el seguimiento queda automatizado.",
          assignAgent:
            "Chat de {name} asignado a tu equipo. Todos ven el mismo historial y contexto del cliente.",
          addCampaign:
            "{name} añadido a campaña «Clientes recurrentes» con recordatorio automático en 7 días."
        },
        crm: {
          clientProfile: "Ficha de {name}: contacto, compras, notas y conversaciones WhatsApp vinculadas.",
          whatsappProposal:
            "Propuesta enviada a {name} por WhatsApp con enlace de aceptación — seguimiento en el embudo.",
          scheduleFollowUp: "Recordatorio para {name} el viernes 10:00. No se te escapa ningún lead.",
          markWon: "Oportunidad de {name} marcada como ganada. Venta registrada en reportes del mes."
        },
        inventory: {
          reorderSupplier: "Pedido a proveedor iniciado para {name}. El stock se actualiza al recibir mercancía.",
          adjustStock: "Stock de {name} ajustado. El cambio queda en el historial del producto.",
          linkToSale: "{name} vinculado a la venta activa — inventario y ticket siempre alineados.",
          setAlert: "Alerta de mínimo configurada para {name}. Te avisamos antes de quedarte sin stock.",
          exportList: "Listado de inventario exportado. Compártelo con tu equipo o contabilidad."
        },
        reports: {
          exportPdf: "Informe PDF de {name} listo para enviar al responsable o asesor.",
          shareWhatsapp: "Resumen de ventas compartido por WhatsApp — decisiones sin esperar al ordenador.",
          comparePeriod: "Comparativa generada: +12 % ingresos y +9 % pedidos vs. mes anterior.",
          scheduleReport: "Envío mensual programado. Recibirás el informe el día 1 sin hacer nada más.",
          drillDown: "Detalle por producto abierto — ves qué referencias impulsan el crecimiento."
        },
        dashboard: {
          exportSummary: "Resumen ejecutivo de {name} exportado — KPIs, alertas y embudo en un PDF.",
          shareTeam: "Panel compartido con tu equipo. Todos ven los mismos números en tiempo real.",
          setGoals: "Objetivos del mes guardados para {name}. Seguimiento automático en reportes."
        }
      }
    },
    inventory: {
      kicker: "Inventario",
      title: "Productos y stock",
      lead: "Control de existencias, alertas de mínimo y caducidades.",
      totalProducts: "Referencias",
      lowStock: "Stock bajo",
      lowStockPain: "⚠️ {count} productos por debajo del mínimo",
      expiring: "Próximos a caducar",
      expiringPain: "⚠️ {count} productos caducan esta semana",
      tableTitle: "Listado de productos",
      tableLead: "Stock en tiempo real vinculado a ventas y comandas.",
      tableSubject: "inventario",
      colProduct: "Producto",
      colSku: "SKU",
      colStock: "Stock",
      colStatus: "Estado",
      redirecting: "Abriendo inventario operativo…",
      realHint: "Activa el módulo inventario en tu vertical operativa.",
      status: { ok: "OK", low: "Bajo mínimo", expiry: "Caduca pronto" },
      trends: {
        total: "Catálogo completo",
        low: "Requiere pedido",
        expiring: "Revisar esta semana"
      }
    },
    reports: {
      kicker: "Reportes",
      title: "¿Cuánto vendiste este mes?",
      lead: "Conoce tus ventas de un vistazo: ingresos, pedidos y evolución mensual.",
      revenue: "Ingresos (30 d)",
      orders: "Pedidos",
      avgTicket: "Ticket medio",
      chartTitle: "Evolución de ventas",
      chartLead: "Comparativa mensual — índice de actividad comercial",
      chartAria: "Gráfico de barras de ventas mensuales",
      periodLabel: "Últimos 5 meses",
      realHint: "Los reportes en vivo se activan con tu plan Analytics.",
      trends: {
        revenue: "+12 % vs. mes anterior",
        orders: "+9 % vs. mes anterior",
        avgTicket: "+4 % vs. mes anterior"
      }
    },
    analytics: {
      kicker: "Analytics",
      title: "¿Cuánto vendiste y por dónde entran tus clientes?",
      lead: "Ventas, canales, embudo y comparativa con tu sector — decisiones con datos, no con intuición.",
      liveBadge: "Datos en vivo de tu tenant",
      planHint: "El benchmark en vivo requiere plan Growth o Pro. Mostrando vista demo de referencia.",
      periodAria: "Periodo de análisis",
      periods: { "7d": "7 días", "30d": "30 días", "90d": "90 días" },
      revenue: "Ingresos",
      orders: "Pedidos",
      avgTicket: "Ticket medio",
      conversion: "Conversión",
      salesTitle: "Evolución de ventas",
      salesLead: "Índice de actividad comercial por mes",
      chartAria: "Gráfico de evolución de ventas",
      channelsTitle: "Ventas por canal",
      channelsLead: "Dónde entra el dinero — WhatsApp, salón y web",
      channels: {
        whatsapp: "WhatsApp",
        salon: "Salón / presencial",
        web: "Web / reservas"
      },
      funnelTitle: "Embudo comercial",
      funnelLead: "De visita a venta cerrada",
      funnel: {
        visits: "Visitas / contactos",
        leads: "Leads cualificados",
        proposals: "Propuestas enviadas",
        sales: "Ventas cerradas"
      },
      benchmarkTitle: "Comparativa con tu sector",
      benchmarkLead: "Tu negocio vs. media de {industry}",
      you: "Tú",
      sector: "Sector",
      topTitle: "Top del periodo",
      topLead: "Productos y clientes que más aportan",
      topProducts: "Productos",
      topClients: "Clientes",
      industries: {
        restaurante: "restauración",
        clinica: "clínicas y estética",
        peluqueria: "peluquería y belleza",
        inmobiliaria: "inmobiliaria"
      },
      trends: {
        revenue: "+12 % vs. periodo anterior",
        orders: "+9 % vs. periodo anterior",
        avgTicket: "+4 % vs. periodo anterior",
        conversion: "+3 pts vs. trimestre"
      }
    },
    hub: {
      ctaTitle: "🚀 Ver negocio demo",
      ctaLead: "Entra al panel comercial con clientes, ventas, inventario y reportes ya cargados.",
      ctaButton: "Abrir dashboard comercial",
      publicLead:
        "Explora el panel como si fueras el dueño del negocio: clientes, ventas, inventario, reportes y WhatsApp ya cargados — sin configurar nada.",
      ctaButtonPublic: "Probar demo gratis"
    }
  },
  mockupPanels: {
    demoBadge: "Vista demo",
    roles: {
      owner: "Responsable",
      reception: "Recepción",
      waiter: "Sala",
      kitchen: "Cocina",
      agent: "Comercial"
    },
    clinica: {
      brand: "Tu clínica",
      tabs: {
        resumen: "Resumen",
        agenda: "Agenda",
        pacientes: "Clientes",
        proveedores: "Inventario",
        whatsapp: "WhatsApp",
        ajustes: "Ajustes"
      },
      toolbar: {
        resumen: { title: "Hoy en la clínica", badge: "18 citas", role: "owner", extra: "3 cabinas" },
        agenda: { title: "Agenda semanal", badge: "Confirmadas", role: "reception" },
        pacientes: { title: "Clientes", badge: "182 fichas", role: "owner" },
        proveedores: { title: "Stock y proveedores", badge: "2 alertas", role: "owner" },
        whatsapp: { title: "WhatsApp", badge: "Recordatorios activos", role: "reception" },
        ajustes: { title: "Ajustes del negocio", badge: "Horario y branding", role: "owner" }
      },
      settingsNote: "Personaliza horarios, logo y recordatorios cuando actives tu cuenta."
    },
    restaurante: {
      brand: "Tu restaurante",
      tabs: {
        mapa: "Mesas",
        reservas: "Reservas",
        espera: "Lista de espera",
        comandas: "Pedidos y cobro",
        clientes: "Clientes",
        alergenos: "Cartel alérgenos",
        proveedores: "Proveedores"
      },
      toolbar: {
        mapa: { title: "Servicio de sala", badge: "Terraza + interior", role: "waiter", extra: "52 cubiertos" },
        reservas: { title: "Reservas de hoy", badge: "Lista completa", role: "reception", extra: "52 cubiertos" },
        espera: { title: "Lista de espera", badge: "3 grupos", role: "reception", extra: "~22 min" },
        comandas: { title: "Pedidos y cobro", badge: "En vivo", role: "waiter", extra: "Cierre de caja" },
        clientes: { title: "Notas de clientes", badge: "2 mesas con alergias", role: "waiter" },
        alergenos: { title: "Cartel de alérgenos", badge: "QR en sala", role: "owner" },
        proveedores: { title: "Proveedores", badge: "2 entregas", role: "owner", extra: "Esta semana" }
      },
      allergenPublicLead: "Lo que ve el comensal al escanear el QR en la mesa.",
      allergenQrHint: "Cartel público listo para imprimir o mostrar en pantalla.",
      comandasKicker: "Comandas, mesas y cobro · demo operativa"
    },
    peluqueria: {
      brand: "Tu salón",
      tabs: {
        hoy: "Hoy",
        estilistas: "Agenda",
        web: "Reservas online",
        clientes: "Clientes",
        productos: "Productos",
        campanas: "WhatsApp"
      },
      toolbar: {
        hoy: { title: "Resumen del día", badge: "4 estilistas", role: "reception" },
        estilistas: { title: "Agenda por estilista", badge: "Sin solapes", role: "reception" },
        web: { title: "Reservas web", badge: "Canal activo", role: "owner" },
        clientes: { title: "Clientes", badge: "Fichas activas", role: "reception" },
        productos: { title: "Productos y pedidos", badge: "Stock OK", role: "owner" },
        campanas: { title: "Campañas WhatsApp", badge: "1 activa", role: "owner" }
      }
    },
    inmobiliaria: {
      brand: "Tu inmobiliaria",
      tabs: {
        pipeline: "Ventas",
        visitas: "Visitas",
        leads: "Oportunidades",
        propiedades: "Propiedades",
        aliados: "Marketing",
        informes: "Reportes"
      },
      toolbar: {
        pipeline: { title: "Embudo de ventas", badge: "33 activos", role: "agent" },
        visitas: { title: "Visitas programadas", badge: "Esta semana", role: "agent" },
        leads: { title: "Oportunidades", badge: "Por fuente", role: "agent" },
        propiedades: { title: "Propiedades", badge: "En cartera", role: "agent" },
        aliados: { title: "Marketing y aliados", badge: "Campañas", role: "owner" },
        informes: { title: "Reportes", badge: "Mensual", role: "owner" }
      }
    }
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
    leadRestauranteDemo:
      "Carta demo: bites (cheddar/jalapeños ~9 uds por porción de ~50; chicken ~11 de ~120) y choripán. Las recetas consumen unidades del inventario.",
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
    kitchenSentAt: "Enviada {time}",
    kitchenElapsed: "{time} en cocina",
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
    roleNav: "¿Qué quieres hacer?",
    roleWaiter: "🍽️ Sala y mesas",
    roleKitchen: "👨‍🍳 Cocina",
    roleAdmin: "⚙️ Gestión",
    waiterLead:
      "Añade mesas, arrastra para mover el salón y toca una mesa para cargar el pedido (cocina y cobro).",
    kitchenLead: "Solo comandas pendientes: marcar estado y reimprimir ticket.",
    adminComandasLead: "Cierre de caja y facturas emitidas.",
    businessKicker: "Restaurante",
    businessTitle: "Control de sala, cocina e inventario",
    businessLead: "Mesas, pedidos, cobros y stock en un solo flujo — sin pantallas técnicas.",
    businessKpis: [
      { label: "Ventas hoy", value: "1.840 €" },
      { label: "Mesas ocupadas", value: "12/18" },
      { label: "Pedidos en cocina", value: "7" }
    ],
    adminTitle: "Configuración del restaurante",
    adminLead: "Carta, plano de mesas, proveedores e inventario.",
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
      "Arrastra para mover la mesa. Un toque sin arrastrar abre el pedido.",
    floorTapHint: "Toca una mesa para abrir el pedido.",
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
    mesaSelectHint: "Selecciona una mesa en el plano para abrir el pedido.",
    mesaNotesPlaceholder: "Ej. sin picante",
    mesaCloseLabel: "Cerrar mesa:",
    mesaModalKicker: "Pedido de mesa",
    mesaModalClose: "Cerrar",
    mesaPayLabel: "Pagar cuenta",
    mesaClear: "Vaciar mesa",
    kitchenQueue: "Cola de cocina"
  },
  system: {
    businessKicker: "Negocio: {name}",
    tenant: "Tenant: {slug}",
    resultsTitle: "Resultados que buscas en {label}",
    home: "Inicio",
    backToSystems: "Volver a sistemas",
    openRealApp: "Abrir app real (/api/v1)",
    openDashboard: "Ir al panel comercial",
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
    dataSectionDemo: "Registros de ejemplo",
    recordsError: "API registros: {error}. Mostrando local o datos mixtos.",
    recordsErrorFriendly: "No pudimos sincronizar ahora. Puedes seguir usando los datos de ejemplo.",
    recordsSynced: "Datos guardados y listos para usar.",
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
    access: {
      column: "Acceso",
      manage: "Acceso",
      formTitle: "Control de acceso del tenant",
      action: "Acción",
      actionSuspend: "Suspender",
      actionReactivate: "Reactivar",
      actionClose: "Cerrar tenant",
      reason: "Motivo",
      reasonLegal: "Legal / reclamación",
      reasonAbuse: "Abuso del servicio",
      reasonFraud: "Fraude",
      reasonContract: "Incumplimiento contractual",
      reasonOther: "Otro",
      note: "Nota interna",
      notePlaceholder: "Referencia interna, ticket, abogado…",
      apply: "Aplicar",
      error: "No se pudo actualizar el acceso",
      confirmSuspend: "¿Suspender este tenant? El cliente no podrá usar la API salvo facturación.",
      confirmReactivate: "¿Reactivar acceso? Se aplicará también el estado de pago Stripe.",
      confirmClose: "¿Cerrar definitivamente este tenant? No podrá iniciar sesión.",
      state: {
        active: "Activo",
        degraded: "Degradado (pago)",
        suspended: "Suspendido",
        closed: "Cerrado"
      }
    },
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
    loginRequired: "Inicia sesión para ver el panel de tu negocio.",
    goLogin: "Ir a login",
    apiError: "No se pudo completar la acción. Inténtalo de nuevo.",
    dashboard: {
      title: "Resumen del negocio",
      kicker: "{name}",
      heading: "Panel de control",
      lead: "Ventas, clientes y alertas importantes de un vistazo.",
      healthScore: "Salud del negocio",
      growthScore: "Crecimiento",
      finance30d: "Ingresos (30 días)",
      margin: "Margen {pct}%",
      benchmark: "Comparativa con tu sector",
      recommendations: "Sugerencias para mejorar",
      aiAssistant: "Asistente Dakinis",
      appointments: "Reservas",
      slots: "Horarios",
      canSchedule: "Comprobar disponibilidad",
      link: "Enlace de reserva",
      whatsapp: "WhatsApp",
      rules: "Automatizaciones"
    },
    crm: {
      title: "CRM",
      heading: "Contactos y actividades",
      lead: "Núcleo del negocio: el cliente conecta reservas, pedidos, facturación y WhatsApp.",
      leadPersisted:
        "Guarda contactos, notas y seguimiento. Los mensajes de WhatsApp se vinculan solos a cada cliente.",
      loginLead: "Inicia sesión para gestionar tus clientes.",
      notReadyFriendly: "El módulo de clientes se está activando. Vuelve en unos minutos o contacta soporte.",
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
      aiHintInactive: "Revisa clientes inactivos — la IA puede sugerir campañas de reactivación.",
      aiHintAction: "Abrir Copilot",
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
      kicker: "Mensajería",
      heading: "WhatsApp Business",
      lead: "Habla con tus clientes y conserva el historial vinculado a cada ficha.",
      loginLead: "Inicia sesión para ver tus conversaciones de WhatsApp.",
      navAria: "Secciones de WhatsApp",
      nav: {
        conversations: "Conversaciones",
        contacts: "Contactos",
        templates: "Plantillas",
        automations: "Automatizaciones",
        ai: "IA"
      },
      conversationsLead: "Todas tus conversaciones con clientes en un solo lugar.",
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
      noThreads: "Aún no hay conversaciones. Cuando un cliente escriba, aparecerá aquí.",
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
      lead: "Configuración de tu negocio, plan y equipo.",
      demoLead: "En la demo comercial la configuración avanzada está simplificada.",
      demoHint: "Para personalizar logo, horarios y facturación, solicita una cuenta de producción.",
      businessName: "Negocio:",
      plan: "Plan:",
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
