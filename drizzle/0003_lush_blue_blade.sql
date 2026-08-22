ALTER TABLE `client_orders` ADD `source_enquiry_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_orders_source_enquiry_id` ON `client_orders` (`source_enquiry_id`);--> statement-breakpoint
ALTER TABLE `custom_orders` ADD `user_id` text;--> statement-breakpoint
CREATE INDEX `idx_custom_orders_user_id_created_at` ON `custom_orders` (`user_id`,`created_at`);