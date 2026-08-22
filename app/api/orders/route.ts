import { getChatGPTUser } from "../../chatgpt-auth";
import { checkRateLimit, ensureSchema, getD1 } from "../../../db/runtime";

type OrderItemInput = { productId?: unknown; quantity?: unknown };
type ProductRow = { id: number; sku: string; name: string; etb: number; stock: number; madeToOrder: number; status: string };
type AccountOrderRow = { id: string; orderNumber: string; itemsJson: string; totalEtb: number; paymentMethod: string; paymentStatus: string; status: string; createdAt: string };

const paymentMethods = new Set(["telebirr", "bank_transfer", "cash_on_delivery"]);
const paymentInstructions: Record<string, string> = {
  telebirr: "Your order is reserved. The atelier will send the verified Telebirr payment details before fulfilment begins.",
  bank_transfer: "Your order is reserved. The atelier will send the verified bank-transfer details before fulfilment begins.",
  cash_on_delivery: "Payment will be collected on delivery after the atelier confirms Addis Ababa delivery eligibility.",
};

function clean(value: unknown, limit: number) { return typeof value === "string" ? value.trim().slice(0, limit) : ""; }

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  await ensureSchema();
  const orders = await getD1().prepare(`SELECT id, order_number AS orderNumber, items_json AS itemsJson,
    total_etb AS totalEtb, payment_method AS paymentMethod, payment_status AS paymentStatus,
    status, created_at AS createdAt FROM client_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`)
    .bind(user.userId).all<AccountOrderRow>();
  return Response.json({ orders: orders.results }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return Response.json({ error: "Request is too large" }, { status: 413 });
  const limited = await checkRateLimit(request, "storefront-order", 5, 3600);
  if (!limited.allowed) return Response.json({ error: "Too many order attempts. Please try again later." }, { status: 429 });
  const payload = await request.json().catch(() => null) as { items?: OrderItemInput[]; fullName?: unknown; email?: unknown; phone?: unknown; address?: unknown; city?: unknown; paymentMethod?: unknown } | null;
  const fullName = clean(payload?.fullName, 120), email = clean(payload?.email, 180).toLowerCase();
  const phone = clean(payload?.phone, 60), address = clean(payload?.address, 500), city = clean(payload?.city, 100);
  const paymentMethod = clean(payload?.paymentMethod, 40);
  if (!fullName || !email.includes("@") || !phone || !address || !city || !paymentMethods.has(paymentMethod)) {
    return Response.json({ error: "Complete the delivery and payment details." }, { status: 400 });
  }
  if (!Array.isArray(payload?.items) || payload.items.length < 1 || payload.items.length > 12) {
    return Response.json({ error: "Your bag is empty or contains too many lines." }, { status: 400 });
  }
  const quantities = new Map<number, number>();
  for (const item of payload.items) {
    const productId = Number(item.productId), quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) return Response.json({ error: "Invalid bag quantity." }, { status: 400 });
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 5)) return Response.json({ error: "A maximum of five of each piece can be ordered." }, { status: 400 });

  await ensureSchema();
  const db = getD1();
  const ids = [...quantities.keys()];
  const products = await db.prepare(`SELECT id, sku, name_en AS name, etb, stock, made_to_order AS madeToOrder, status FROM catalog_products WHERE id IN (${ids.map(() => "?").join(",")})`)
    .bind(...ids).all<ProductRow>();
  if (products.results.length !== ids.length) return Response.json({ error: "One or more products are unavailable." }, { status: 409 });
  const items = products.results.map((product) => ({ productId: product.id, sku: product.sku, name: product.name, unitEtb: product.etb, quantity: quantities.get(product.id) ?? 1, madeToOrder: Boolean(product.madeToOrder) }));
  for (const product of products.results) {
    const quantity = quantities.get(product.id) ?? 0;
    if (product.status !== "active" || (!product.madeToOrder && product.stock < quantity)) return Response.json({ error: `${product.name} is no longer available in that quantity.` }, { status: 409 });
  }
  const totalEtb = items.reduce((sum, item) => sum + item.unitEtb * item.quantity, 0);
  const user = await getChatGPTUser();
  const now = new Date().toISOString(), orderId = crypto.randomUUID();
  const orderNumber = `ND-${now.slice(0, 10).replaceAll("-", "")}-${orderId.slice(0, 6).toUpperCase()}`;
  const contact = JSON.stringify({ email, phone });
  const shippingAddress = JSON.stringify({ address, city });
  const statements = products.results.filter((product) => !product.madeToOrder).map((product) => db.prepare("UPDATE catalog_products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?")
    .bind(quantities.get(product.id) ?? 0, now, product.id, quantities.get(product.id) ?? 0));
  statements.push(db.prepare(`INSERT INTO client_orders (id, source_enquiry_id, user_id, order_number, client_name, client_contact,
    items_json, total_etb, payment_method, payment_status, shipping_address, status, created_at, updated_at)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'new', ?, ?)`)
    .bind(orderId, user?.userId ?? null, orderNumber, fullName, contact, JSON.stringify(items), totalEtb, paymentMethod, shippingAddress, now, now));
  await db.batch(statements);
  if (user) await db.prepare(`INSERT INTO customer_profiles (user_id, email, display_name, created_at, last_signed_in_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name,
    last_signed_in_at = excluded.last_signed_in_at`).bind(user.userId, user.email.toLowerCase(), user.displayName, now, now).run();
  return Response.json({ ok: true, orderNumber, totalEtb, paymentStatus: "pending", paymentInstructions: paymentInstructions[paymentMethod], ownership: user ? "account" : "public" }, { status: 201 });
}
