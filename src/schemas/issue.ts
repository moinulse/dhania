import { z } from "zod";

export const issueTypeEnum = z.enum(["epic", "feature", "task", "bug"]);
export const issueStatusEnum = z.enum(["backlog", "todo", "in_progress", "in_review", "done"]);
export const issuePriorityEnum = z.enum(["low", "medium", "high"]);

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  type: issueTypeEnum,
  priority: issuePriorityEnum.default("medium"),
  assigneeUserId: z.string().optional(),
  parentId: z.string().optional(), // For sub-tasks or epic linkage
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = createIssueSchema.partial().extend({
  status: issueStatusEnum.optional(),
});
