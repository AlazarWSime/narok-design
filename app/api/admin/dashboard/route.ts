import { getChatGPTUser, isAdminEmail } from "../../../chatgpt-auth";
import { ensureSchema, getD1 } from "../../../../db/runtime";

async function authorize() {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Authentication required" }, { status: 401 }) };
  if (!isAdminEmail(user.email)) return { error: Response.json({ error: "Administrator access required" }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;
  await ensureSchema();
  const db = getD1();
  const [products, bespoke, orders, subscribers, settings] = await Promise.all([
    db.prepare(`SELECT id, sku, name_en AS nameEn, name_am AS nameAm, type_en AS typeEn, type_am AS typeAm,
      category, usd, etb, stock, image, image_position AS imagePosition, made_to_order AS madeToOrder,
      status, created_at AS createdAt, updated_at AS updatedAt FROM catalog_products ORDER BY updated_at DESC, id`).all(),
    db.prepare(`SELECT id, full_name AS fullName, contact, garment, measurements, color, fabric, occasion,
      needed_by AS neededBy, notes, selected_product_ids AS selectedProductIds, language, status,
      created_at AS createdAt FROM custom_orders ORDER BY created_at DESC`).all(),
    db.prepare(`SELECT id, order_number AS orderNumber, client_name AS clientName, client_contact AS clientContact,
      items_json AS itemsJson, total_etb AS totalEtb, status, created_at AS createdAt,
      updated_at AS updatedAt FROM client_orders ORDER BY created_at DESC`).all(),
    db.prepare("SELECT COUNT(*) AS count FROM newsletter_subscribers").first<{ count: number }>(),
    db.prepare("SELECT key, value FROM store_settings ORDER BY key").all<{ key: string; value: string }>(),
  ]);
  return Response.json({
    user: { displayName: auth.user?.displayName },
    products: products.results,
    bespoke: bespoke.results,
    orders: orders.results,
    subscriberCount: subscribers?.count ?? 0,
    settings: Object.fromEntries(settings.results.map((row) => [row.key, row.value])),
  }, { headers: { "cache-control": "no-store" } });
}

