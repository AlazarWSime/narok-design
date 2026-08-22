import { getChatGPTUser, isAdminEmail } from "../../../chatgpt-auth";
import { ensureSchema, getD1 } from "../../../../db/runtime";

type ActionPayload = { action?: string; [key: string]: unknown };
const categories = new Set(["women", "men", "children"]);
const productStatuses = new Set(["active", "draft", "archived"]);
const requestStatuses = new Set(["new", "contacted", "in_progress", "complete", "declined"]);
const orderStatuses = new Set(["new", "confirmed", "in_progress", "shipped", "complete", "refunded"]);

function text(value: unknown, limit = 180) { return typeof value === "string" ? value.trim().slice(0, limit) : ""; }
function integer(value: unknown, minimum = 0) { const parsed = Number(value); return Number.isInteger(parsed) && parsed >= minimum ? parsed : null; }

async function authorize() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (!isAdminEmail(user.email)) return Response.json({ error: "Administrator access required" }, { status: 403 });
  return null;
}

export async function POST(request: Request) {
  const authError = await authorize();
  if (authError) return authError;
  if (Number(request.headers.get("content-length") ?? 0) > 25_000) return Response.json({ error: "Request is too large" }, { status: 413 });
  const payload = await request.json().catch(() => null) as ActionPayload | null;
  if (!payload?.action) return Response.json({ error: "Invalid action" }, { status: 400 });
  await ensureSchema();
  const db = getD1();
  const now = new Date().toISOString();

  if (payload.action === "product.create") {
    const nameEn = text(payload.nameEn), nameAm = text(payload.nameAm), typeEn = text(payload.typeEn);
    const typeAm = text(payload.typeAm), category = text(payload.category), sku = text(payload.sku, 40).toUpperCase();
    const usd = integer(payload.usd), etb = integer(payload.etb), stock = integer(payload.stock);
    if (!nameEn || !typeEn || !sku || !categories.has(category) || usd === null || etb === null || stock === null) return Response.json({ error: "Complete all required product fields" }, { status: 400 });
    const image = category === "women" ? "/narok-women.png" : category === "men" ? "/narok-men.png" : "/narok-children.png";
    try {
      const result = await db.prepare(`INSERT INTO catalog_products (sku, name_en, name_am, type_en, type_am, category,
        usd, etb, stock, image, image_position, made_to_order, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(sku, nameEn, nameAm, typeEn, typeAm, category,
        usd, etb, stock, image, text(payload.imagePosition) === "right" ? "right" : "left", payload.madeToOrder ? 1 : 0,
        productStatuses.has(text(payload.status)) ? text(payload.status) : "draft", now, now).run();
      return Response.json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
    } catch { return Response.json({ error: "That SKU already exists" }, { status: 409 }); }
  }

  if (payload.action === "product.update") {
    const id = integer(payload.id, 1), stock = integer(payload.stock), status = text(payload.status);
    if (id === null || stock === null || !productStatuses.has(status)) return Response.json({ error: "Invalid product update" }, { status: 400 });
    await db.prepare("UPDATE catalog_products SET stock = ?, status = ?, updated_at = ? WHERE id = ?").bind(stock, status, now, id).run();
    return Response.json({ ok: true });
  }

  if (payload.action === "bespoke.update") {
    const id = text(payload.id, 80), status = text(payload.status);
    if (!id || !requestStatuses.has(status)) return Response.json({ error: "Invalid bespoke update" }, { status: 400 });
    await db.prepare("UPDATE custom_orders SET status = ? WHERE id = ?").bind(status, id).run();
    return Response.json({ ok: true });
  }

  if (payload.action === "bespoke.convert") {
    const id = text(payload.id, 80), totalEtb = integer(payload.totalEtb, 1);
    if (!id || totalEtb === null) return Response.json({ error: "Enter a valid quoted total" }, { status: 400 });
    const enquiry = await db.prepare(`SELECT id, full_name AS fullName, contact, garment, selected_product_ids AS selectedProductIds
      FROM custom_orders WHERE id = ? LIMIT 1`).bind(id).first<{ id: string; fullName: string; contact: string; garment: string; selectedProductIds: string }>();
    if (!enquiry) return Response.json({ error: "Enquiry not found" }, { status: 404 });
    const existing = await db.prepare("SELECT order_number AS orderNumber FROM client_orders WHERE source_enquiry_id = ? LIMIT 1")
      .bind(id).first<{ orderNumber: string }>();
    if (existing) return Response.json({ error: `Already converted to ${existing.orderNumber}` }, { status: 409 });
    let selectedIds: number[] = [];
    try {
      const parsed = JSON.parse(enquiry.selectedProductIds);
      if (Array.isArray(parsed)) selectedIds = parsed.filter((value): value is number => Number.isInteger(value));
    } catch { selectedIds = []; }
    const productRows = await db.prepare("SELECT id, sku, name_en AS nameEn FROM catalog_products ORDER BY id")
      .all<{ id: number; sku: string; nameEn: string }>();
    const productById = new Map(productRows.results.map((product) => [product.id, product]));
    const selected = selectedIds.map((productId) => productById.get(productId)).filter((product): product is { id: number; sku: string; nameEn: string } => Boolean(product));
    const items = selected.length
      ? selected.map((product) => ({ productId: product.id, sku: product.sku, name: product.nameEn }))
      : [{ productId: null, sku: "CUSTOM", name: enquiry.garment }];
    const orderId = crypto.randomUUID();
    const orderNumber = `ND-${now.slice(0, 10).replaceAll("-", "")}-${orderId.slice(0, 6).toUpperCase()}`;
    try {
      await db.batch([
        db.prepare(`INSERT INTO client_orders (id, source_enquiry_id, order_number, client_name, client_contact,
          items_json, total_etb, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`)
          .bind(orderId, id, orderNumber, enquiry.fullName, enquiry.contact, JSON.stringify(items), totalEtb, now, now),
        db.prepare("UPDATE custom_orders SET status = 'in_progress' WHERE id = ?").bind(id),
      ]);
      return Response.json({ ok: true, orderNumber }, { status: 201 });
    } catch { return Response.json({ error: "This enquiry could not be converted" }, { status: 409 }); }
  }

  if (payload.action === "order.update") {
    const id = text(payload.id, 80), status = text(payload.status);
    if (!id || !orderStatuses.has(status)) return Response.json({ error: "Invalid order update" }, { status: 400 });
    await db.prepare("UPDATE client_orders SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
    return Response.json({ ok: true });
  }

  if (payload.action === "settings.update") {
    const storeName = text(payload.storeName, 80), announcement = text(payload.announcement, 240);
    const shippingThresholdEtb = integer(payload.shippingThresholdEtb), currency = text(payload.currency, 3);
    if (!storeName || !announcement || shippingThresholdEtb === null || !["ETB", "USD"].includes(currency)) return Response.json({ error: "Complete all store settings" }, { status: 400 });
    const updates = [["storeName", storeName], ["announcement", announcement], ["shippingThresholdEtb", String(shippingThresholdEtb)], ["currency", currency]] as const;
    await db.batch(updates.map(([key, value]) => db.prepare(`INSERT INTO store_settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).bind(key, value, now)));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

