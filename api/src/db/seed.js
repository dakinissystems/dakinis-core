import bcrypt from "bcryptjs";

const DAKINIS_DEMO_PASSWORD = "demo123";

function dakinisHashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function dakinisSeed(db) {
  const businesses = [
    {
      id: "biz_platform_0001",
      slug: "dakinis-platform",
      name: "Dakinis (plataforma)",
      type: "platform",
      plan: "platform"
    },
    {
      id: "biz_00000000_0001",
      slug: "clinica-demo",
      name: "Clínica Demo (tenant)",
      type: "clinica",
      plan: "starter"
    },
    {
      id: "biz_00000000_0002",
      slug: "peluqueria-demo",
      name: "Peluquería Demo (tenant)",
      type: "peluqueria",
      plan: "starter"
    },
    {
      id: "biz_00000000_0003",
      slug: "inmobiliaria-demo",
      name: "Inmobiliaria Demo (tenant)",
      type: "inmobiliaria",
      plan: "starter"
    },
    {
      id: "biz_00000000_0004",
      slug: "restaurante-demo",
      name: "Restaurante Premium Demo (tenant)",
      type: "restaurante",
      plan: "starter"
    }
  ];

  const insertBusiness = db.prepare(`
    INSERT OR IGNORE INTO business (id, slug, name, type, plan, config_json)
    VALUES (@id, @slug, @name, @type, @plan, NULL)
  `);

  for (const b of businesses) {
    insertBusiness.run(b);
  }

  const passwordHash = dakinisHashPassword(DAKINIS_DEMO_PASSWORD);
  const platformTotpSecret = process.env.DAKINIS_PLATFORM_TOTP_SECRET?.trim() || null;
  const users = [
    {
      id: "usr_platform_1",
      business_id: businesses[0].id,
      email: "admin@dakinis-platform.local",
      role: "platform_admin",
      totp_secret: platformTotpSecret,
      totp_enabled: platformTotpSecret ? 1 : 0
    },
    { id: "usr_0001", business_id: businesses[1].id, email: "admin@clinica-demo.local", role: "admin" },
    { id: "usr_0002", business_id: businesses[2].id, email: "admin@peluqueria-demo.local", role: "admin" },
    { id: "usr_0003", business_id: businesses[3].id, email: "admin@inmobiliaria-demo.local", role: "admin" },
    { id: "usr_0004", business_id: businesses[4].id, email: "admin@restaurante-demo.local", role: "admin" }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
    VALUES (@id, @business_id, @email, @password_hash, @role, @totp_secret, @totp_enabled)
  `);

  for (const u of users) {
    insertUser.run({
      ...u,
      password_hash: passwordHash,
      totp_secret: u.totp_secret ?? null,
      totp_enabled: Number(u.totp_enabled ?? 0)
    });
  }

  if (platformTotpSecret) {
    db.prepare(
      `UPDATE users SET totp_secret = ?, totp_enabled = 1 WHERE id = 'usr_platform_1'`
    ).run(platformTotpSecret);
  } else {
    db.prepare(`UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = 'usr_platform_1'`).run();
  }

  const apiKeys = [{ key_value: "dakinis-read-key", business_id: businesses[2].id, role: "read-only" }];

  const insertKey = db.prepare(`
    INSERT OR IGNORE INTO tenant_api_keys (key_value, business_id, role)
    VALUES (@key_value, @business_id, @role)
  `);

  for (const k of apiKeys) {
    insertKey.run(k);
  }

  const seedRecords = [
    {
      id: "seed-c-1",
      business_id: businesses[1].id,
      entity: "paciente",
      payload: JSON.stringify({
        id: "seed-c-1",
        nombre: "Elena Suarez",
        tratamiento: "Botox",
        fecha: "2026-05-02",
        estado: "Confirmado"
      })
    },
    {
      id: "seed-c-2",
      business_id: businesses[1].id,
      entity: "paciente",
      payload: JSON.stringify({
        id: "seed-c-2",
        nombre: "Marta Ruiz",
        tratamiento: "Peeling",
        fecha: "2026-05-03",
        estado: "Pendiente"
      })
    },
    {
      id: "seed-p-1",
      business_id: businesses[2].id,
      entity: "reserva",
      payload: JSON.stringify({
        id: "seed-p-1",
        cliente: "Raquel Martin",
        servicio: "Corte + peinado",
        estilista: "Diana",
        hora: "10:30"
      })
    },
    {
      id: "seed-p-2",
      business_id: businesses[2].id,
      entity: "reserva",
      payload: JSON.stringify({
        id: "seed-p-2",
        cliente: "Alicia Perez",
        servicio: "Keratina",
        estilista: "Sofia",
        hora: "12:00"
      })
    },
    {
      id: "seed-i-1",
      business_id: businesses[3].id,
      entity: "lead",
      payload: JSON.stringify({
        id: "seed-i-1",
        nombre: "Carlos Diaz",
        propiedad: "Chalet zona norte",
        agente: "Mario",
        etapa: "Visita"
      })
    },
    {
      id: "seed-i-2",
      business_id: businesses[3].id,
      entity: "lead",
      payload: JSON.stringify({
        id: "seed-i-2",
        nombre: "Ana Torres",
        propiedad: "Oficina premium",
        agente: "Lucia",
        etapa: "Propuesta"
      })
    },
    {
      id: "seed-r-1",
      business_id: businesses[4].id,
      entity: "comanda",
      payload: JSON.stringify({
        id: "seed-r-1",
        cliente: "Pablo Vega",
        mesa: "Terraza 4",
        hora: "20:30",
        comensales: 4,
        estado: "Confirmada"
      })
    },
    {
      id: "seed-r-2",
      business_id: businesses[4].id,
      entity: "comanda",
      payload: JSON.stringify({
        id: "seed-r-2",
        cliente: "Lucia Ortega",
        mesa: "Interior 2",
        hora: "21:00",
        comensales: 2,
        estado: "En sala"
      })
    }
  ];

  const insertRecord = db.prepare(`
    INSERT OR IGNORE INTO tenant_records (id, business_id, entity, payload)
    VALUES (@id, @business_id, @entity, @payload)
  `);

  for (const r of seedRecords) {
    insertRecord.run(r);
  }

  const insertSupplyDelivery = db.prepare(`
    INSERT OR IGNORE INTO tenant_supply_deliveries (id, business_id, supplier, arrival_window, contents, status)
    VALUES (@id, @business_id, @supplier, @arrival_window, @contents, @status)
  `);
  const insertSupplyAlert = db.prepare(`
    INSERT OR IGNORE INTO tenant_supply_alerts (id, business_id, title, product_ref, condition_text, severity)
    VALUES (@id, @business_id, @title, @product_ref, @condition_text, @severity)
  `);

  const supplyDeliveriesSeed = [
    {
      id: "seed-sd-c1",
      business_id: businesses[1].id,
      supplier: "DermaMedical Dist.",
      arrival_window: "Mie 7 may · 09:00–11:00",
      contents: "Toxina 100 U x6, HA 1 ml x12",
      status: "Confirmado"
    },
    {
      id: "seed-sd-c2",
      business_id: businesses[1].id,
      supplier: "Laboratorio SkinPro",
      arrival_window: "Vie 9 may · tarde (almacén)",
      contents: "Kits post-peeling temporada",
      status: "En ruta"
    },
    {
      id: "seed-sd-p1",
      business_id: businesses[2].id,
      supplier: "ColorLux Professional",
      arrival_window: "Mar 6 may · mañana reparto zona norte",
      contents: "Tintes rubio/platinado + oxidantes",
      status: "Confirmado"
    },
    {
      id: "seed-sd-p2",
      business_id: businesses[2].id,
      supplier: "HairCare Mayorista",
      arrival_window: "Jue 8 may · ventana 14:00–16:00",
      contents: "Keratina y mascarillas pedido quincenal",
      status: "Programado"
    },
    {
      id: "seed-sd-i1",
      business_id: businesses[3].id,
      supplier: "Foto360 Interiors",
      arrival_window: "Jue 8 may · visita piso Avda. Sur",
      contents: "Sesion HDR + dron (tras llave comercial)",
      status: "Confirmado"
    },
    {
      id: "seed-sd-i2",
      business_id: businesses[3].id,
      supplier: "Portal Urbano Elite",
      arrival_window: "Online · renovación automática",
      contents: "Destacados zona norte — ciclo mensual",
      status: "Activo"
    },
    {
      id: "seed-sd-r1",
      business_id: businesses[4].id,
      supplier: "Mare Terra Alimentaria",
      arrival_window: "Cada ma · 07:30 (muelle cocina)",
      contents: "Pescado y marisco pedido fin de semana",
      status: "Recurrente"
    },
    {
      id: "seed-sd-r2",
      business_id: businesses[4].id,
      supplier: "Bodegas y suministro local",
      arrival_window: "Mie 7 may · 11:00",
      contents: "Vinos blanco/tinto carta + vermut barril",
      status: "Confirmado"
    }
  ];

  const supplyAlertsSeed = [
    {
      id: "seed-sa-c1",
      business_id: businesses[1].id,
      title: "Stock mínimo toxina",
      product_ref: "DM-TOX-100",
      condition_text: "Avisar si quedan menos de 6 unidades",
      severity: "warning"
    },
    {
      id: "seed-sa-c2",
      business_id: businesses[1].id,
      title: "Caducidad próxima HA",
      product_ref: "DM-HYA-01",
      condition_text: "Revisar lotes que caducan en los próximos 60 días",
      severity: "info"
    },
    {
      id: "seed-sa-p1",
      business_id: businesses[2].id,
      title: "Oxidante 20 vol.",
      product_ref: "CL-OX20-1L",
      condition_text: "Alerta si queda menos de 1 bote visible en sala técnica",
      severity: "warning"
    },
    {
      id: "seed-sa-p2",
      business_id: businesses[2].id,
      title: "Tinte rubio frío",
      product_ref: "CL-60BF",
      condition_text: "Reposición semanal si ventas > 8 unidades",
      severity: "info"
    },
    {
      id: "seed-sa-i1",
      business_id: businesses[3].id,
      title: "Destacados por expirar",
      product_ref: "PUE-ZN-30",
      condition_text: "Avisar 5 días antes del fin del destacado",
      severity: "warning"
    },
    {
      id: "seed-sa-i2",
      business_id: businesses[3].id,
      title: "Paquete foto estándar",
      product_ref: "F360-P120",
      condition_text: "Seguimiento si el informe de valoración no llega en 48 h",
      severity: "info"
    },
    {
      id: "seed-sa-r1",
      business_id: businesses[4].id,
      title: "Congelados mejillón",
      product_ref: "MT-MEJ-2",
      condition_text: "Pedido urgente si stock congelador < 4 bolsas",
      severity: "warning"
    },
    {
      id: "seed-sa-r2",
      business_id: businesses[4].id,
      title: "Lubina fin de semana",
      product_ref: "MT-LUBINA",
      condition_text: "Coordinar con carta si hay evento >40 cubiertos",
      severity: "info"
    }
  ];

  for (const d of supplyDeliveriesSeed) {
    insertSupplyDelivery.run(d);
  }
  for (const a of supplyAlertsSeed) {
    insertSupplyAlert.run(a);
  }
}

export { DAKINIS_DEMO_PASSWORD };
