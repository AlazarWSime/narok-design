import { ensureSchema, getD1 } from "../../../db/runtime";

type ProductRow = {
  id: number; sku: string; category: "women" | "men" | "children";
  nameEn: string; nameAm: string; typeEn: string; typeAm: string;
  usd: number; etb: number; stock: number; image: string;
  imagePosition: "left" | "right"; madeToOrder: number; status: "active" | "draft" | "archived";
};

type SettingRow = { key: string; value: string };

export async function GET() {
  await ensureSchema();
  const db = getD1();
  const [result, settingRows] = await Promise.all([
    db.prepare(`SELECT id, sku, category, name_en AS nameEn, name_am AS nameAm,
      type_en AS typeEn, type_am AS typeAm, usd, etb, stock, image, image_position AS imagePosition,
      made_to_order AS madeToOrder, status FROM catalog_products WHERE status = 'active' ORDER BY id`).all<ProductRow>(),
    db.prepare("SELECT key, value FROM store_settings ORDER BY key").all<SettingRow>(),
  ]);
  const settings = Object.fromEntries(settingRows.results.map((row) => [row.key, row.value]));
  return Response.json({ products: result.results.map((row: ProductRow) => ({
    id: row.id, sku: row.sku, category: row.category,
    name: { en: row.nameEn, am: row.nameAm || row.nameEn },
    type: { en: row.typeEn, am: row.typeAm || row.typeEn },
    usd: row.usd, etb: row.etb, stock: row.stock, image: row.image,
    imagePosition: row.imagePosition, madeToOrder: Boolean(row.madeToOrder), status: row.status,
  })), settings: {
    storeName: settings.storeName || "NAROK DESIGN",
    announcement: settings.announcement || "Designed in Addis Ababa · Worldwide delivery",
    shippingThresholdEtb: Number(settings.shippingThresholdEtb) || 30000,
    currency: settings.currency === "USD" ? "USD" : "ETB",
  } }, { headers: { "cache-control": "no-store" } });
}

