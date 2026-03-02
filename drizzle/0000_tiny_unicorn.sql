CREATE TABLE `fic_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fic_id` text NOT NULL,
	`ip_hash` text NOT NULL,
	`reason` text DEFAULT 'broken_link',
	`status` text DEFAULT 'pending',
	`created_at` integer,
	FOREIGN KEY (`fic_id`) REFERENCES `fics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fics` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`link` text NOT NULL,
	`summary` text,
	`rating` text,
	`category` text,
	`status` text DEFAULT 'ongoing',
	`is_translated` integer DEFAULT false,
	`tags_json` text,
	`words` integer DEFAULT 0,
	`chapters` integer DEFAULT 1,
	`kudos` integer DEFAULT 0,
	`hits` integer DEFAULT 0,
	`comments` integer DEFAULT 0,
	`bookmarks` integer DEFAULT 0,
	`base_spice` integer DEFAULT 1,
	`base_angst` integer DEFAULT 1,
	`base_fluff` integer DEFAULT 1,
	`base_plot` integer DEFAULT 1,
	`base_romance` integer DEFAULT 1,
	`cached_vote_count` integer DEFAULT 0,
	`cached_spice_sum` integer DEFAULT 0,
	`cached_angst_sum` integer DEFAULT 0,
	`cached_fluff_sum` integer DEFAULT 0,
	`cached_plot_sum` integer DEFAULT 0,
	`cached_romance_sum` integer DEFAULT 0,
	`quote` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`fic_id` text NOT NULL,
	`ip_hash` text NOT NULL,
	`spice` integer,
	`angst` integer,
	`fluff` integer,
	`plot` integer,
	`romance` integer,
	`created_at` integer,
	PRIMARY KEY(`fic_id`, `ip_hash`),
	FOREIGN KEY (`fic_id`) REFERENCES `fics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shared_collections` (
	`share_id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'My Collection',
	`content_json` text NOT NULL,
	`created_at` integer
);
