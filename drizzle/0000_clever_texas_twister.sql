CREATE TABLE `user` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`email` text(200) NOT NULL,
	`username` text(30) NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`last_seen` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
