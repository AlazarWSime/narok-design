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
