CREATE TABLE `otp` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`user_id` text(21) NOT NULL,
	`created_at` integer NOT NULL
);
