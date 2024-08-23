ALTER TABLE `message` RENAME COLUMN `user_id` TO `author_id`;--> statement-breakpoint
ALTER TABLE `otp` ADD `email` text(254);--> statement-breakpoint
ALTER TABLE `otp` DROP COLUMN `user_id`;
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);