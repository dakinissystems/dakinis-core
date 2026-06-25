import { legalCoreEn } from "./legal-core.js";

/** English UI strings. */
export default {
  common: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    unexpectedError: "Unexpected error",
    unexpectedErrorHint: "Reload the page. If it persists, contact support."
  },
  nav: {
    packages: "Plans",
    login: "Log in",
    quote: "Request a quote",
    hub: "Hub",
    platformPanel: "Platform admin",
    myBusiness: "My business",
    panelMockup: "Panel mockup",
    platformAdmin: "Platform administrator",
    logout: "Log out",
    language: "Language",
    corporateSite: "Dakinis Systems — corporate site",
    homeApp: "Go to Dakinis One home",
    byCompany: "by Dakinis Systems"
  },
  productHome: {
    kicker: "Dakinis One",
    h1: "Stop running your business on Excel.",
    tagline: "Sales, clients and inventory in one place.",
    lead: "No more jumping between Excel sheets, WhatsApp and paper. We migrate your data and support you through setup.",
    heroOutcomes: ["Sales", "Clients", "Inventory", "Appointments"],
    calcLink: "Calculate savings",
    viewPlans: "View plans & packages",
    pricingCtaKicker: "No surprises",
    pricingCtaTitle: "Control sales, clients and inventory without the hassle",
    pricingCtaLead:
      "We migrate your Excel, configure the system and support you through setup. 15+ years helping businesses with technology.",
    login: "Sign in",
    openHub: "Open Hub",
    seeAllDemos: "See all demos",
    requestDemo: "Request a demo",
    corporateSite: "Corporate site",
    trustKicker: "Why Dakinis?",
    trustTitle: "We don't just build software — we understand how businesses actually work",
    trustExperience: "15+ years working alongside businesses, universities and shops.",
    trustSubtitle: "Setup, support, data migration and training for real users.",
    trustStory:
      "Dakinis was built by someone who spent 15 years in IT support watching shops, universities and offices run their day on Excel, paper, WhatsApp and tools that don't talk to each other — not someone who only sells licences from a desk.",
    trustBullets: [
      "We know how users work because we've spent years training them and fixing their issues",
      "We migrate your spreadsheets, configure the system and stay with you through go-live",
      "Training included so your team can use it from day one"
    ],
    showcase: {
      kicker: "What it looks like",
      title: "Real problems, screens you understand",
      lead: "Real demo screenshots — starting with the pain almost every SMB shares: WhatsApp without context.",
      cta: "Try the interactive demo",
      items: [
        {
          key: "whatsapp",
          icon: "📱",
          problemLabel: "WhatsApp",
          title: "Still jumping between WhatsApp, Excel and the invoice?",
          text: "Customer messages → you see who they are, what they spent and their last purchase. No asking staff or opening sheets.",
          imageAlt: "WhatsApp conversation with linked client card: last purchase and total spent"
        },
        {
          key: "inventory",
          icon: "📊",
          problemLabel: "Inventory",
          title: "Still tracking stock in Excel?",
          text: "⚠️ Products below minimum and expiring this week — before you lose money on the shelf.",
          imageAlt: "Inventory panel with low-stock and expiry alerts"
        },
        {
          key: "sales",
          icon: "📈",
          problemLabel: "Sales",
          title: "How much did you sell this month?",
          text: "Check revenue, orders and monthly trend in seconds — without building tables by hand.",
          imageAlt: "Sales report with revenue, orders, average ticket and monthly bar chart"
        }
      ]
    },
    video: {
      kicker: "In 60 seconds",
      title: "From Excel and WhatsApp to one screen",
      lead: "The full journey in under a minute — no tech jargon.",
      playerAria: "Introduction video",
      placeholder: "Video coming soon",
      placeholderNote: "While we record the video, try the interactive demo or book a no-obligation call.",
      scenes: [
        "Still running your business on Excel and WhatsApp?",
        "When a customer messages…",
        "With Dakinis you see who they are, what they spent and what they bought.",
        "Control sales and inventory from one place.",
        "We help you migrate your data."
      ],
      cta: "Try the demo",
      ctaPricing: "View plans"
    },
    socialProof: {
      kicker: "Coming soon",
      title: "Real stories from businesses like yours",
      lead: "We're collecting our first testimonials. If you want to be a reference in your area, let's talk.",
      quotePreview:
        "«We went from 8 Excel sheets to one screen» — that's how your story will sound when we have it.",
      cta: "I want to be first"
    },
    gettingStarted: {
      kicker: "No fear of change",
      title: "How to get started with Dakinis",
      lead: "The biggest fear isn't the software — it's losing data, stopping the business or not knowing how to use it. That's why we go step by step with you.",
      steps: [
        { title: "We upload your Excel", text: "Your sheets and lists move into the system without losing history." },
        { title: "We set up your business", text: "Your sector, users and data ready to work." },
        { title: "We train your team", text: "Plain-language training — not a technical manual." },
        { title: "You start working", text: "Business as usual. You don't shut down to switch." }
      ],
      timeline: "Typical timeline: 1–3 days",
      reassurance: [
        "You don't lose your data",
        "You don't learn it alone",
        "You don't stop your business",
        "If something doesn't fit, we adjust it with you"
      ]
    },
    whatsIncluded: "Sales, clients and inventory in one place",
    screenItems: ["Sales", "Clients", "Inventory", "Appointments", "Reports", "Stock alerts"],
    whatsappPitch:
      "When a customer messages on WhatsApp, you see their history, purchases and data on the same screen — no copying back to Excel.",
    extrasHint:
      "WhatsApp, automations and advanced AI are there when your business already has the basics under control — you don't have to start there.",
    demosTitle: "See how it looks in your sector",
    demosLead:
      "Demos by business type — not generic software. Pick clinic, restaurant, salon or real estate.",
    valueKicker: "Before it costs you money",
    valueTitle: "Stay ahead of your inventory",
    valueBullets: [
      "Real-time stock with low-stock alerts",
      "Expiry control before you lose goods",
      "Automatic reports without building spreadsheets by hand"
    ]
  },
  commercial: {
    tryDemo: "Try demo",
    executive: {
      kicker: "Owner view",
      title: "Business summary",
      lead: "What the owner checks before inventory or CRM.",
      demoBadge: "Demo data",
      monthSales: "Monthly sales",
      newClients: "New clients",
      topProduct: "Top seller",
      estimatedProfit: "Estimated profit",
      alertsTitle: "Important alerts"
    },
    simulator: {
      kicker: "Savings calculator",
      title: "How many hours a week do you spend on Excel?",
      lead: "Pick a realistic estimate. Many SMBs don't count the time lost in sheets, copying data and hunting for information.",
      hoursLabel: "Hours per week on Excel and manual tasks",
      presetHours: "{hours} h/week",
      resultHours: "You lose roughly {hours} hours per month.",
      resultMoney: "That can mean about €{amount}/month in team time (at €18/h).",
      resultAutomation: "With Dakinis you can automate much of that work.",
      calcCta: "See how it would look for your business"
    },
    excelCompare: {
      kicker: "Comparison",
      title: "Still running your business on Excel?",
      lead: "Same business, less chaos: useful information in one place instead of scattered sheets.",
      colExcel: "Excel / loose WhatsApp",
      colDakinis: "Dakinis One",
      rows: [
        { excel: "Data scattered across sheets", dakinis: "Everything integrated in one panel" },
        { excel: "Manual inventory", dakinis: "Automated stock with alerts" },
        { excel: "No client follow-up", dakinis: "Client history and follow-up included" },
        { excel: "No online booking", dakinis: "Online booking and reminders" },
        { excel: "WhatsApp without history", dakinis: "WhatsApp integrated with the business" }
      ]
    },
    marketplace: {
      kicker: "Grow when you need to",
      title: "Start simple, add later",
      lead: "First you organise sales, clients and inventory. Everything else turns on when your business asks for it.",
      modules: {
        crm: { name: "CRM", defaultOn: true, roi: "Close more sales with automatic follow-up" },
        whatsapp: { name: "WhatsApp", defaultOn: true, roi: "Fewer no-shows and faster replies" },
        inventory: { name: "Inventory", defaultOn: true, roi: "Cut losses from expiry and stock-outs" },
        reservations: { name: "Reservations", defaultOn: true, roi: "Higher occupancy without manual calls" },
        ai: { name: "AI", defaultOn: false, roi: "Useful answers for owners, not developers" },
        portal: { name: "Client portal", defaultOn: false, roi: "Self-service and less front-desk load" }
      }
    },
    ai: {
      kicker: "AI for business",
      title: "Questions an owner would actually ask",
      lead: "No tech jargon: actionable answers about your operation.",
      answerLabel: "Demo answer",
      hint: "Tap a question to see a sample answer.",
      questions: {
        restock: {
          prompt: "What should I restock?",
          answer:
            "Jalapeños (expires in 3 days, 2 portions left), 00 flour (below minimum) and fryer oil. Suggested order: 4 kg jalapeños, 10 kg flour."
        },
        inactive: {
          prompt: "Which clients haven't bought in 30 days?",
          answer:
            "12 clients with no visit in 30+ days. Top 3 by ticket: García (€84), Ortega (€62), Vega (€58). WhatsApp reactivation campaign ready with 8% discount."
        },
        cancellations: {
          prompt: "Which bookings might cancel?",
          answer:
            "4 Friday reservations unconfirmed on WhatsApp. High risk: table T4 20:00 and terrace T2 21:30. Send automatic reminder before 18:00."
        },
        noShow: {
          prompt: "Who is at risk of no-show?",
          answer:
            "6 appointments tomorrow unconfirmed. Priority: Botox 10:30 (VIP) and colour 16:00 (new client). WA reminder scheduled 24h and 2h before."
        },
        upsell: {
          prompt: "Where can I sell more?",
          answer:
            "18 patients with facial treatment without peeling upsell. 4 open quotes > €400. Suggestion: post-treatment pack with 12% extra margin."
        },
        followUp: {
          prompt: "Which leads need follow-up?",
          answer:
            "3 leads with no contact > 48h: city flat (Martínez), north penthouse (López), retail unit (Ruiz). WA follow-up template ready for each."
        },
        visits: {
          prompt: "Which viewings are at risk?",
          answer:
            "2 viewings unconfirmed tomorrow. 3-bed flat — hot lead, no reply since yesterday. Resend WhatsApp confirmation."
        }
      }
    },
    flow: {
      kicker: "Full process"
    },
    flows: {
      restaurante: {
        title: "From booking to sale in one flow",
        lead: "Not isolated screens: everything connected like real operations.",
        steps: [
          "Client books a table (web or WhatsApp)",
          "Waiter takes order on the floor plan",
          "Kitchen receives the ticket in real time",
          "Stock decreases when the sale closes",
          "Sale appears on the executive dashboard"
        ]
      },
      clinica: {
        title: "From appointment to payment without friction",
        lead: "Schedule, patient and billing in the same circuit.",
        steps: [
          "Patient books online",
          "Automatic reminders reduce no-shows",
          "Treatment logged in CRM record",
          "Consumables deducted from stock",
          "Billing and KPIs in business summary"
        ]
      },
      peluqueria: {
        title: "From web booking to higher ticket",
        lead: "Fewer empty slots and more repeat clients.",
        steps: [
          "Client books via web or Instagram",
          "Stylist sees chair-by-chair schedule",
          "Products used reduce stock",
          "WhatsApp asks for review and next visit",
          "Dashboard shows occupancy and average ticket"
        ]
      },
      inmobiliaria: {
        title: "From lead to close with follow-up",
        lead: "No contact lost between Excel and WhatsApp.",
        steps: [
          "Lead enters from web or portal",
          "CRM assigns agent and next step",
          "Viewing confirmed on WhatsApp",
          "Offer and negotiation in pipeline",
          "Close reflected in executive report"
        ]
      }
    },
    roi: {
      restaurante: [
        "Cut losses from expiry and stock-outs",
        "Fewer order mistakes and faster table turnover",
        "Bookings with reminders: fewer empty tables"
      ],
      clinica: [
        "Fewer no-shows with automatic reminders",
        "Post-treatment follow-up that drives repeat visits",
        "Commercial view of each patient without spreadsheets"
      ],
      peluqueria: [
        "Fewer no-shows and more automatic bookings",
        "Stylist schedule: higher occupancy without chaos",
        "Return campaigns that boost recurrence"
      ],
      inmobiliaria: [
        "Automatic follow-up to close more deals",
        "Visible pipeline: no forgotten leads",
        "Coordinated viewings without double calls"
      ]
    }
  },
  inventoryLots: {
    kicker: "Inventory · lots",
    title: "Lot and expiry control",
    lead: "Receiving with internal QR, automatic FIFO and fridge map. Built for markets, restaurants and clinics.",
    demoMode: "Demo mode (not signed in)",
    loadError: "Could not load lots",
    receiveError: "Error registering receipt",
    scanError: "Lot not found",
    demoNotFound: "Demo lot not found",
    tabSummary: "Summary",
    tabReceive: "Receiving",
    tabFridges: "Fridge map",
    tabLots: "All lots",
    tabScan: "Scan QR",
    tabGuide: "Guide & costs",
    expire3d: "Expire in 3 days",
    expire7d: "Expire in 7 days",
    stockOk: "Stock OK",
    fifoNote: "On sale, the system deducts the lot that expires first (FIFO/FEFO).",
    receiveLead: "Scan the manufacturer EAN, enter lot and expiry, and generate the internal QR label.",
    productBarcode: "Product code (EAN)",
    productName: "Product name",
    productNamePlaceholder: "Whole milk 1L",
    supplierLot: "Supplier lot",
    expiry: "Expiry",
    quantity: "Quantity",
    location: "Location",
    supplier: "Supplier",
    receiveCta: "Register and generate QR",
    labelPreview: "Internal label",
    printLabel: "Print label",
    noLots: "No active lots in locations.",
    colCode: "QR code",
    colProduct: "Product",
    colLot: "Lot",
    colExpiry: "Expires",
    colQty: "Qty",
    colLocation: "Location",
    colStatus: "Status",
    scanLead: "Scan the label QR (LOT-2026-000123) or EAN for receiving.",
    scanHint: "Lot QR or product barcode",
    severity: {
      critical: "Urgent",
      warning: "Soon",
      ok: "OK",
      expired: "Expired",
      unknown: "—"
    },
    guideQrTitle: "Custom QR label (recommended)",
    guideQrLead: "The QR only stores the internal code; product, lot and expiry live in the database.",
    guideQrBullets: [
      "Format: LOT-2026-000123 — small, fast to read and scalable",
      "You can change data without reprinting if you fix it in the system",
      "Does not replace the manufacturer EAN: it's an internal lot label"
    ],
    guideCostTitle: "Thermal label cost",
    guideCostLead: "Very low for SMBs — no ink, printer €60–120.",
    guideCostBullets: [
      "40×30 mm label: ~€0.005–0.02 (€5–20 per 10,000 units)",
      "Cold/moisture-resistant paper (fridge): ~€0.01–0.03 per label",
      "Small market (~1,000 labels/month): ~€10–30/month"
    ],
    guideFridgeTitle: "Fridges and cold rooms",
    guideFridgeLead:
      "Stick one label per box or tray. Staff scan when storing and see product, lot, expiry and days left.",
    guideFifoTitle: "No label (€0 option)",
    guideFifoLead:
      "Register lot on goods in and let FIFO deduct the oldest on sale. Less physical control in the fridge."
  },
  demoCommercial: {
    kicker: "Commercial demo · {label}",
    title: "How you'd run your {label} with Dakinis One",
    lead: "Explore the interactive panel and see the return before you sign up.",
    panelKicker: "Your business operations",
    panelTitle: "Your day-to-day — {label}",
    openCommercialPanel: "Open commercial panel",
    tryInteractive: "Try live operations"
  },
  hub: {
    title: "Your workspace",
    lead: "Access clients, sales, inventory and connected apps for your business.",
    login: "Sign in",
    requestDemo: "Request a demo",
    sessionHello: "Signed in: {email} · business {business}",
    applicationsTitle: "Business modules",
    applicationsLead: "Clients, WhatsApp, inventory and more. Enable only what you need.",
    marketplaceTitle: "Connected apps",
    marketplaceLead: "Dakinis ecosystem tools you can link to your account.",
    productsTitle: "Ecosystem products",
    oneModulesTitle: "Dakinis One — modules",
    oneModulesLead: "Daily operations. Some modules need a Growth or Pro plan.",
    moduleLocked: "Not on your plan or not signed in",
    requiresPlanUpgrade: "Requires Growth or Pro plan",
    upgradePlanCta: "View plans",
    currentPlan: "Current plan: {plan}",
    requiresLogin: "Sign in required",
    platformAdmin: "Platform administration",
    ssoHint:
      "Signed in to Dakinis One. AkoeNet uses Dakinis account SSO (IdP) when VITE_DAKINIS_AUTH_URL is set.",
    ssoPending: "Manual sign-in",
    roadmap: "Coming soon",
    dashboard: {
      greeting: {
        morning: "Good morning, {name}",
        afternoon: "Good afternoon, {name}",
        evening: "Good evening, {name}"
      },
      guestName: "team",
      statApplications: "Applications: {count}",
      statMarketplace: "Marketplace: {count}",
      statTenant: "Tenant: {tenant}",
      statModules: "Active modules: {count}",
      statIntegrations: "Connected apps: {count}",
      statBusiness: "Business: {name}",
      tenantUnknown: "—",
      subtitle: "Everything happens here — your apps, notifications and AI in one place.",
      quickActions: "Quick actions",
      actionNewClient: "New customer",
      actionNewOrder: "New order",
      actionSendWhatsApp: "Send WhatsApp",
      actionOpenInventory: "Open inventory"
    },
    widgets: {
      lifeflowHint: "Your score went up this week.",
      viewSales: "View sales",
      openCalendar: "Open calendar",
      viewCommunity: "View community",
      aiHint: "I have 3 recommendations for today.",
      viewRecs: "View recommendations"
    },
    notifications: {
      title: "Notifications",
      scoreUp: "LifeFlow Score +12",
      newOrder: "New order in Core",
      published: "Video published on Stream",
      newUsers: "15 new users on AkoeNet",
      aiRec: "New AI recommendation"
    },
    timeline: {
      title: "Today's activity",
      invoice: "Invoice created",
      ai: "AI answered in Copilot",
      score: "LifeFlow score updated",
      customer: "New customer registered"
    }
  },
  cmdk: {
    title: "Search and commands",
    placeholder: "Search customers, open apps, ask AI…",
    noResults: "No results — try another term",
    hintNavigate: "↑↓ navigate · Enter run · Esc close",
    hintAi: "Ask Dakinis AI via «Ask Dakinis AI»"
  },
  footer: {
    navAria: "Footer links",
    copyright:
      "© {year} Dakinis Systems (Christian David Villar Colodro). All rights reserved.",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    legalNotice: "Legal notice",
    cookies: "Cookies",
    security: "Security",
    sla: "SLA",
    refunds: "Refunds",
    packages: "Plans",
    contact: "Contact",
    access: "Sign in"
  },
  home: {
    hero: {
      kicker: "PHASE 2 — Multi-tenant SaaS (SQLite MVP)",
      h1Line1: "Fewer cancellations.",
      h1Line2: "More clients.",
      h1Line3: "More control.",
      benefit:
        "Saves you time, keeps your business organised, and reduces mistakes with bookings, orders and follow-ups — no spreadsheet chaos.",
      demoLead:
        "Technical demo: each business has its own isolated environment and login; ready to grow with you.",
      ctaQuote: "Request a quote",
      ctaTalk: "Talk about your project",
      loginAdmin: "Admin login",
      viewDemos: "View system demos",
      stack: "Stack: React + Node + SQLite (PostgreSQL-ready).",
      cardLi1Prefix: "Data scoped by ",
      cardLi1Suffix: " in the API",
      cardLi2: "Mockups wired to the database",
      cardLi3: "JWT + master API key for development only"
    },
    modules: {
      title: "Demo tenants by business type",
      lead:
        "Seed slugs: clinica-demo, peluqueria-demo, inmobiliaria-demo, restaurante-demo. Dev API key:",
      adminCta: "Platform administration (businesses and users)",
      mockTitle: "Panel preview (mockup)",
      mockLead: "Static layout preview of how the product could look by vertical.",
      vistaPrefix: "Preview ·",
      sessionNote: "Session: you only see your business type (",
      sessionNoteEnd: ")."
    },
    pricing: {
      kicker: "Custom projects",
      maintenanceHeading: "Monthly maintenance",
      contactTitle: "Let’s talk",
      contactLead:
        "Tell us your idea and we’ll outline how to build it, what it would cost, and how long it would take.",
      emailCta: "Email us",
      whatsappCta: "WhatsApp"
    },
    demo: {
      title: "Dakinis One — technical demo",
      lead: "Explore demo tenants, mockups and JWT login. Postgres and Stripe in the next phase.",
      enterAdmin: "Enter as admin",
      viewSystems: "View systems"
    },
    demoTenant: {
      ribbonTitle: "You’re on a demo account",
      ribbonLead:
        "Explore the commercial dashboard with clients, sales, inventory and WhatsApp preloaded.",
      toPanel: "Open my functional panel",
      toMockup: "Open interactive mockup",
      benefitIntro: "Why try your vertical here:"
    }
  },
  systemDemo: {
    badge: "Commercial demo",
    accountLine: "Signed in as: {email}",
    businessLine: "Business: {name}",
    passwordLabel: "Password for this demo",
    benefitsTitle: "What to explore in this vertical",
    mockupPrimary: "Open panel mockup — {label}",
    toHome: "Back to home",
    functionalHint:
      "Below you can try daily operations for this sector with sample data.",
    dashboardPrimary: "Open my commercial panel",
    operationalPanel: "{label} operations",
    verticals: {
      clinica: {
        headline: "Clinic demo: fewer no-shows, more repeat visits",
        lead: "Schedule, CRM and stock with visible ROI for the clinic owner.",
        benefits: [
          "Fewer no-shows with automatic 24h and 2h reminders.",
          "Post-treatment follow-up that builds loyalty.",
          "Executive summary: appointments, billing and stock alerts."
        ]
      },
      peluqueria: {
        headline: "Salon demo: more bookings, fewer no-shows",
        lead: "Online schedule, reminders and owner dashboard in one place.",
        benefits: [
          "Fewer no-shows and more automatic bookings.",
          "Stylist schedule without double-booking.",
          "WhatsApp campaigns for clients who don't return."
        ]
      },
      restaurante: {
        headline: "Restaurant demo: from table to dashboard",
        lead: "Tap a table, add dishes and follow the flow through kitchen and cash close.",
        benefits: [
          "Cut losses from expiry and stock-outs.",
          "Floor plan: order, kitchen and payment connected.",
          "Executive dashboard with monthly sales and alerts."
        ]
      },
      inmobiliaria: {
        headline: "Real estate demo: close more deals",
        lead: "CRM, viewings and automatic follow-up without losing leads in Excel.",
        benefits: [
          "Automatic follow-up to close more transactions.",
          "Visual pipeline: from new lead to close.",
          "Alerts for untouched leads and at-risk viewings."
        ]
      }
    }
  },
  pricingPage: {
    kicker: "Plans",
    title: "Leave Excel behind and centralise your business",
    valueHeadline: "Sales, clients and inventory in one place.",
    valueSubheadline:
      "Control sales, clients and inventory without hassle. We migrate your data and train your team.",
    leadPoints: [
      "Clear monthly subscription",
      "Setup and Excel migration included at go-live",
      "Training for your team"
    ]
  },
  pricing: {
    clientIntro:
      "One clear monthly price for your day-to-day. We handle setup and Excel migration — you keep serving customers while the system gets ready.",
    includesTitle: "What's included",
    planCta: "I want this plan",
    stripeCta: "Subscribe",
    stripeLoading: "Redirecting to Stripe…",
    stripeError: "Could not open checkout. Try again or message us on WhatsApp.",
    planCtaWhatsapp: "I'd rather talk on WhatsApp",
    planWhatsappMessage:
      "Hello, I'm interested in the {plan} plan for Dakinis One (€{price}/month). Can we discuss setup and timeline?",
    planMailtoSubject: "Dakinis One — {plan} plan",
    selectedPlanLabel: "Selected plan: {plan} (€{price}/month)",
    contactMessageLabel: "Contact message:",
    selectPlanHint: "Click «I want this plan» on a card and the email and WhatsApp message will update automatically.",
    contactWhatsappCta: "Message on WhatsApp",
    recommendedBadge: "Most popular",
    quotaWaLead: "Integrated WhatsApp so you can reply to customers from the same panel.",
    quotaWaFootnote: "Up to {count} messages per month included.",
    quotaAiLead:
      "AI assistant to help you reply to customers, draft messages and manage information.",
    quotaAiFootnote: "Up to {count} interactions per month included.",
    implBridge:
      "The monthly fee is your software subscription. Setup is a one-time payment at the start, matched to the plan you choose.",
    problemsSolved: {
      title: "Sound familiar?",
      items: [
        "You hunt for one figure across three Excel sheets and a WhatsApp chat",
        "You don't know real stock until something's missing on the shelf",
        "Appointments slip because there's no automatic reminder",
        "Clients and sales tracked by hand — something's always out of date"
      ]
    },
    compare: {
      title: "Plan comparison",
      lead: "Everything essential in one table so you can see what each plan includes at a glance.",
      featureCol: "Feature",
      included: "Included",
      notIncluded: "Not included",
      rows: {
        crm: { label: "Clients and sales", starter: true, growth: true, pro: true },
        agenda: { label: "Schedule and appointments", starter: true, growth: true, pro: true },
        reservations: { label: "Online booking", starter: true, growth: true, pro: true },
        inventory: { label: "Inventory and stock", starter: false, growth: true, pro: true },
        whatsapp: { label: "WhatsApp in the panel", starter: false, growth: true, pro: true },
        analytics: { label: "Automatic reports", starter: false, growth: true, pro: true },
        ai: { label: "Advanced assistant", starter: false, growth: false, pro: true },
        automations: { label: "Automatic reminders", starter: false, growth: false, pro: true }
      }
    },
    implementationByPlan: {
      starter: {
        label: "Starter setup",
        range: "€199 – €300",
        description: "Basic configuration, initial data and one team training session."
      },
      growth: {
        label: "Growth setup",
        range: "€500",
        description: "Client and appointment migration, initial inventory and guided go-live."
      },
      pro: {
        label: "Pro setup",
        range: "€1,000+",
        description: "Full migration, automations and connections tailored to how you operate."
      }
    },
    customDev: {
      kicker: "Only if you need it",
      title: "Bespoke development",
      lead: "The standard solution is Dakinis One. Custom projects are for when your operations don't fit the monthly plans.",
      note: "They don't replace the subscription — they're one-off development, integration or migration work when the standard product isn't enough."
    },
    overageTitle: "If you exceed your quota",
    contactHint: "We reply with a concrete proposal: plan, setup and timeline — no fine print.",
    whatsappFabHint: "The green floating button uses the same message once you've picked a plan.",
    bos: {
      kicker: "Monthly subscription",
      title: "Pick a plan for the size of your business",
      subtitle:
        "Sales, clients, inventory and appointments in one place. One fixed monthly fee and we help you get started.",
      perMonth: "/month",
      recommended: "recommended",
      overageLead:
        "Overage: €{aiRate} / 1,000 extra AI queries (Pro plan) · €{waRate} / 500 extra WhatsApp messages.",
      implementationTitle: "Initial implementation (one-time)",
      implementationLead:
        "Each plan has its own setup range. You don't pay €500 if you start on Starter — the upfront cost matches the plan you choose.",
      projectsHint:
        "Need bespoke development or special integrations? See project packages on the corporate site or contact us.",
      servicesTitle: "Professional services",
      servicesLead: "Indicative rate: €{hourly}/h for customization, integrations and automations.",
      bundlesLead: "Typical fixed bundles: €{bundles} depending on scope.",
      examples: [
        "Data migration",
        "Vertical customization",
        "Integrations (WhatsApp, APIs)",
        "Custom automations"
      ],
      plans: {
        starter: {
          name: "Starter",
          tagline: "Your first digital step",
          audience: "For businesses starting to organise clients and bookings",
          outcome:
            "Ideal if you juggle WhatsApp, paper and spreadsheets today: centralise schedule, clients and reservations without paying for features you don't need yet.",
          includes: [
            "CRM with client history",
            "Team calendar and scheduling",
            "Bookings and reminders",
            "Client self-service booking portal"
          ]
        },
        growth: {
          name: "Growth",
          tagline: "Full daily operations",
          audience: "For businesses with stock, a team and active communication",
          outcome:
            "When scheduling alone isn't enough: control inventory, see business metrics and reach customers on WhatsApp with a monthly quota included.",
          includes: [
            "Everything in Starter",
            "Inventory and stock alerts",
            "Advanced CRM and sales pipeline",
            "Analytics and sector benchmarks",
            "Integrated WhatsApp (monthly quota included)"
          ]
        },
        pro: {
          name: "Pro",
          tagline: "Less manual work every day",
          audience: "For high-volume businesses that can't keep doing everything by hand",
          outcome:
            "Automate reminders, centralise WhatsApp and save time without hiring more admin staff.",
          valueAnchor:
            "Typically worth over €250/month if you bought several separate tools. Everything integrated in one platform.",
          includes: [
            "Everything in Growth",
            "Integrated AI assistant",
            "Automations and custom workflows",
            "Advanced WhatsApp with higher quota",
            "Access to the Dakinis Network ecosystem"
          ]
        }
      }
    },
    intro: {
      title: "Clear packages",
      subtitle:
        "We don’t sell loose hours: you choose a scope with a fixed price and timeline. On the call I recommend a specific package within these ranges — no vague “we’ll see”.",
      portfolioNote:
        "Reduced rates while I expand my portfolio of real projects; same proven base that speeds delivery.",
      valuePoints: [
        "I already have a foundation built — we don’t start from zero.",
        "That lowers cost, time and risk for you.",
        "Focused on solving your operations (time, mess, mistakes), not tech jargon."
      ]
    },
    deliveryLabel: "Delivery:",
    pack: {
      mvp: {
        badge: "Pack 1",
        name: "Fast MVP",
        audience: "For smaller clients — your entry offer",
        delivery: "5 – 10 days",
        pitch: "I’ll leave you with a working system in under 10 days so you can start operating.",
        includes: [
          "Basic login",
          "Functional panel",
          "1 module (schedule / clients / orders)",
          "Deployment included"
        ]
      },
      pro: {
        badge: "Pack 2",
        name: "Professional system",
        audience: "Your main product",
        delivery: "2 – 4 weeks",
        pitch: "I’ll build a complete system tailored to your business.",
        includes: [
          "Everything in the MVP +",
          "2–3 modules (schedule + CRM + automation)",
          "User roles",
          "UX improvements",
          "Scalable foundation"
        ]
      },
      advanced: {
        badge: "Pack 3",
        name: "Advanced bespoke solution",
        audience: "Only when your case needs it",
        delivery: "Scope-dependent (fixed in proposal)",
        pitch: "Integrations, business rules and automation when the standard offering isn’t enough.",
        includes: [
          "Integrations (WhatsApp, external APIs)",
          "Complex automations",
          "Logic specific to your operations"
        ]
      }
    },
    maintenancePitch:
      "After launch you can maintain and improve it step by step — no surprises.",
    maintenance: {
      priceFormat: "€{amount}/month",
      basic: {
        name: "Basic support",
        description: "Incidents, small tweaks and keeping the system healthy in production."
      },
      plus: {
        name: "Support + improvements",
        description: "Priority support and monthly capacity for small, guided improvements."
      }
    },
    implementation: {
      light: {
        label: "Light setup",
        description: "New account, basic catalogue or menu and one team training session."
      },
      standard: {
        label: "Standard implementation",
        description: "Client and appointment migration, vertical tweaks and guided go-live."
      },
      advanced: {
        label: "Advanced implementation",
        description: "Multiple active modules, business rules and connections for your real operations."
      },
      enterprise: {
        label: "Bespoke project",
        description: "Custom scope when your case needs integrations or special logic."
      }
    }
  },
  login: {
    kicker: "Sign in to your business",
    title: "Sign in",
    businessLead: "Manage clients, sales and inventory from one panel.",
    tryWithoutAccount: "No account? Try the commercial demo with zero setup:",
    demoPassword: "Demo password for all tenants:",
    demoAccounts: "Demo accounts",
    tenants: {
      clinic: "Aesthetic clinic",
      barber: "Premium barbershop",
      restaurant: "Premium restaurant",
      estate: "Real estate"
    },
    platformAdmin:
      "Platform — if the server sets DAKINIS_PLATFORM_TOTP_SECRET, a TOTP code is required in addition to the password.",
    email: "Email",
    password: "Password",
    totpLabel: "TOTP code (platform administrator)",
    totpPlaceholder: "6 digits",
    submitting: "Signing in…",
    submit: "Sign in",
    submitLocalDev: "Local login (dev SQLite)",
    businessSlug: "Business (tenant slug)",
    back: "Back",
    errors: {
      totpRequired: "Enter the 6-digit code from your authenticator app.",
      noData:
        "Login: empty response. Check VITE_API_BASE_URL and that the seed exists in the database.",
      incomplete: "Incomplete login: missing token or business type in the response.",
      generic: "Login error",
      idpTenant: "Could not resolve business for SSO. Use local login or set tenant in the IdP JWT."
    },
    submitIdp: "Sign in with Dakinis account (SSO)",
    idpHint: "Ecosystem SSO needs the IdP and links AkoeNet without re-entering your password there.",
    legalHint: "By signing in you accept our",
    forgotPassword: "Forgot your password?"
  },
  forgotPassword: {
    kicker: "Account recovery",
    title: "Reset password",
    lead: "Enter your email and we will send a link valid for 24 hours.",
    mustChangeLead:
      "You must confirm your business and choose a new password. Request a link to your account email.",
    email: "Email",
    submitting: "Sending…",
    submit: "Send link",
    back: "Back to sign in",
    success: "If the email exists, you will receive a link within a few minutes.",
    errors: {
      generic: "Could not process the request"
    }
  },
  resetPassword: {
    kicker: "New password",
    title: "Confirm access",
    lead: "Choose a new password (minimum 8 characters).",
    newPassword: "New password",
    confirmPassword: "Repeat password",
    submitting: "Saving…",
    submit: "Save password",
    goLogin: "Go to sign in",
    success: "Password updated. You can sign in now.",
    errors: {
      noToken: "Missing link token. Use forgot password or your welcome email.",
      short: "Password must be at least 8 characters.",
      mismatch: "Passwords do not match.",
      generic: "Could not reset password"
    }
  },
  ecosystemLaunch: {
    title: "Opening product",
    redirecting: "Redirecting with a secure session…",
    invalidProduct: "Invalid product.",
    invalidTarget: "Destination URL is not configured."
  },
  legal: legalCoreEn,
  doc: {
    default: "Dakinis One | Scheduler + CRM + WhatsApp",
    login: "Sign in · Dakinis One",
    admin: "Platform administration · Dakinis One",
    faq: "FAQ · Dakinis One",
    privacy: "Privacy · Dakinis One",
    terms: "Terms · Dakinis One",
    legal: "Legal notice · Dakinis One",
    cookies: "Cookies · Dakinis One",
    refunds: "Refunds · Dakinis One",
    security: "Security · Dakinis One",
    sla: "SLA · Dakinis One",
    vista: "Preview · {label} · Dakinis One",
    sistema: "{label} · Dakinis One",
    app: "Dakinis App",
    hub: "Dakinis Hub",
    pricing: "Plans & packages · Dakinis One",
    checkoutSuccess: "Subscription confirmed · Dakinis One",
    allergies: "Allergy poster · Dakinis One"
  },
  checkout: {
    success: {
      kicker: "Payment",
      title: "Subscription activated!",
      genericTitle: "Thank you for subscribing",
      genericLead:
        "If you just paid on Stripe, your plan will be active shortly. If you do not have an account yet, we will follow up with next steps.",
      planActivated: "Your {plan} plan is being activated.",
      nextSteps:
        "Sign in with the same email you used on Stripe. For first access, check your welcome email or contact us.",
      verifying: "Confirming your payment…",
      errorTitle: "We could not verify the payment",
      error: "Invalid or expired checkout session.",
      goLogin: "Sign in",
      viewPlans: "View plans",
      backToPricing: "Back to pricing"
    }
  },
  vistaMockup: {
    kicker: "Preview",
    title: "What your {label} would look like",
    lead:
      "Visual layout for this business type. For live data, use the commercial panel.",
    home: "Home",
    platformAdmin: "Platform administration",
    goDemoSystem: "Open demo system",
    myFunctionalPanel: "My functional panel"
  },
  appNav: {
    aria: "App navigation",
    app: "App",
    crm: "CRM",
    clients: "👥 Clients",
    inventory: "📦 Inventory",
    sales: "💰 Sales",
    reports: "📊 Analytics",
    messages: "Messages",
    communications: "Communications",
    whatsapp: "💬 WhatsApp",
    hub: "Hub",
    settings: "Settings"
  },
  businessDemo: {
    hero: {
      title: "Your whole business in one place",
      lead: "Clients, sales, inventory, reports and WhatsApp connected — nothing to configure.",
      aiKicker: "AI assistant",
      aiTitle: "Ask Dakinis",
      aiLead: "Analyze clients, sales and inventory with your real business data.",
      askPlaceholder: "Ask about lost clients, sales trends, stock alerts…",
      askAria: "Ask Dakinis AI",
      askButton: "Ask",
      answerLabel: "Answer",
      loginForAi: "Sign in to use the AI assistant.",
      stubHint: "Dev mode without OpenAI. Add OPENAI_API_KEY in platform/ai/.env for GPT answers.",
      tiles: {
        clients: "Clients",
        inventory: "Inventory",
        sales: "Sales",
        reports: "Analytics",
        whatsapp: "WhatsApp"
      }
    },
    dashboard: {
      kicker: "Business overview",
      greeting: "Hello, {name}",
      lead: "What the owner checks first before running the day.",
      fallbackBusiness: "Your business",
      activeClients: "Active clients",
      monthSales: "Sales this month",
      products: "Products",
      conversion: "Conversion",
      ctaPipeline: "View sales pipeline",
      ctaWhatsapp: "Open WhatsApp",
      insightsTitle: "What matters today",
      insights: [
        "3 clients with no reply > 48 h — WhatsApp template ready",
        "Low stock on 7 SKUs — review supplier order",
        "Sales +12 % vs. last month — pipeline with 4 open proposals"
      ],
      trends: {
        clients: "+8 % vs. last month",
        sales: "+12 % vs. last month",
        products: "523 active SKUs",
        conversion: "+3 pts vs. quarter"
      }
    },
    clients: {
      kicker: "Clients",
      title: "Your client base",
      lead: "History, purchases and follow-up in one place.",
      demoHint: "Drag opportunities across columns to see how you track each sale."
    },
    sales: {
      kicker: "Sales",
      title: "Sales pipeline",
      lead: "Drag opportunities across stages and close faster.",
      realHint: "Connect live CRM to see your real pipeline."
    },
    pipeline: {
      aria: "Sales pipeline",
      sectionTitle: "Opportunities by stage",
      lead: "New lead",
      contacted: "Contacted",
      proposal: "Proposal",
      client: "Client"
    },
    whatsapp: {
      kicker: "WhatsApp",
      title: "Client conversations",
      pageLead:
        "When a customer messages you, see who they are, what they spent and what they bought — without hunting spreadsheets.",
      lead: "Every chat linked to the client: history, last purchase and spend in one place.",
      conversations: "Conversations",
      linkedClient: "Linked client",
      clientLabel: "Client",
      lastPurchase: "Last purchase",
      totalSpent: "Total spent",
      phone: "Phone"
    },
    options: {
      moreAria: "More options",
      defaultSubject: "this client",
      whatsapp: {
        clientHistory: "View CRM history",
        paymentLink: "Generate payment link",
        followUpTemplate: "Send follow-up template",
        assignAgent: "Assign to my team",
        addCampaign: "Add to campaign"
      },
      crm: {
        clientProfile: "View client profile",
        whatsappProposal: "Send proposal via WhatsApp",
        scheduleFollowUp: "Schedule follow-up",
        markWon: "Mark as won"
      },
      inventory: {
        reorderSupplier: "Order from supplier",
        adjustStock: "Adjust stock",
        linkToSale: "Link to sale",
        setAlert: "Minimum alert",
        exportList: "Export list"
      },
      reports: {
        exportPdf: "Export PDF report",
        shareWhatsapp: "Share via WhatsApp",
        comparePeriod: "Compare period",
        scheduleReport: "Schedule monthly send",
        drillDown: "View product detail"
      },
      dashboard: {
        exportSummary: "Export summary",
        shareTeam: "Share with team",
        setGoals: "Monthly goals"
      },
      feedback: {
        whatsapp: {
          clientHistory:
            "{name}'s history: purchases, appointments and chats in one place — no more spreadsheet hunting.",
          paymentLink: "Payment link generated for {name}. Send on WhatsApp and close the sale instantly.",
          followUpTemplate:
            "Template «Shall I reserve units?» ready for {name}. One tap and follow-up is automated.",
          assignAgent:
            "{name}'s chat assigned to your team. Everyone sees the same client context and history.",
          addCampaign:
            "{name} added to «Repeat customers» campaign with an automatic reminder in 7 days."
        },
        crm: {
          clientProfile: "{name}'s profile: contact, purchases, notes and linked WhatsApp conversations.",
          whatsappProposal:
            "Proposal sent to {name} on WhatsApp with acceptance link — tracked in your pipeline.",
          scheduleFollowUp: "Reminder set for {name} on Friday 10:00. No lead slips through the cracks.",
          markWon: "{name}'s opportunity marked as won. Sale recorded in this month's reports."
        },
        inventory: {
          reorderSupplier: "Supplier order started for {name}. Stock updates when goods arrive.",
          adjustStock: "{name} stock adjusted. Change logged in product history.",
          linkToSale: "{name} linked to active sale — inventory and ticket always aligned.",
          setAlert: "Minimum alert set for {name}. We warn you before you run out.",
          exportList: "Inventory list exported. Share with your team or accountant."
        },
        reports: {
          exportPdf: "PDF report for {name} ready to send to the owner or advisor.",
          shareWhatsapp: "Sales summary shared on WhatsApp — decisions without waiting for a desktop.",
          comparePeriod: "Comparison ready: +12 % revenue and +9 % orders vs. last month.",
          scheduleReport: "Monthly send scheduled. You'll get the report on the 1st automatically.",
          drillDown: "Product detail opened — see which SKUs drive growth."
        },
        dashboard: {
          exportSummary: "Executive summary for {name} exported — KPIs, alerts and pipeline in one PDF.",
          shareTeam: "Panel shared with your team. Everyone sees the same numbers in real time.",
          setGoals: "Monthly goals saved for {name}. Automatic tracking in reports."
        }
      }
    },
    inventory: {
      kicker: "Inventory",
      title: "Products and stock",
      lead: "Stock levels, low alerts and expiry tracking.",
      totalProducts: "SKUs",
      lowStock: "Low stock",
      lowStockPain: "⚠️ {count} products below minimum",
      expiring: "Expiring soon",
      expiringPain: "⚠️ {count} products expire this week",
      tableTitle: "Product list",
      tableLead: "Real-time stock linked to sales and orders.",
      tableSubject: "inventory",
      colProduct: "Product",
      colSku: "SKU",
      colStock: "Stock",
      colStatus: "Status",
      redirecting: "Opening operational inventory…",
      realHint: "Enable inventory in your operational vertical.",
      status: { ok: "OK", low: "Below minimum", expiry: "Expiring soon" },
      trends: {
        total: "Full catalogue",
        low: "Reorder needed",
        expiring: "Review this week"
      }
    },
    reports: {
      kicker: "Reports",
      title: "How much did you sell this month?",
      lead: "See your sales at a glance: revenue, orders and monthly trend.",
      revenue: "Revenue (30 d)",
      orders: "Orders",
      avgTicket: "Avg. ticket",
      chartTitle: "Sales trend",
      chartLead: "Monthly comparison — commercial activity index",
      chartAria: "Monthly sales bar chart",
      periodLabel: "Last 5 months",
      realHint: "Live reports unlock with your Analytics plan.",
      trends: {
        revenue: "+12 % vs. last month",
        orders: "+9 % vs. last month",
        avgTicket: "+4 % vs. last month"
      }
    },
    analytics: {
      kicker: "Analytics",
      title: "How much did you sell — and where do customers come from?",
      lead: "Sales, channels, funnel and sector benchmarks — decisions backed by data, not guesswork.",
      liveBadge: "Live data from your tenant",
      planHint: "Live benchmarks require a Growth or Pro plan. Showing reference demo view.",
      periodAria: "Analysis period",
      periods: { "7d": "7 days", "30d": "30 days", "90d": "90 days" },
      revenue: "Revenue",
      orders: "Orders",
      avgTicket: "Avg. ticket",
      conversion: "Conversion",
      salesTitle: "Sales trend",
      salesLead: "Monthly commercial activity index",
      chartAria: "Sales trend chart",
      channelsTitle: "Sales by channel",
      channelsLead: "Where revenue comes from — WhatsApp, in-store and web",
      channels: {
        whatsapp: "WhatsApp",
        salon: "In-store",
        web: "Web / bookings"
      },
      funnelTitle: "Sales funnel",
      funnelLead: "From visit to closed sale",
      funnel: {
        visits: "Visits / contacts",
        leads: "Qualified leads",
        proposals: "Proposals sent",
        sales: "Closed sales"
      },
      benchmarkTitle: "Sector comparison",
      benchmarkLead: "Your business vs. {industry} average",
      you: "You",
      sector: "Sector",
      topTitle: "Top performers",
      topLead: "Products and clients driving revenue",
      topProducts: "Products",
      topClients: "Clients",
      industries: {
        restaurante: "restaurants",
        clinica: "clinics & aesthetics",
        peluqueria: "salons & beauty",
        inmobiliaria: "real estate"
      },
      trends: {
        revenue: "+12 % vs. prior period",
        orders: "+9 % vs. prior period",
        avgTicket: "+4 % vs. prior period",
        conversion: "+3 pts vs. quarter"
      }
    },
    hub: {
      ctaTitle: "🚀 View business demo",
      ctaLead: "Open the commercial panel with clients, sales, inventory and reports preloaded.",
      ctaButton: "Open commercial dashboard",
      publicLead:
        "Explore the panel as a business owner: clients, sales, inventory, reports and WhatsApp preloaded — nothing to set up.",
      ctaButtonPublic: "Try free demo"
    }
  },
  mockupPanels: {
    demoBadge: "Demo view",
    roles: {
      owner: "Manager",
      reception: "Reception",
      waiter: "Floor",
      kitchen: "Kitchen",
      agent: "Sales"
    },
    clinica: {
      brand: "Your clinic",
      tabs: {
        resumen: "Overview",
        agenda: "Schedule",
        pacientes: "Clients",
        proveedores: "Inventory",
        whatsapp: "WhatsApp",
        ajustes: "Settings"
      },
      toolbar: {
        resumen: { title: "Today at the clinic", badge: "18 appointments", role: "owner", extra: "3 rooms" },
        agenda: { title: "Weekly schedule", badge: "Confirmed", role: "reception" },
        pacientes: { title: "Clients", badge: "182 records", role: "owner" },
        proveedores: { title: "Stock & suppliers", badge: "2 alerts", role: "owner" },
        whatsapp: { title: "WhatsApp", badge: "Reminders on", role: "reception" },
        ajustes: { title: "Business settings", badge: "Hours & branding", role: "owner" }
      },
      settingsNote: "Customize hours, logo and reminders when you activate your account."
    },
    restaurante: {
      brand: "Your restaurant",
      tabs: {
        mapa: "Tables",
        reservas: "Bookings",
        espera: "Waitlist",
        comandas: "Orders & pay",
        clientes: "Guests",
        alergenos: "Allergen poster",
        proveedores: "Suppliers"
      },
      toolbar: {
        mapa: { title: "Floor service", badge: "Terrace + dining", role: "waiter", extra: "52 covers" },
        reservas: { title: "Today's bookings", badge: "Full list", role: "reception", extra: "52 covers" },
        espera: { title: "Waitlist", badge: "3 groups", role: "reception", extra: "~22 min" },
        comandas: { title: "Orders & payment", badge: "Live", role: "waiter", extra: "Cash close" },
        clientes: { title: "Guest notes", badge: "2 allergy tables", role: "waiter" },
        alergenos: { title: "Allergen poster", badge: "QR in dining room", role: "owner" },
        proveedores: { title: "Suppliers", badge: "2 deliveries", role: "owner", extra: "This week" }
      },
      allergenPublicLead: "What diners see when scanning the table QR.",
      allergenQrHint: "Public poster ready to print or display.",
      comandasKicker: "Orders, tables & checkout · operational demo"
    },
    peluqueria: {
      brand: "Your salon",
      tabs: {
        hoy: "Today",
        estilistas: "Schedule",
        web: "Online booking",
        clientes: "Clients",
        productos: "Products",
        campanas: "WhatsApp"
      },
      toolbar: {
        hoy: { title: "Today's overview", badge: "4 stylists", role: "reception" },
        estilistas: { title: "Stylist schedule", badge: "No overlaps", role: "reception" },
        web: { title: "Web bookings", badge: "Channel live", role: "owner" },
        clientes: { title: "Clients", badge: "Active files", role: "reception" },
        productos: { title: "Products & orders", badge: "Stock OK", role: "owner" },
        campanas: { title: "WhatsApp campaigns", badge: "1 active", role: "owner" }
      }
    },
    inmobiliaria: {
      brand: "Your agency",
      tabs: {
        pipeline: "Sales",
        visitas: "Viewings",
        leads: "Opportunities",
        propiedades: "Properties",
        aliados: "Marketing",
        informes: "Reports"
      },
      toolbar: {
        pipeline: { title: "Sales pipeline", badge: "33 active", role: "agent" },
        visitas: { title: "Scheduled viewings", badge: "This week", role: "agent" },
        leads: { title: "Opportunities", badge: "By source", role: "agent" },
        propiedades: { title: "Properties", badge: "In portfolio", role: "agent" },
        aliados: { title: "Marketing & partners", badge: "Campaigns", role: "owner" },
        informes: { title: "Reports", badge: "Monthly", role: "owner" }
      }
    }
  },
  restaurant: {
    businessKicker: "Restaurant",
    businessTitle: "Floor, kitchen and inventory control",
    businessLead: "Tables, orders, payments and stock in one flow — no technical screens.",
    businessKpis: [
      { label: "Sales today", value: "€1,840" },
      { label: "Tables occupied", value: "12/18" },
      { label: "Kitchen orders", value: "7" }
    ],
    roleNav: "What do you want to do?",
    roleWaiter: "🍽️ Floor & tables",
    roleKitchen: "👨‍🍳 Kitchen",
    roleAdmin: "⚙️ Management",
    adminTitle: "Restaurant setup",
    adminLead: "Menu, floor plan, suppliers and inventory."
  },
  allergens: {
    panelTitle: "Allergens and intolerances (menu / kitchen)",
    panelLead:
      "Reference list (EU 14 allergens + extras). Mark Yes if the allergen is present on your menu or in the kitchen; the QR poster only shows marked items.",
    summary: "marked as present · {euCount} mandatory EU allergens",
    presentYes: "Present",
    presentNo: "Not present",
    notesPlaceholder: "Where it appears (e.g. flour, tapas, sauce…)",
    customSummary: "Other / custom",
    customPresent: "Present",
    customName: "Name",
    customNotes: "Notes",
    remove: "Remove",
    addCustom: "Add another",
    save: "Save and update poster",
    loginToEdit: "Sign in as restaurant admin to edit the checklist.",
    qrAlt: "Allergies QR",
    publicViewHint: "Public view (table): only allergens marked as present. Also:",
    saveOnceForQr: "Save the poster once to generate the link and QR.",
    saveError: "Allergens were not saved",
    publicTitle: "Allergy information",
    publicKicker: "Digital poster",
    publicLead:
      "Allergens and ingredients present on our menu or in the kitchen. Ask staff before ordering.",
    updated: "Updated:",
    declared: "allergen declared on menu",
    declaredPlural: "allergens declared on menu",
    emptyDeclared:
      "This venue has not declared allergens present on the menu. Ask staff.",
    dishCountOne: "menu item",
    dishCountMany: "menu items",
    dishTapHint: "— tap a dish to see its allergens",
    dishSearchLabel: "Search dish",
    dishSearchPlaceholder: "Search food or dish…",
    dishSearchClear: "Clear search",
    dishSearchResults: "of {total} on menu",
    dishSearchNoMatch: 'No dish matches "{query}". Try another name.',
    dishCategoryOther: "Dish",
    dishAllergenCount: "{count} allergens",
    dishNoAllergensShort: "No allergens declared",
    modalAllergens: "Allergens in this dish",
    modalClose: "Close",
    catalogSummaryToggle: "View summary by allergen type (EU)",
    mushroomTitle: "Mushrooms on menu",
    mushroomLead:
      "Select mushroom types that may be used (e.g. in noodles). Updates the public poster and UDON / Pad Thai / Noodles dishes.",
    mushroomEnable: "Enable mushroom declaration",
    mushroomSelected: "{count} types selected",
    mushroomNoneSelected: "No mushrooms selected (hidden on public poster).",
    modalMushrooms: "Mushrooms that may be present",
    qrUrlStable:
      "The QR link does not change when you save; only the poster content updates (no need to reprint the QR).",
    editTitle: "Edit poster (admin)",
    editLead:
      "Mark present allergens and save; the public poster updates immediately (same QR URL).",
    qrUrl: "QR URL:",
    ownerPrompt: "Are you the restaurant?",
    ownerLogin: "Sign in",
    ownerEditHint: "to edit the poster.",
    footerRef:
      "Reference: 14 mandatory allergens (EU). Only those marked present by the restaurant are listed.",
    loading: "Loading…",
    loadingEditor: "Loading editor…",
    retry: "Retry",
    tryDemo: "Try demo (restaurante-demo)",
    signIn: "Sign in",
    kitchenStock: "Kitchen / stock",
    scannedLink: "Scanned link: /alergenos/{token}",
    errorHint:
      "The QR must point to the link shown under Kitchen / stock after saving the poster. If the Railway API is outdated, redeploy Core Back and Core Front.",
    loadError: "Failed to load",
    editorLoadError: "Could not load editor",
    notFound: "Allergy poster not found"
  },
  kitchen: {
    loading: "Loading stock and recipes…",
    title: "Stock, recipes and production",
    lead:
      "Recipes (Manu): Pizza — 1 base with 1 kg flour, 600 ml water, 25 g salt, 10 g yeast. Empanadas — 3 dozen with 1 kg onion, ½ kg pepper, 1 kg meat, 36 shells, 4 eggs, ¼ jar olives. Sample order → ~4 bases and ~3 dozen.",
    leadDumpling:
      "Dumpling House recipes: Gyozas (8 pcs) — flour, chicken/pork/veg, soy sauce and sesame. Also veg noodles and spring rolls. «Load order» restocks; demo plan ~4 chicken gyoza batches, 2 pork and 3 noodle portions.",
    leadRestauranteDemo:
      "Demo menu: bag bites (cheddar/jalapeño ~9 pcs per ~50 portion; chicken ~11 from ~120) and choripán. Recipes consume inventory units.",
    inventory: "Current inventory",
    ingredient: "Ingredient",
    stock: "Stock",
    minimum: "Minimum",
    demoPurchase: "Load order",
    recipes: "Recipes and production",
    maxBatches: "Maximum (this recipe only): {count} batches",
    batches: "Batches",
    simulate: "Simulate consumption",
    registerProduction: "Register production",
    planOk: "Viable plan:",
    shortage: "Short {item}: need {needed}, have {available}",
    lastProductions: "Recent production runs",
    loadError: "Could not load kitchen/stock",
    simulateError: "Simulation failed",
    purchaseError: "Failed to register purchase",
    productionError: "Insufficient stock or production error",
    scanTitle: "Scan item (QR / barcode)",
    scanLead:
      "USB/Bluetooth wedge scanner (keyboard mode), device camera or photo. On read, add or remove stock for the matched item.",
    scanWedgeTitle: "Barcode scanner (USB / handheld)",
    scanWedgeHint:
      "Connect the scanner, click the field and scan. Most send Enter at the end. Supports EAN-13, EAN-8, UPC-A/E, Code 128, Code 39, etc.",
    scanWedgeInput: "Barcode scanner input",
    scanWedgePlaceholder: "Click here and scan with your reader…",
    scanWedgeFocus: "Focus field for scanner",
    scanOrCamera: "Or use the device camera",
    scanStart: "Start camera",
    scanStop: "Stop scanner",
    scanFlipCamera: "Switch camera",
    scanCameraRear: "Rear",
    scanCameraFront: "Front",
    scanImage: "Upload image",
    scanPlaceholder: "Camera / photo preview",
    scanCode: "Scanned code",
    scanCodePlaceholder: "Scan a code…",
    scanStabilizing: "Locking on barcode… hold the phone steady for a moment.",
    scanCodeCol: "Code",
    scanQtyLabel: "Quantity per scan",
    scanDirection: "Movement",
    scanIn: "+ Stock in",
    scanOut: "− Stock out",
    scanNotFound: "Code not found in this inventory.",
    scanUnknownPrompt: "New code: fill in the form to add this item to inventory.",
    scanAddProductLead: "Add item from scan",
    scanProductName: "Product / ingredient name",
    scanProductNamePlaceholder: "e.g. Olive oil 1L",
    scanProductUnit: "Unit",
    scanAddProduct: "Create and apply movement",
    scanAddProductCancel: "Cancel",
    scanProductCreated: "Item created and stock updated.",
    scanCreateError: "Could not create item",
    scanQtyInvalid: "Enter a quantity greater than zero.",
    scanMatched: "Matched (demo without API)",
    scanOk: "{name} — current stock: {qty}",
    scanError: "Failed to register scan",
    scanCameraError: "Could not access camera",
    scanImageFail: "No code detected in the image.",
    scanCodesHint: "Each item has a stable code (Code column). You can print QR labels with that value."
  },
  fermina: {
    subtitle: "Argentine food · orders & print",
    title: "Orders and invoicing",
    leadGeneric: "Order module for restaurants with menu in config.",
    newOrder: "New order",
    customer: "Customer",
    table: "Table / area",
    channel: "Channel",
    channelSalon: "Dine-in",
    channelTakeaway: "Takeaway",
    channelDelivery: "Own delivery",
    channelGlovo: "Glovo",
    channelUber: "Uber Eats",
    paymentMethod: "Payment method",
    paymentCash: "Cash",
    paymentCard: "Card",
    orderNotes: "Kitchen notes",
    sendKitchen: "Send to kitchen",
    invoiceCart: "Invoice cart",
    activeOrders: "Active orders",
    kitchenSentAt: "Sent {time}",
    kitchenElapsed: "{time} in kitchen",
    noOrders: "No orders yet.",
    print: "Print",
    invoice: "Invoice",
    invoicesTitle: "Invoices",
    invoiceType: "Invoice type",
    invoiceClient: "Customer (receipt)",
    invoiceManager: "Manager / accounting",
    taxId: "Tax ID",
    noInvoices: "No invoices yet.",
    colNumber: "Number",
    colType: "Type",
    colTotal: "Total",
    colItem: "Item",
    colQty: "Qty",
    colPrice: "Amount",
    printNow: "Print now",
    closePrint: "Close print view",
    printComanda: "Order #{n}",
    printFactura: "Invoice {n}",
    printBusiness: "Business",
    printOrderRef: "Order",
    printOrderTime: "Order time",
    portionHint: "{qty} pcs/portion (bag ~{pack})",
    loadError: "Could not load orders",
    orderError: "Failed to create order",
    statusError: "Failed to update status",
    invoiceError: "Failed to create invoice",
    dayCloseTitle: "End of day (reconciliation)",
    dayCloseLead: "Totals for delivered orders — reconcile cash and delivery apps when closing.",
    dayCloseDelivered: "{count} delivered",
    dayCloseByPayment: "By payment method",
    dayCloseByChannel: "By channel (Glovo / Uber / dine-in…)",
    dayCloseOrdersCol: "Orders",
    dayCloseCashTotal: "Cash register (delivered)",
    dayCloseEmpty: "Mark orders as delivered to include them in the close.",
    colChannel: "Channel",
    colPayment: "Payment",
    noOpenOrders: "No open orders.",
    cartSummary: "{total} € · {channel} · {payment}",
    flowLead: "Step flow: rate (channel) → order → payment. Operations and close-out in separate tabs.",
    viewMesas: "Tables",
    viewTarifa: "Rate",
    viewCobro: "Payment",
    viewActivas: "Active",
    viewCierre: "Day close",
    viewFacturas: "Invoices",
    tarifaTitle: "Channel and pricing",
    tarifaLead: "Choose where the order is sold. Menu prices come from your configured menu.",
    tarifaLocalGroup: "Dine-in / takeaway",
    tarifaAppGroup: "Apps (Glovo / Uber)",
    tarifaContinue: "Continue to order →",
    pedidoTitle: "Build order",
    pedidoTariff: "Rate: {channel}",
    pedidoChangeTariff: "Change",
    pedidoBackTarifa: "← Rate",
    pedidoGoCobro: "Go to payment →",
    pedidoClear: "Clear",
    pedidoUnits: "· {count} units",
    cobroTitle: "Payment",
    cobroEmpty: "Build the order first in the Order tab.",
    cobroQuestion: "How is the customer paying?",
    cobroBackPedido: "← Order",
    cobroTotal: "Total: {total} €",
    newOrderBtn: "+ New order"
  },
  restaurant: {
    roleNav: "Restaurant view",
    roleWaiter: "Waiters",
    roleKitchen: "Kitchen",
    roleAdmin: "Administration",
    waiterLead:
      "Add tables, drag to rearrange the floor, and tap a table to load the order (kitchen and payment).",
    kitchenLead: "Open tickets only: update status and reprint.",
    adminComandasLead: "End-of-day close-out and invoices.",
    adminTitle: "Restaurant administration",
    adminLead: "Suppliers, menu pricing, stock and floor layout.",
    adminFloorTitle: "Floor plan (layout)",
    adminFloorLead: "Add or remove tables and place them on the floor. Waiters use the same layout when ordering.",
    adminPricesTitle: "Menu prices",
    adminPricesEmpty: "No dishes in business configuration.",
    adminPricesSave: "Save prices",
    priceEur: "Price (€)",
    saving: "Saving…",
    floorSaveError: "Could not save floor plan",
    menuSaveError: "Could not save prices",
    floorPlan: "Floor plan",
    floorAdd: "Add table",
    floorRemove: "Remove selected table",
    floorDragHint: "Drag to move a table. Tap without dragging to open the order.",
    floorTapHint: "Tap a table to open the order.",
    floorDragTitle: "Drag to move",
    floorDragLegend: "Draggable",
    floorFree: "Free",
    floorBusy: "Open tab",
    floorSelected: "Selected",
    zoneSalon: "Dining room",
    zoneTerraza: "Terrace",
    zoneBarra: "Bar",
    mesasTitle: "Tables",
    mesasLead: "Tap a table on the floor plan, add items, send to kitchen or close with payment.",
    mesasOccupied: "{count} tables with orders",
    mesaSelectHint: "Select a table on the floor plan to open the order.",
    mesaNotesPlaceholder: "e.g. no spicy",
    mesaCloseLabel: "Close table:",
    mesaModalKicker: "Table order",
    mesaModalClose: "Close",
    mesaPayLabel: "Pay bill",
    mesaClear: "Clear table",
    kitchenQueue: "Kitchen queue"
  },
  system: {
    businessKicker: "Business: {name}",
    tenant: "Tenant: {slug}",
    resultsTitle: "Results you want in {label}",
    home: "Home",
    backToSystems: "Back to systems",
    openRealApp: "Open real app (/api/v1)",
    openDashboard: "Go to commercial panel",
    mockupPreview: "Panel preview (mockup)",
    sessionLocked:
      "Active session: you cannot switch vertical; only your business panel ({label}).",
    adaptedLead:
      "This view shows how Dakinis works for {label}: scheduling, client data and alerts, without exposing internals to demo visitors.",
    dailyOps: "Daily business operations",
    automations: "Active automations",
    quickActions: "Quick actions",
    suppliers: "Suppliers or partners",
    products: "Products or services by supplier",
    colName: "Name",
    colContact: "Contact",
    colScope: "Scope",
    colSupplier: "Supplier",
    colItem: "Item",
    colRef: "Ref.",
    colNotes: "Notes",
    dataLoad: "Data entry (persistence per tenant)",
    dataSectionDemo: "Sample records",
    recordsError: "Records API: {error}. Showing local or mixed data.",
    recordsErrorFriendly: "We could not sync right now. You can keep using sample data.",
    recordsSynced: "Data saved and ready to use.",
    saveEntity: "Save {entity}",
    listing: "Listing from database",
    noRecords: "No records yet for this tenant.",
    includes: "Your system includes",
    includesLead:
      "Functional pieces for your business type; technical detail and configuration stay under your control in implementation.",
    ctaPanel: "One panel per client, isolated data.",
    recordsLoadError: "Records could not be loaded",
    saveLocalFallback: "Saved locally only until the API is available"
  },
  admin: {
    restricted: "Restricted to platform administrators.",
    goLogin: "Go to login",
    kicker: "Platform",
    title: "Multi-tenant administration",
    lead:
      "Sign in with a platform admin account and the password configured on the server (usual demo seed: demo123). If the server sets DAKINIS_PLATFORM_TOTP_SECRET, also use the TOTP code at login. This view is at /admin or from Platform panel in the bar.",
    backHome: "Back to home",
    mockupsTitle: "Mockup views by vertical",
    mockupsLead:
      "Interactive panel mockups by business type (presentation only; no data persistence). Useful to review UX with demo tenants.",
    vistaButton: "Preview · {label}",
    other: "Other",
    loadError: "Failed to load data",
    createError: "Could not create business",
    saveError: "Could not save",
    typeCustomRequired:
      "Enter an identifier for the new type (letters, numbers and hyphens only; e.g. gym-central).",
    typeCustomEditRequired: "Enter an identifier for the custom type.",
    ownerHint:
      "Optional: first business owner. Email only generates a temporary password and sends it with a confirmation link.",
    ownerEmail: "Owner email",
    ownerEmailPlaceholder: "leave empty to add users later",
    ownerPasswordOptional: "Temporary password (optional)",
    ownerPasswordPlaceholder: "empty = generate and email",
    credentialsEmailed: "Credentials sent to {email}.",
    credentialsManual:
      "Email not sent (configure RESEND). Email: {email} · Temp password: {password} · Link: {url}",
    usersTitle: "Users",
    userEmail: "Email",
    userRole: "Role",
    userBusiness: "Business",
    userType: "Business type",
    editEmail: "Edit email",
    saveEmail: "Save",
    cancel: "Cancel",
    resendReset: "Resend reset",
    userEmailSaved: "Email updated.",
    resetEmailed: "Reset link sent to {email}.",
    resetManual: "Email not sent. Share manually with {email}: {url}",
    resetError: "Could not resend email",
    access: {
      column: "Access",
      manage: "Access",
      formTitle: "Tenant access control",
      action: "Action",
      actionSuspend: "Suspend",
      actionReactivate: "Reactivate",
      actionClose: "Close tenant",
      reason: "Reason",
      reasonLegal: "Legal / dispute",
      reasonAbuse: "Service abuse",
      reasonFraud: "Fraud",
      reasonContract: "Contract breach",
      reasonOther: "Other",
      note: "Internal note",
      notePlaceholder: "Internal reference, ticket, counsel…",
      apply: "Apply",
      error: "Could not update access",
      confirmSuspend: "Suspend this tenant? API access will be blocked except billing.",
      confirmReactivate: "Reactivate access? Stripe payment status will also apply.",
      confirmClose: "Permanently close this tenant? They will not be able to sign in.",
      state: {
        active: "Active",
        degraded: "Degraded (payment)",
        suspended: "Suspended",
        closed: "Closed"
      }
    },
    catalog: {
      title: "Ecosystem catalog (Hub / Landing)",
      lead:
        "Edit Hub products and modules. Saved to the database and, when the server can write the repo, syncs packages/shared-brand.",
      meta: "Source: {source} · updated: {updatedAt}",
      jsonLabel: "JSON (products + hubModules)",
      loading: "Loading catalog…",
      loadError: "Could not load catalog",
      saveError: "Could not save",
      saved: "Catalog saved. Hub and Landing will use it after reload.",
      save: "Save catalog",
      saving: "Saving…",
      reload: "Reload from server",
      invalidShape: "JSON must include a «products» array."
    }
  },
  app: {
    loginRequired: "Sign in to view your business panel.",
    goLogin: "Go to login",
    apiError: "Could not complete the action. Please try again.",
    dashboard: {
      title: "Business overview",
      kicker: "{name}",
      heading: "Control panel",
      lead: "Sales, clients and important alerts at a glance.",
      healthScore: "Business health",
      growthScore: "Growth",
      finance30d: "Revenue (30 days)",
      margin: "Margin {pct}%",
      benchmark: "Sector comparison",
      recommendations: "Suggestions to improve",
      aiAssistant: "Dakinis assistant",
      appointments: "Bookings",
      slots: "Time slots",
      canSchedule: "Check availability",
      link: "Booking link",
      whatsapp: "WhatsApp",
      rules: "Automations"
    },
    crm: {
      title: "CRM",
      heading: "Contacts & activities",
      lead: "Business core: the customer links reservations, orders, billing and WhatsApp.",
      leadPersisted:
        "Save contacts, notes and follow-ups. WhatsApp messages link automatically to each client.",
      loginLead: "Sign in to manage your clients.",
      notReadyFriendly: "The clients module is being activated. Try again shortly or contact support.",
      client: "Client",
      segment: "Segment",
      timeline: "Timeline",
      error: "CRM error",
      notReady: "CRM not migrated: run docs/supabase/schemas/04-crm-core.sql or restart local SQLite API.",
      search: "Search",
      searchPlaceholder: "Name, phone or email",
      refresh: "Refresh",
      loading: "Loading…",
      noContacts: "No contacts yet. Create one or receive a WhatsApp message.",
      aiHintInactive: "Check inactive customers — AI can suggest reactivation campaigns.",
      aiHintAction: "Open Copilot",
      newContact: "New contact",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email",
      saveContact: "Save contact",
      selectContact: "Select a contact from the list.",
      emptyTimeline: "No activities or messages yet.",
      timelineWhatsapp: "WhatsApp",
      activityType: "Activity type",
      activityNotes: "Notes",
      activityNotesPlaceholder: "Call, meeting, follow-up…",
      addActivity: "Log activity",
      journeyAria: "Customer journey",
      journeyHint: "Deals and sales pipeline: next sprint.",
      linkReservations: "Reservations & schedule",
      linkWhatsApp: "Communications",
      linkCommunications: "Communications",
      activity: {
        note: "Note",
        call: "Call",
        whatsapp: "WhatsApp",
        email: "Email",
        meeting: "Meeting",
        booking: "Booking",
        order: "Order"
      },
      journey: {
        client: "Customer",
        booking: "Booking",
        order: "Order",
        invoice: "Invoice",
        whatsapp: "WhatsApp",
        followUp: "Follow-up"
      }
    },
    messages: {
      title: "Messages",
      heading: "WhatsApp (demo API)",
      loginLead: "Sign in to use private tenant endpoints.",
      confirmation: "Appointment confirmation",
      reminder: "Reminder",
      reactivation: "Win-back",
      orderReady: "Order ready",
      lowStock: "Low stock",
      rulesTitle: "Event → message rules",
      rulesLead: "Planned automations (real delivery needs WhatsApp Business API).",
      preview: "Preview",
      error: "Message error"
    },
    communications: {
      title: "Communications",
      kicker: "Dakinis Communications",
      heading: "Conversations",
      lead: "Channels, automations and WhatsApp in one place. More channels coming soon.",
      loginLead: "Sign in to use communications for your tenant.",
      channelsTitle: "Channels",
      channels: {
        whatsapp: "WhatsApp",
        email: "Email",
        telegram: "Telegram",
        discord: "Discord",
        sms: "SMS",
        push: "Push"
      },
      automationsTitle: "Automations",
      automationsLead: "Rules tied to business events (preview available).",
      automations: {
        lowStock: "Low stock",
        bookingCreated: "Booking created",
        orderReady: "Order ready"
      },
      rulesConfigured: "Configured rules",
      ruleOn: "on",
      ruleOff: "off",
      whatsappToolsTitle: "WhatsApp",
      whatsappToolsLead: "Templates and previews via API (demo).",
      confirmation: "Appointment confirmation",
      reminder: "Reminder",
      reactivation: "Win-back",
      comingSoonTitle: "Coming soon",
      comingSoonItems: ["Omnichannel inbox", "Contextual AI", "Advanced templates"],
      preview: "Preview",
      previewResult: "Preview result",
      lastPreview: "Last preview",
      error: "Message error",
      legalHint: "WhatsApp Business API and Meta Business Tools: see sections 10–12 of the",
      legalLink: "privacy policy"
    },
    whatsapp: {
      title: "WhatsApp",
      kicker: "Messaging",
      heading: "WhatsApp Business",
      lead: "Talk to clients and keep history linked to each profile.",
      loginLead: "Sign in to view your WhatsApp conversations.",
      navAria: "WhatsApp sections",
      nav: {
        conversations: "Conversations",
        contacts: "Contacts",
        templates: "Templates",
        automations: "Automations",
        ai: "AI"
      },
      conversationsLead: "All your client conversations in one place.",
      contactsLead: "Contacts from inbound messages or manual registration.",
      templatesLead: "Message previews; real sends use Meta-approved templates.",
      automationsLead: "Business rules tied to events (booking, orders, CRM).",
      aiLead: "Phase 5: OpenAI-assisted replies with CRM context (coming soon).",
      aiItems: [
        "Draft replies from thread history",
        "Conversation summary for your team",
        "CRM ticket from inbound message"
      ],
      threadList: "Conversations",
      noThreads: "No conversations yet. When a client writes, it will appear here.",
      selectThread: "Select a conversation",
      noContacts: "No contacts yet. They appear with the first inbound message.",
      unnamed: "Unnamed",
      noRules: "No rules loaded.",
      autoSendHint: "Auto-send: DAKINIS_WHATSAPP_AUTO_SEND=true on the server (requires phone on the event).",
      sendPhone: "Phone (E.164 without +)",
      sendMessage: "Message",
      send: "Send via WhatsApp",
      sending: "Sending…",
      sendError: "Could not send",
      refresh: "Refresh",
      loading: "Loading…",
      error: "WhatsApp error"
    },
    settings: {
      title: "Settings",
      lead: "Your business configuration, plan and team.",
      demoLead: "Advanced settings are simplified in the commercial demo.",
      demoHint: "To customize logo, hours and billing, request a production account.",
      businessName: "Business:",
      plan: "Plan:",
      user: "User:",
      role: "Role:",
      tenant: "Tenant:",
      type: "Type:",
      billingTitle: "Billing (hybrid BOS model)",
      billingPlan: "Plan {plan} · Base €{base}/month",
      billingAi: "AI: {queries} queries ({days} days)",
      billingAiIncluded: "included {count}",
      billingAiOverage: "overage +€{amount}",
      billingWhatsapp: "WhatsApp: {messages} msg (30d)",
      billingWhatsappIncluded: "included {count}",
      billingWhatsappOverage: "overage +€{amount}",
      billingEstimate: "Estimated next invoice:",
      billingStripePending: "(Stripe not connected)",
      restaurantBlock: "Restaurant — allergies and stock",
      restaurantLead: "Edit allergies and QR in",
      restaurantLink: "Restaurant system",
      publicAllergies: "Public poster:",
      logout: "Sign out"
    }
  }
};
