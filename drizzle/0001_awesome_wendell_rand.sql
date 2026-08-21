CREATE TABLE `catalog_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`name_en` text NOT NULL,
	`name_am` text DEFAULT '' NOT NULL,
	`type_en` text NOT NULL,
	`type_am` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`usd` integer NOT NULL,
	`etb` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`image` text NOT NULL,
	`image_position` text DEFAULT 'left' NOT NULL,
	`made_to_order` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_catalog_products_sku` ON `catalog_products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_catalog_products_status_category` ON `catalog_products` (`status`,`category`);--> statement-breakpoint
CREATE TABLE `client_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`client_name` text NOT NULL,
	`client_contact` text NOT NULL,
	`items_json` text DEFAULT '[]' NOT NULL,
	`total_etb` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_orders_number` ON `client_orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_client_orders_status_created_at` ON `client_orders` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `store_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
