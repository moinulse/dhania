import { timestamps, id } from "@/db/column.helper";
import { user } from "@/db/schema/auth";
import {
  type AnySQLiteColumn,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const projects = sqliteTable(
  "projects",
  {
    id,
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    linkedRepoId: text("linked_repo_id"), // TODO: Add foreign key constraint

    nextIssueNumber: integer("next_issue_number").notNull().default(1),
    createdByUser: text("created_by_user")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("project_key_ux").on(t.key),
    index("projects_linked_repo_idx").on(t.linkedRepoId),
  ]
);

export const projectMemberships = sqliteTable(
  "project_memberships",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.userId] }),
    index("pm_project_idx").on(t.projectId),
    index("pm_user_idx").on(t.userId),
    index("pm_role_idx").on(t.role),
  ]
);

export const workItems = sqliteTable(
  "work_items",
  {
    id,
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    number: integer("number").notNull(),
    key: text("key").notNull(),

    title: text("title").notNull(),
    description: text("description"),

    type: text("type").notNull(),
    status: text("status").notNull().default("backlog"),
    priority: text("priority").default("medium"),
    labelsJson: text("labels_json").notNull().default("[]"),
    dueDate: text("due_date"),

    parentId: text("parent_id").references(
      (): AnySQLiteColumn => workItems.id,
      {
        onDelete: "set null",
      }
    ),

    reporterUserId: text("reporter_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    assigneeUserId: text("assignee_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    ...timestamps,
    closedAt: text("closed_at"),
  },
  (t) => [
    uniqueIndex("wi_project_number_ux").on(t.projectId, t.number),
    uniqueIndex("wi_project_key_ux").on(t.projectId, t.key),
    index("wi_project_status_idx").on(t.projectId, t.status),
    index("wi_project_updated_idx").on(t.projectId, t.updatedAt),
    index("wi_assignee_idx").on(t.assigneeUserId),
    index("wi_parent_idx").on(t.parentId),
    index("wi_type_idx").on(t.type),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id,
    workItemId: text("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("comments_wi_created_idx").on(t.workItemId, t.createdAt),
    index("comments_user_idx").on(t.userId),
  ]
);

export const attachments = sqliteTable(
  "attachments",
  {
    id,
    workItemId: text("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),

    uploadedByUserId: text("uploaded_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    r2Key: text("r2_key").notNull(),
    filename: text("filename").notNull(),
    byteSize: integer("byte_size").notNull(),
    contentType: text("content_type").notNull(),

    createdAt: text("created_at").notNull(),
  },
  (t) => [
    uniqueIndex("attachments_r2_key_ux").on(t.r2Key),
    index("attachments_wi_created_idx").on(t.workItemId, t.createdAt),
    index("attachments_uploader_idx").on(t.uploadedByUserId),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(user, {
    fields: [projects.createdByUser],
    references: [user.id],
  }),
  members: many(projectMemberships),
  workItems: many(workItems),
}));

export const projectMembershipsRelations = relations(
  projectMemberships,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectMemberships.projectId],
      references: [projects.id],
    }),
    user: one(user, {
      fields: [projectMemberships.userId],
      references: [user.id],
    }),
  })
);

export const workItemsRelations = relations(workItems, ({ one, many }) => ({
  project: one(projects, {
    fields: [workItems.projectId],
    references: [projects.id],
  }),
  parent: one(workItems, {
    fields: [workItems.parentId],
    references: [workItems.id],
    relationName: "parent_child",
  }),
  children: many(workItems, {
    relationName: "parent_child",
  }),
  reporter: one(user, {
    fields: [workItems.reporterUserId],
    references: [user.id],
  }),
  assignee: one(user, {
    fields: [workItems.assigneeUserId],
    references: [user.id],
  }),
  comments: many(comments),
  attachments: many(attachments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  workItem: one(workItems, {
    fields: [comments.workItemId],
    references: [workItems.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  workItem: one(workItems, {
    fields: [attachments.workItemId],
    references: [workItems.id],
  }),
  uploader: one(user, {
    fields: [attachments.uploadedByUserId],
    references: [user.id],
  }),
}));
