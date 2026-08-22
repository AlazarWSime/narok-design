import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensureSchema, getD1 } from "../../../db/runtime";
import type { Product } from "../../data/catalog";
import ProductDetail from "./ProductDetail";
import "./product.css";

export const dynamic = "force-dynamic";

type ProductRow = { id: number; sku: string; category: "women" | "men" | "children"; nameEn: string; nameAm: string; typeEn: string; typeAm: string; usd: number; etb: number; stock: number; image: string; imagePosition: "left" | "right"; madeToOrder: number };

async function loadProduct(id: string): Promise<(Product & { sku: string }) | null> {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) return null;
  await ensureSchema();
  const row = await getD1().prepare(`SELECT id, sku, category, name_en AS nameEn, name_am AS nameAm, type_en AS typeEn,
    type_am AS typeAm, usd, etb, stock, image, image_position AS imagePosition, made_to_order AS madeToOrder
    FROM catalog_products WHERE id = ? AND status = 'active' LIMIT 1`).bind(productId).first<ProductRow>();
  return row ? { id: row.id, sku: row.sku, category: row.category, name: { en: row.nameEn, am: row.nameAm || row.nameEn }, type: { en: row.typeEn, am: row.typeAm || row.typeEn }, usd: row.usd, etb: row.etb, stock: row.stock, image: row.image, imagePosition: row.imagePosition, madeToOrder: Boolean(row.madeToOrder), status: "active" } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: "Product not found | NAROK DESIGN", robots: { index: false, follow: false }, openGraph: { images: [] }, twitter: { images: [] } };
  const title = `${product.name.en} | NAROK DESIGN`;
  const description = `${product.type.en}. Designed in Addis Ababa and available ${product.madeToOrder ? "made to order" : "ready-made"}.`;
  return { title, description, openGraph: { title, description, type: "website", images: [{ url: product.image, alt: product.name.en }] }, twitter: { card: "summary_large_image", title, description, images: [product.image] } };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) redirect("/shop");
  return <ProductDetail product={product} />;
}
