import { env } from "cloudflare:workers";

let schemaReady: Promise<void> | null = null;

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
