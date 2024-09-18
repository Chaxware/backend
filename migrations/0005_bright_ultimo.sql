CREATE TABLE `oauth_account` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text,
	PRIMARY KEY(`provider`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
