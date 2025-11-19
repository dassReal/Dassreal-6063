CREATE TABLE `community_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`state` text,
	`country` text NOT NULL,
	`latitude` text,
	`longitude` text,
	`group_type` text NOT NULL,
	`meeting_schedule` text,
	`max_members` integer,
	`current_members` integer DEFAULT 0,
	`creator_id` text NOT NULL,
	`image_url` text,
	`website_url` text,
	`contact_email` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`idea_id` text NOT NULL,
	`amount` integer NOT NULL,
	`message` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`field_category` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`ai_assisted` integer DEFAULT false,
	`funding_goal` integer DEFAULT 0,
	`funding_raised` integer DEFAULT 0,
	`vote_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material_science_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material_science_items` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`ai_generated` integer DEFAULT false,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nfts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image_url` text NOT NULL,
	`prompt` text,
	`monetization_tips` text,
	`tags` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`idea_id` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshop_attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`workshop_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`registered_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workshops` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`location` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`max_attendees` integer,
	`current_attendees` integer DEFAULT 0,
	`skill_level` text DEFAULT 'beginner' NOT NULL,
	`tags` text,
	`image_url` text,
	`creator_id` text NOT NULL,
	`created_at` integer NOT NULL
);
