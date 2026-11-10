CREATE TABLE `work_chapters` (
	`work_slug` text NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`words` integer DEFAULT 0 NOT NULL,
	`voice_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`updated_at` integer,
	PRIMARY KEY(`work_slug`, `number`),
	FOREIGN KEY (`work_slug`) REFERENCES `works`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `works` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`note` text,
	`lang` text DEFAULT 'en' NOT NULL,
	`rating` text,
	`completion` text DEFAULT 'ongoing' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`tags_json` text,
	`ao3_link` text,
	`sort_order` integer DEFAULT 0,
	`published_at` integer,
	`created_at` integer,
	`updated_at` integer
);
