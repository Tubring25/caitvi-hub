CREATE TABLE `curated_list_items` (
	`list_id` text NOT NULL,
	`fic_id` text NOT NULL,
	`curator_comment` text,
	`sort_order` integer DEFAULT 0,
	PRIMARY KEY(`list_id`, `fic_id`),
	FOREIGN KEY (`list_id`) REFERENCES `curated_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fic_id`) REFERENCES `fics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `curated_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`cover_mood` text,
	`sort_order` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `curated_lists_slug_unique` ON `curated_lists` (`slug`);