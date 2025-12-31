import "server-only";
import { projects, workItems, user } from "@/db/schema";
import { getCurrentUser } from "./auth"; // Using the shared auth helper
import { eq, and, desc, sql } from "drizzle-orm";
import { CreateIssueInput } from "@/schemas/issue";
import { getProjectByKey } from "./projects";
import { db } from "@/db";

/**
 * Create a new work item (issue) for a project.
 * Handles the transactional increment of the issue number.
 */
export async function createIssue(projectKey: string, input: CreateIssueInput) {
  const currentUser = await getCurrentUser();

  // 1. Verify project access and get ID
  const project = await getProjectByKey(projectKey);

  // 2. Transaction: Increment project counter & insert issue
  return await db.transaction(async (tx) => {
    // Lock the project row or use an atomic update to get the next number safely.
    // In SQLite/LibSQL, a returning update is a good way to get the new counter.
    // However, Drizzle's support for `returning` on update in SQLite is solid.

    const [updatedProject] = await tx
      .update(projects)
      .set({
        nextIssueNumber: sql`${projects.nextIssueNumber} + 1`,
      })
      .where(eq(projects.id, project.id))
      .returning({ nextNumber: projects.nextIssueNumber });

    // The number we should use is the one *before* the increment,
    // OR we increment first and use the result.
    // Standard pattern: stored `nextIssueNumber` is the *next* one to use.
    // So if it was 1, we use 1, and set DB to 2.
    // BUT the SQL above increments it. So `updatedProject.nextNumber` is 2.
    // So the number we use is `updatedProject.nextNumber - 1`.
    // Alternatively, start at 0, increment to 1, use 1.
    // Let's assume `nextIssueNumber` in DB starts at 1.

    const issueNumber = updatedProject.nextNumber - 1;
    const issueKey = `${project.key}-${issueNumber}`;

    const [newItem] = await tx
      .insert(workItems)
      .values({
        projectId: project.id,
        number: issueNumber,
        key: issueKey,
        type: input.type,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: "backlog", // Default status
        reporterUserId: currentUser.id,
        assigneeUserId: input.assigneeUserId || null,
        parentId: input.parentId || null,
      })
      .returning();

    return newItem;
  });
}

/**
 * Get all issues for a project, with optional filtering.
 */
export async function getProjectIssues(projectKey: string) {
  const project = await getProjectByKey(projectKey);

  const issues = await db
    .select({
      id: workItems.id,
      key: workItems.key,
      title: workItems.title,
      type: workItems.type,
      status: workItems.status,
      priority: workItems.priority,
      createdAt: workItems.createdAt,
      assignee: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    })
    .from(workItems)
    .leftJoin(user, eq(workItems.assigneeUserId, user.id))
    .where(eq(workItems.projectId, project.id))
    .orderBy(desc(workItems.createdAt));

  return issues;
}

/**
 * Get details for a single issue.
 */
export async function getIssueDetails(projectKey: string, issueKey: string) {
  const project = await getProjectByKey(projectKey);

  const issue = await db
    .select({
      id: workItems.id,
      key: workItems.key,
      title: workItems.title,
      description: workItems.description,
      type: workItems.type,
      status: workItems.status,
      priority: workItems.priority,
      createdAt: workItems.createdAt,
      updatedAt: workItems.updatedAt,
      reporter: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      assigneeId: workItems.assigneeUserId,
    })
    .from(workItems)
    .innerJoin(user, eq(workItems.reporterUserId, user.id))
    .where(
      and(eq(workItems.projectId, project.id), eq(workItems.key, issueKey))
    )
    .then((res) => res[0]);

  if (!issue) return null;

  // Fetch assignee separately if it exists (since we used innerJoin for reporter)
  // Or we could have double joined user table (aliased).
  // For simplicity, let's just do a quick lookup if needed or refactor query to use alias.
  // Let's refactor to use aliases for a single query if possible, but Drizzle aliasing:
  /*
    const assignee = alias(user, "assignee");
    const reporter = alias(user, "reporter");
    ...
    */
  // For now, I'll stick to a simple separate fetch for assignee to avoid complex alias setup in this turn if strictly needed,
  // but actually, let's do it right with a second join on the base user table since we didn't alias.
  // Wait, I can't join `user` twice without alias.
  // I will return the basic issue and let the UI handle the assignee display ID lookup or specific fetch if detailed.
  // ACTUALLY, I'll just fetch assignee details if `assigneeId` is present.

  let assignee = null;
  if (issue.assigneeId) {
    assignee = await db
      .select({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      })
      .from(user)
      .where(eq(user.id, issue.assigneeId))
      .then((res) => res[0]);
  }

  return { ...issue, assignee };
}

/**
 * Update the status of an issue.
 */
export async function updateIssueStatus(
  projectKey: string,
  issueKey: string,
  status: string
) {
  const project = await getProjectByKey(projectKey);

  const [updatedIssue] = await db
    .update(workItems)
    .set({
      status,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(
      and(eq(workItems.projectId, project.id), eq(workItems.key, issueKey))
    )
    .returning();

  return updatedIssue;
}
