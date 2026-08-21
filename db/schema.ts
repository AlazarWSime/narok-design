import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const customOrders = sqliteTable("custom_orders", {
  id: text("id").primaryKey(),
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
