CREATE TABLE `customer_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL,
	`last_signed_in_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_profiles_email` ON `customer_profiles` (`email`);
--> statement-breakpoint
PRAGMA optimize;
