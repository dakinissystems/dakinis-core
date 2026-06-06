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
    packages: "Plans & contact",
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
    tagline: "Business Operating System for your business.",
    lead: "Plans from €29/month: CRM, scheduling, inventory and WhatsApp with included quotas and predictable overage.",
    login: "Sign in",
    openHub: "Open Hub",
    requestDemo: "Request a demo",
    corporateSite: "Corporate site",
    whatsappPitch:
      "Reach your customers on WhatsApp from Dakinis One — part of the ecosystem, not a bolt-on.",
    whatsIncluded: "Product modules",
    modules: ["CRM", "Communications", "Inventory", "Restaurant", "Reservations", "Invoicing (roadmap)"],
    bullet1: "Multi-tenant with isolated data per business",
    bullet2: "Verticals: clinic, restaurant, real estate, salon",
    bullet3: "Enter via the Hub and open StreamAutomator or AkoeNet when you need them"
  },
  hub: {
    title: "Dakinis Hub",
    lead: "Application center for Dakinis One and the ecosystem marketplace.",
    login: "Sign in",
    requestDemo: "Request a demo",
    sessionHello: "Signed in: {email} · business {business}",
    applicationsTitle: "Applications",
    applicationsLead:
      "Dakinis One modules: CRM, communications, reservations and inventory. Some need Growth or Pro.",
    marketplaceTitle: "Marketplace",
    marketplaceLead: "Connected products with SSO: StreamAutomator, AkoeNet and custom development.",
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
      tenantUnknown: "—",
      quickActions: "Quick actions",
      actionNewClient: "New customer",
      actionNewOrder: "New order",
      actionSendWhatsApp: "Send WhatsApp",
      actionOpenInventory: "Open inventory"
    }
  },
  footer: {
    navAria: "Footer links",
    copyright:
      "© {year} Dakinis Systems (trading name of Christian Villar). All rights reserved.",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    legalNotice: "Legal notice",
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
        "Use the mockup for an app-style panel preview, then scroll for tenant-persisted data. Password: demo123.",
      toPanel: "Open my functional panel",
      toMockup: "Open interactive mockup",
      benefitIntro: "Why try your vertical here:"
    }
  },
  systemDemo: {
    badge: "Demo (seed) account",
    accountLine: "Signed in as: {email}",
    passwordLabel: "Password for this demo",
    benefitsTitle: "What to explore in this vertical",
    mockupPrimary: "Open panel mockup — {label}",
    toHome: "Back to home",
    functionalHint:
      "Below: forms and tables with real per-tenant persistence (SQLite). The mockup is interactive layout only.",
    verticals: {
      clinica: {
        headline: "Clinic demo: scheduling and patients without the mess",
        lead: "Your data is isolated from other businesses. Pair the visual mockup with the functional flow below.",
        benefits: [
          "Mockup: browse the panel like the final app (no API).",
          "Functional panel: records stored in the database per tenant.",
          "Sample automations for reminders and commercial follow-up."
        ]
      },
      peluqueria: {
        headline: "Barbershop/salon demo: stylist agenda and bookings",
        lead: "See how shifts and suppliers fit in one place.",
        benefits: [
          "Mockup: preview of the salon with typical sections.",
          "Persisted demo data for appointments and stock hints.",
          "Quick paths to bookings and loyalty in the page content."
        ]
      },
      restaurante: {
        headline: "Restaurant demo: floor and daily operations",
        lead: "See how orders, shifts and alerts fit in one panel.",
        benefits: [
          "Mockup: front-of-house and back-of-house layout.",
          "Forms with persistence to simulate operational load.",
          "KPIs and copy focused on ticket and occupancy."
        ]
      },
      inmobiliaria: {
        headline: "Real estate demo: visits and sales pipeline",
        lead: "Combine leads, visits and suppliers in a demo aligned with your vertical.",
        benefits: [
          "Mockup: funnel and board to show your sales team.",
          "Per-tenant records for leads and follow-up.",
          "Suppliers and alerts like in real operations."
        ]
      }
    }
  },
  pricing: {
    clientIntro:
      "One clear monthly price for daily operations. No paying module by module — pick the plan that fits your business today and grow when you need to.",
    includesTitle: "What's included",
    planCta: "I want this plan",
    recommendedBadge: "Most popular",
    quotaWa: "{count} WhatsApp/month included",
    quotaAi: "{count} AI queries/month included",
    overageTitle: "If you exceed your quota",
    contactHint: "We reply with a concrete proposal: plan, setup and timeline — no fine print.",
    bos: {
      kicker: "BOS subscription",
      title: "Dakinis One monthly plans",
      subtitle:
        "CRM, scheduling, inventory and WhatsApp in one place. One fixed monthly fee with clear included quotas before you start.",
      perMonth: "/month",
      recommended: "recommended",
      overageLead:
        "Overage: €{aiRate} / 1,000 extra AI queries (Pro plan) · €{waRate} / 500 extra WhatsApp messages.",
      implementationTitle: "Initial implementation (one-time)",
      implementationLead: "Setup, migration and go-live scoped to your business complexity.",
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
          tagline: "Scale with AI and automation",
          audience: "For businesses that want to save time with technology",
          outcome:
            "Automate repetitive work, use AI day to day and connect the Dakinis ecosystem when you want to grow without hiring more admin staff.",
          includes: [
            "Everything in Growth",
            "Copilot and AI with a generous included quota",
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
    kicker: "Multi-tenant SaaS access",
    title: "Sign in",
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
    vista: "Preview · {label} · Dakinis One",
    sistema: "{label} · Dakinis One",
    app: "Dakinis App",
    hub: "Dakinis Hub",
    allergies: "Allergy poster · Dakinis One"
  },
  vistaMockup: {
    kicker: "Preview · layout only",
    title: "App-style panel — {label}",
    lead:
      "Visual example of how the app could look for this business type; no data persistence or API calls.",
    home: "Home",
    platformAdmin: "Platform administration",
    goDemoSystem: "Open demo system",
    myFunctionalPanel: "My functional panel"
  },
  appNav: {
    aria: "App navigation",
    app: "App",
    crm: "CRM",
    messages: "Messages",
    communications: "Communications",
    whatsapp: "WhatsApp",
    hub: "Hub",
    settings: "Settings"
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
    leadFermina:
      "Fermina Food: bag bites (cheddar/jalapeño ~9 pcs per portion from ~50; chicken ~11 from ~120) and choripán. Recipes consume inventory units.",
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
    kitchenElapsed: "{minutes} min in kitchen",
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
    tenant: "Tenant: {slug}",
    resultsTitle: "Results you want in {label}",
    home: "Home",
    backToSystems: "Back to systems",
    openRealApp: "Open real app (/api/v1)",
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
    recordsError: "Records API: {error}. Showing local or mixed data.",
    recordsSynced: "Latest data saved in your demo space and ready on screen.",
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
    loginRequired: "You must sign in to use the real JWT flow.",
    goLogin: "Go to login",
    apiError: "API call failed",
    dashboard: {
      title: "Private dashboard",
      kicker: "JWT tenant: {slug}",
      heading: "Dashboard API v1",
      lead: "Quick tests for appointments and WhatsApp using Authorization Bearer.",
      appointments: "Appointments",
      slots: "Slots",
      canSchedule: "Can schedule",
      link: "Link",
      whatsapp: "WhatsApp",
      rules: "Rules"
    },
    crm: {
      title: "CRM",
      heading: "Contacts & activities",
      lead: "Business core: the customer links reservations, orders, billing and WhatsApp.",
      leadPersisted:
        "Contacts and activities stored per tenant. Inbound WhatsApp messages auto-link to the customer record.",
      loginLead: "Sign in to use the real tenant via JWT.",
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
      kicker: "Hub · WhatsApp",
      heading: "WhatsApp Business",
      lead: "Conversations, contacts, templates, automations and AI in one module.",
      loginLead: "Sign in to connect your tenant to WhatsApp Business API.",
      navAria: "WhatsApp sections",
      nav: {
        conversations: "Conversations",
        contacts: "Contacts",
        templates: "Templates",
        automations: "Automations",
        ai: "AI"
      },
      conversationsLead: "Messages stored in PostgreSQL via webhook and API sends.",
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
      noThreads: "No conversations yet. Configure the webhook and send or receive a message.",
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
      lead: "Active session and real tenant context.",
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
