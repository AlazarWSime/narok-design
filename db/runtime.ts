import { env } from "cloudflare:workers";

let schemaReady: Promise<void> | null = null;

const seedProducts = [
  [1, "ND-W-001", "Addis Tibeb Kemis", "አዲስ ጥበብ ቀሚስ", "Ready-made · Hand-finished", "ዝግጁ · በእጅ የተጠናቀቀ", "women", 220, 31000, 4, "/narok-women.png", "left", 0],
  [2, "ND-W-002", "Gondar Celebration Dress", "ጎንደር የበዓል ቀሚስ", "Made to order · Cotton", "በትዕዛዝ · ጥጥ", "women", 285, 40000, 0, "/narok-women.png", "right", 1],
  [3, "ND-M-001", "Shewa Men’s Ensemble", "የሸዋ ወንዶች ልብስ", "Made to order · Two-piece", "በትዕዛዝ · ሁለት ክፍል", "men", 190, 27000, 0, "/narok-men.png", "left", 1],
  [4, "ND-M-002", "Lalibela Ceremonial Set", "ላሊበላ የክብረ በዓል ልብስ", "Made to order · Woven detail", "በትዕዛዝ · የተሸመነ ጥበብ", "men", 240, 34000, 0, "/narok-men.png", "right", 1],
  [5, "ND-C-001", "Little Habesha Dress", "የልጆች ሐበሻ ቀሚስ", "Ready-made · Soft cotton", "ዝግጁ · ለስላሳ ጥጥ", "children", 95, 13500, 7, "/narok-children.png", "left", 0],
  [6, "ND-C-002", "Children’s Festive Set", "የልጆች የበዓል ልብስ", "Made to order · Custom color", "በትዕዛዝ · ብጁ ቀለም", "children", 110, 15500, 0, "/narok-children.png", "right", 1],
] as const;

export function getD1(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

export function ensureSchema() {
  if (schemaReady) return schemaReady;
  const db = getD1();
  schemaReady = db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS custom_orders (
      id TEXT PRIMARY KEY NOT NULL,
      full_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      garment TEXT NOT NULL,
      measurements TEXT NOT NULL,
      color TEXT NOT NULL,
      fabric TEXT NOT NULL,
      occasion TEXT NOT NULL DEFAULT '',
      needed_by TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      selected_product_ids TEXT NOT NULL DEFAULT '[]',
      language TEXT NOT NULL DEFAULT 'en',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_custom_orders_status_created_at ON custom_orders(status, created_at)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS submission_rate_limits (
      key TEXT PRIMARY KEY NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 1,
      reset_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS catalog_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      sku TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL DEFAULT '',
      type_en TEXT NOT NULL,
      type_am TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      usd INTEGER NOT NULL,
      etb INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL,
      image_position TEXT NOT NULL DEFAULT 'left',
      made_to_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_products_sku ON catalog_products(sku)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_catalog_products_status_category ON catalog_products(status, category)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS client_orders (
      id TEXT PRIMARY KEY NOT NULL,
      order_number TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_contact TEXT NOT NULL,
      items_json TEXT NOT NULL DEFAULT '[]',
      total_etb INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_client_orders_number ON client_orders(order_number)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_client_orders_status_created_at ON client_orders(status, created_at)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    ...seedProducts.map((product) => db.prepare(`INSERT OR IGNORE INTO catalog_products
      (id, sku, name_en, name_am, type_en, type_am, category, usd, etb, stock, image, image_position, made_to_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
      .bind(...product, "2026-08-21T00:00:00.000Z", "2026-08-21T00:00:00.000Z")),
    db.prepare(`INSERT OR IGNORE INTO store_settings (key, value, updated_at) VALUES
      ('storeName', 'NAROK DESIGN', '2026-08-21T00:00:00.000Z'),
      ('announcement', 'Designed in Addis Ababa · Worldwide delivery', '2026-08-21T00:00:00.000Z'),
      ('shippingThresholdEtb', '30000', '2026-08-21T00:00:00.000Z'),
      ('currency', 'ETB', '2026-08-21T00:00:00.000Z')`),
    db.prepare("PRAGMA optimize"),
  ]).then(() => undefined).catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}

export async function checkRateLimit(request: Request, scope: string, maximum: number, windowSeconds = 3600) {
  await ensureSchema();
  const db = getD1();
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forwarded));
  const visitorHash = Array.from(new Uint8Array(digest).slice(0, 12), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;
  const key = `${scope}:${visitorHash}`;

  await db.prepare(`INSERT INTO submission_rate_limits (key, attempts, reset_at)
    VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN reset_at <= ? THEN 1 ELSE attempts + 1 END,
      reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END`)
    .bind(key, resetAt, now, now, resetAt)
    .run();
  const row = await db.prepare("SELECT attempts, reset_at AS resetAt FROM submission_rate_limits WHERE key = ?")
    .bind(key)
    .first<{ attempts: number; resetAt: number }>();
  return { allowed: Boolean(row && row.attempts <= maximum), resetAt: row?.resetAt ?? resetAt };
}
