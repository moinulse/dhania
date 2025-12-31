CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`system_role` text DEFAULT 'user',
	`avatar_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `commit_links` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`repo_id` text NOT NULL,
	`commit_sha` text NOT NULL,
	`commit_url` text NOT NULL,
	`commit_message` text NOT NULL,
	`author_name` text,
	`committed_at` text,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repo_id`) REFERENCES `github_repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cl_wi_idx` ON `commit_links` (`work_item_id`);--> statement-breakpoint
CREATE INDEX `cl_repo_idx` ON `commit_links` (`repo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cl_repo_sha_ux` ON `commit_links` (`repo_id`,`commit_sha`);--> statement-breakpoint
CREATE TABLE `git_branch_links` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`repo_id` text NOT NULL,
	`branch_name` text NOT NULL,
	`branch_url` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repo_id`) REFERENCES `github_repos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `gbl_wi_idx` ON `git_branch_links` (`work_item_id`);--> statement-breakpoint
CREATE INDEX `gbl_repo_idx` ON `git_branch_links` (`repo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gbl_wi_repo_branch_ux` ON `git_branch_links` (`work_item_id`,`repo_id`,`branch_name`);--> statement-breakpoint
CREATE TABLE `github_installations` (
	`id` text PRIMARY KEY NOT NULL,
	`github_installation_id` integer NOT NULL,
	`github_account_login` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gh_installations_installation_id_ux` ON `github_installations` (`github_installation_id`);--> statement-breakpoint
CREATE INDEX `gh_installations_account_idx` ON `github_installations` (`github_account_login`);--> statement-breakpoint
CREATE TABLE `github_repos` (
	`id` text PRIMARY KEY NOT NULL,
	`installation_id` text NOT NULL,
	`github_repo_id` integer NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`default_branch` text DEFAULT 'main' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`installation_id`) REFERENCES `github_installations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gh_repos_repo_id_ux` ON `github_repos` (`github_repo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gh_repos_owner_name_ux` ON `github_repos` (`owner`,`name`);--> statement-breakpoint
CREATE INDEX `gh_repos_installation_idx` ON `github_repos` (`installation_id`);--> statement-breakpoint
CREATE TABLE `pull_request_links` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`repo_id` text NOT NULL,
	`pr_number` integer NOT NULL,
	`pr_title` text NOT NULL,
	`pr_url` text NOT NULL,
	`pr_state` text DEFAULT 'open' NOT NULL,
	`last_synced_at` text,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`repo_id`) REFERENCES `github_repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `prl_wi_idx` ON `pull_request_links` (`work_item_id`);--> statement-breakpoint
CREATE INDEX `prl_repo_idx` ON `pull_request_links` (`repo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `prl_repo_pr_ux` ON `pull_request_links` (`repo_id`,`pr_number`);--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`uploaded_by_user_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`filename` text NOT NULL,
	`byte_size` integer NOT NULL,
	`content_type` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attachments_r2_key_ux` ON `attachments` (`r2_key`);--> statement-breakpoint
CREATE INDEX `attachments_wi_created_idx` ON `attachments` (`work_item_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `attachments_uploader_idx` ON `attachments` (`uploaded_by_user_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`work_item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`work_item_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `comments_wi_created_idx` ON `comments` (`work_item_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE TABLE `project_memberships` (
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`project_id`, `user_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pm_project_idx` ON `project_memberships` (`project_id`);--> statement-breakpoint
CREATE INDEX `pm_user_idx` ON `project_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `pm_role_idx` ON `project_memberships` (`role`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`linked_repo_id` text,
	`next_issue_number` integer DEFAULT 1 NOT NULL,
	`created_by_user` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by_user`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_key_ux` ON `projects` (`key`);--> statement-breakpoint
CREATE INDEX `projects_linked_repo_idx` ON `projects` (`linked_repo_id`);--> statement-breakpoint
CREATE TABLE `work_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`number` integer NOT NULL,
	`key` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'backlog' NOT NULL,
	`priority` text DEFAULT 'medium',
	`labels_json` text DEFAULT '[]' NOT NULL,
	`due_date` text,
	`parent_id` text,
	`reporter_user_id` text NOT NULL,
	`assignee_user_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`closed_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `work_items`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reporter_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`assignee_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wi_project_number_ux` ON `work_items` (`project_id`,`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `wi_project_key_ux` ON `work_items` (`project_id`,`key`);--> statement-breakpoint
CREATE INDEX `wi_project_status_idx` ON `work_items` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `wi_project_updated_idx` ON `work_items` (`project_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `wi_assignee_idx` ON `work_items` (`assignee_user_id`);--> statement-breakpoint
CREATE INDEX `wi_parent_idx` ON `work_items` (`parent_id`);--> statement-breakpoint
CREATE INDEX `wi_type_idx` ON `work_items` (`type`);