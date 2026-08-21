CREATE TABLE `custom_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`contact` text NOT NULL,
	`garment` text NOT NULL,
	`measurements` text NOT NULL,
	`color` text NOT NULL,
	`fabric` text NOT NULL,
	`occasion` text DEFAULT '' NOT NULL,
	`needed_by` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`selected_product_ids` text DEFAULT '[]' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_custom_orders_status_created_at` ON `custom_orders` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_newsletter_subscribers_email` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `submission_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
