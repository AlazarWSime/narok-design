import { ensureSchema, getD1 } from "../../../db/runtime";

type ProductRow = {
  id: number; sku: string; category: "women" | "men" | "children";
  nameEn: string; nameAm: string; typeEn: string; typeAm: string;
  usd: number; etb: number; stock: number; image: string;
  imagePosition: "left" | "right"; madeToOrder: number; status: "active" | "draft" | "archived";
};

export async function GET() {
  await ensureSchema();
  const result = await getD1().prepare(`SELECT id, sku, category, name_en AS nameEn, name_am AS nameAm,
    type_en AS typeEn, type_am AS typeAm, usd, etb, stock, image, image_position AS imagePosition,
    made_to_order AS madeToOrder, status FROM catalog_products WHERE status = 'active' ORDER BY id`).all<ProductRow>();
  return Response.json({ products: result.results.map((row) => ({
    id: row.id, sku: row.sku, category: row.category,
    name: { en: row.nameEn, am: row.nameAm || row.nameEn },
    type: { en: row.typeEn, am: row.typeAm || row.typeEn },
    usd: row.usd, etb: row.etb, stock: row.stock, image: row.image,
    imagePosition: row.imagePosition, madeToOrder: Boolean(row.madeToOrder), status: row.status,
  })) }, { headers: { "cache-control": "no-store" } });
}

