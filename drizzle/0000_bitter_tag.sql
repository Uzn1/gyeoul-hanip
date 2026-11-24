CREATE TABLE `flags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`place_id` integer NOT NULL,
	`duplicate_id` integer,
	`author_id` text NOT NULL,
	`reason` text NOT NULL,
	`notes` text NOT NULL,
	`at` integer NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`duplicate_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "flag_reason" CHECK("flags"."reason" in ('wrong_pin', 'duplicate'))
);
--> statement-breakpoint
CREATE TABLE `places` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`categories` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`directions` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`merged_into` integer
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`place_id` integer NOT NULL,
	`author_id` text NOT NULL,
	`status` text NOT NULL,
	`at` integer NOT NULL,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "visit_status" CHECK("visits"."status" in ('selling', 'sold_out', 'missing'))
);
--> statement-breakpoint
CREATE INDEX `visits_place_latest` ON `visits` (`place_id`,`at`,`id`);