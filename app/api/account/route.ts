import { getChatGPTUser, isAdminEmail } from "../../chatgpt-auth";
import { ensureSchema, getD1 } from "../../../db/runtime";

type EnquiryRow = { id: string; garment: string; status: string; createdAt: string; neededBy: string };
type ProfileRow = { createdAt: string; lastSignedInAt: string };

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  await ensureSchema();
  const db = getD1();
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO customer_profiles (user_id, email, display_name, created_at, last_signed_in_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name,
      last_signed_in_at = excluded.last_signed_in_at`).bind(user.userId, user.email.toLowerCase(), user.displayName, now, now).run();
  const [enquiries, newsletter, profile] = await Promise.all([
    db.prepare(`SELECT id, garment, status, created_at AS createdAt, needed_by AS neededBy
      FROM custom_orders WHERE user_id = ? OR (user_id IS NULL AND lower(contact) = lower(?))
      ORDER BY created_at DESC LIMIT 20`).bind(user.userId, user.email).all<EnquiryRow>(),
    db.prepare("SELECT 1 AS subscribed FROM newsletter_subscribers WHERE lower(email) = lower(?) LIMIT 1").bind(user.email).first<{ subscribed: number }>(),
    db.prepare("SELECT created_at AS createdAt, last_signed_in_at AS lastSignedInAt FROM customer_profiles WHERE user_id = ? LIMIT 1").bind(user.userId).first<ProfileRow>(),
  ]);
  return Response.json({
    profile: {
      displayName: user.displayName,
      fullName: user.fullName,
      email: user.email,
      userId: user.userId,
      accountType: isAdminEmail(user.email) ? "Administrator" : "Customer",
      memberSince: profile?.createdAt ?? now,
      lastSignedInAt: profile?.lastSignedInAt ?? now,
    },
    enquiries: enquiries.results,
    newsletterSubscribed: Boolean(newsletter?.subscribed),
  }, { headers: { "cache-control": "private, no-store" } });
}

