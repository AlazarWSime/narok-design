ALTER TABLE `client_orders` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `client_orders` ADD `payment_method` text DEFAULT 'bank_transfer' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_orders` ADD `payment_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_orders` ADD `shipping_address` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_client_orders_user_id_created_at` ON `client_orders` (`user_id`,`created_at`);