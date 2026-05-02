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
}

export { DAKINIS_DEMO_PASSWORD };
