CREATE TABLE `channel` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hub_id` text(21) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `hub` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`text` text(5000) NOT NULL,
	`channel_id` text(21) NOT NULL,
	`user_id` text(21) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `otp` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`user_id` text(21) NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`email` text(200) NOT NULL,
	`username` text(30) NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`last_seen` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);