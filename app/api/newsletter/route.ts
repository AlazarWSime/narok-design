import { checkRateLimit, ensureSchema, getD1 } from "../../../db/runtime";
import { normalizeNewsletterEmail } from "../../lib/submissionValidation";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 4_000) {
    return Response.json({ error: "Request is too large" }, { status: 413 });
  }
  const payload = await request.json().catch(() => null) as { email?: unknown; language?: unknown; website?: unknown } | null;
  if (typeof payload?.website === "string" && payload.website.trim()) return Response.json({ ok: true }, { status: 201 });
  const email = normalizeNewsletterEmail(payload?.email);
  if (!email) return Response.json({ error: "Enter a valid email address" }, { status: 400 });

  const rateLimit = await checkRateLimit(request, "newsletter", 8);
  if (!rateLimit.allowed) return Response.json({ error: "Please try again later" }, { status: 429 });

  await ensureSchema();
  const now = new Date().toISOString();
  await getD1().prepare(`INSERT INTO newsletter_subscribers (id, email, language, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET language = excluded.language, updated_at = excluded.updated_at`)
    .bind(crypto.randomUUID(), email, payload?.language === "am" ? "am" : "en", now, now)
    .run();
  return Response.json({ ok: true }, { status: 201 });
}
