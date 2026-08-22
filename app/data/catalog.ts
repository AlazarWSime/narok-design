export type Language = "en" | "am";
export type Category = "all" | "women" | "men" | "children";

export type Product = {
  id: number;
  sku?: string;
  category: Exclude<Category, "all">;
  name: Record<Language, string>;
  type: Record<Language, string>;
  usd: number;
  etb: number;
  image: string;
  imagePosition: "left" | "right";
  madeToOrder?: boolean;
  stock?: number;
  status?: "active" | "draft" | "archived";
};

export type StorefrontSettings = {
  storeName: string;
  announcement: string;
  shippingThresholdEtb: number;
  currency: "ETB" | "USD";
};

const categorySearchTerms: Record<Product["category"], string[]> = {
  women: ["women", "woman", "ሴቶች"],
  men: ["men", "man", "ወንዶች"],
  children: ["children", "child", "kids", "ልጆች"],
};

export function matchesProductSearch(product: Product, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  if (categorySearchTerms[product.category].includes(normalized)) return true;
  return [product.name.en, product.name.am, product.type.en, product.type.am, product.sku ?? ""]
    .some((value) => value.toLowerCase().includes(normalized));
}
