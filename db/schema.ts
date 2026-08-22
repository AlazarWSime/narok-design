import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const customOrders = sqliteTable("custom_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  fullName: text("full_name").notNull(),
  contact: text("contact").notNull(),
  garment: text("garment").notNull(),
  measurements: text("measurements").notNull(),
  color: text("color").notNull(),
  fabric: text("fabric").notNull(),
  occasion: text("occasion").notNull().default(""),
  neededBy: text("needed_by").notNull().default(""),
  notes: text("notes").notNull().default(""),
  selectedProductIds: text("selected_product_ids").notNull().default("[]"),
  language: text("language").notNull().default("en"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("idx_custom_orders_status_created_at").on(table.status, table.createdAt),
  index("idx_custom_orders_user_id_created_at").on(table.userId, table.createdAt),
]);

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  language: text("language").notNull().default("en"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_newsletter_subscribers_email").on(table.email),
]);

export const submissionRateLimits = sqliteTable("submission_rate_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(1),
  resetAt: integer("reset_at").notNull(),
});

export const catalogProducts = sqliteTable("catalog_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull(),
  nameEn: text("name_en").notNull(),
  nameAm: text("name_am").notNull().default(""),
  typeEn: text("type_en").notNull(),
  typeAm: text("type_am").notNull().default(""),
  category: text("category").notNull(),
  usd: integer("usd").notNull(),
  etb: integer("etb").notNull(),
  stock: integer("stock").notNull().default(0),
  image: text("image").notNull(),
  imagePosition: text("image_position").notNull().default("left"),
  madeToOrder: integer("made_to_order", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_catalog_products_sku").on(table.sku),
  index("idx_catalog_products_status_category").on(table.status, table.category),
]);

export const clientOrders = sqliteTable("client_orders", {
  id: text("id").primaryKey(),
  sourceEnquiryId: text("source_enquiry_id"),
  userId: text("user_id"),
  orderNumber: text("order_number").notNull(),
  clientName: text("client_name").notNull(),
  clientContact: text("client_contact").notNull(),
  itemsJson: text("items_json").notNull().default("[]"),
  totalEtb: integer("total_etb").notNull().default(0),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  shippingAddress: text("shipping_address").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_client_orders_number").on(table.orderNumber),
  uniqueIndex("idx_client_orders_source_enquiry_id").on(table.sourceEnquiryId),
  index("idx_client_orders_status_created_at").on(table.status, table.createdAt),
  index("idx_client_orders_user_id_created_at").on(table.userId, table.createdAt),
]);

export const storeSettings = sqliteTable("store_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const customerProfiles = sqliteTable("customer_profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
  lastSignedInAt: text("last_signed_in_at").notNull(),
}, (table) => [
  uniqueIndex("idx_customer_profiles_email").on(table.email),
]);
