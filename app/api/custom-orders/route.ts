import { checkRateLimit, ensureSchema, getD1 } from "../../../db/runtime";
import { CustomOrderInput, validateCustomOrder } from "../../lib/submissionValidation";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) {
    return Response.json({ error: "Request is too large" }, { status: 413 });
  }
  const payload = await request.json().catch(() => null) as CustomOrderInput | null;
  if (!payload) return Response.json({ error: "Invalid JSON" }, { status: 400 });
  if (typeof payload.website === "string" && payload.website.trim()) return Response.json({ ok: true, reference: "RECEIVED" });
  const validation = validateCustomOrder(payload);
  if (!validation.ok) return Response.json({ error: validation.error }, { status: 400 });
  const { order } = validation;

  const rateLimit = await checkRateLimit(request, "custom-order", 5);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many enquiries. Please try again later." }, { status: 429, headers: { "retry-after": String(Math.max(1, rateLimit.resetAt - Math.floor(Date.now() / 1000))) } });
  }

  await ensureSchema();
  const id = crypto.randomUUID();
  await getD1().prepare(`INSERT INTO custom_orders
    (id, full_name, contact, garment, measurements, color, fabric, occasion, needed_by, notes, selected_product_ids, language, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`)
    .bind(id, order.name, order.contact, order.garment, order.measurements, order.color, order.fabric, order.occasion, order.deadline, order.notes, JSON.stringify(order.selectedProductIds), order.language, new Date().toISOString())
    .run();

  return Response.json({ ok: true, reference: id.slice(0, 8).toUpperCase() }, { status: 201 });
}
