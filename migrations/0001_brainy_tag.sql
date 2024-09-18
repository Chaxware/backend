PRAGMA foreign_keys=off;
--> statement-breakpoint
ALTER TABLE `user` RENAME TO `_user_old`;
--> statement-breakpoint
CREATE TABLE `user` (
    `id` text(21) PRIMARY KEY NOT NULL,
    `email` text(254),
    `username` text(32) NOT NULL,
    `display_name` text(32),
    `avatar` text,
    `about` text(1000),
    `verified` integer DEFAULT false NOT NULL,
    `last_seen` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer
);
--> statement-breakpoint
INSERT INTO `user` (`id`, `email`, `username`, `verified`, `last_seen`, `created_at`, `updated_at`)
    SELECT `id`, `email`, `username`, `verified`, `last_seen`, `created_at`, `updated_at`
    FROM `_user_old`;
--> statement-breakpoint
DROP TABLE `_user_old`;
--> statement-breakpoint
PRAGMA foreign_keys=on;
