import { timestamps, id } from "@/db/column.helper";
import { workItems } from "@/db/schema/projects";
import { user } from "@/db/schema/auth";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const githubInstallations = sqliteTable(
  "github_installations",
  {
    id,
    githubInstallationId: integer("github_installation_id").notNull(),
    githubAccountLogin: text("github_account_login").notNull(),
    ...timestamps,
  },
  (t) => ([
    uniqueIndex("gh_installations_installation_id_ux").on(
      t.githubInstallationId,
    ),
    index("gh_installations_account_idx").on(t.githubAccountLogin),
  ]),
);

export const githubRepos = sqliteTable(
  "github_repos",
  {
    id,
    installationId: text("installation_id")
      .notNull()
      .references(() => githubInstallations.id, { onDelete: "cascade" }),

    githubRepoId: integer("github_repo_id").notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    defaultBranch: text("default_branch").notNull().default("main"),

    ...timestamps,
  },
  (t) => ([
    uniqueIndex("gh_repos_repo_id_ux").on(t.githubRepoId),
    uniqueIndex("gh_repos_owner_name_ux").on(t.owner, t.name),
    index("gh_repos_installation_idx").on(t.installationId),
  ]),
);

export const gitBranchLinks = sqliteTable(
  "git_branch_links",
  {
    id,
    workItemId: text("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    repoId: text("repo_id")
      .notNull()
      .references(() => githubRepos.id, { onDelete: "cascade" }),

    branchName: text("branch_name").notNull(),
    branchUrl: text("branch_url").notNull(),

    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: text("created_at").notNull(),
  },
  (t) => ([
    index("gbl_wi_idx").on(t.workItemId),
    index("gbl_repo_idx").on(t.repoId),
     uniqueIndex("gbl_wi_repo_branch_ux").on(
      t.workItemId,
      t.repoId,
      t.branchName,
    ),
  ]),
);

export const pullRequestLinks = sqliteTable(
  "pull_request_links",
  {
    id,
    workItemId: text("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    repoId: text("repo_id")
      .notNull()
      .references(() => githubRepos.id, { onDelete: "cascade" }),

    prNumber: integer("pr_number").notNull(),
    prTitle: text("pr_title").notNull(),
    prUrl: text("pr_url").notNull(),
    prState: text("pr_state").notNull().default("open"),

    lastSyncedAt: text("last_synced_at"),
  },
  (t) => ([
    index("prl_wi_idx").on(t.workItemId),
    index("prl_repo_idx").on(t.repoId),
    uniqueIndex("prl_repo_pr_ux").on(t.repoId, t.prNumber),
  ]),
);

export const commitLinks = sqliteTable(
  "commit_links",
  {
    id,
    workItemId: text("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    repoId: text("repo_id")
      .notNull()
      .references(() => githubRepos.id, { onDelete: "cascade" }),

    commitSha: text("commit_sha").notNull(),
    commitUrl: text("commit_url").notNull(),
    commitMessage: text("commit_message").notNull(),
    authorName: text("author_name"),
    committedAt: text("committed_at"),
  },
  (t) => ([
    index("cl_wi_idx").on(t.workItemId),
    index("cl_repo_idx").on(t.repoId),
    uniqueIndex("cl_repo_sha_ux").on(t.repoId, t.commitSha),
  ]),
);

