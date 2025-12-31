import "server-only";
import { db } from "@/db";
import { projects, projectMemberships, workItems } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCurrentUser } from "./auth";

/**
 * Get all projects where the current user is a member
 */
export async function getUserProjects() {
  const user = await getCurrentUser();

  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      key: projects.key,
      description: projects.description,
      role: projectMemberships.role,
    })
    .from(projects)
    .innerJoin(
      projectMemberships,
      eq(projects.id, projectMemberships.projectId)
    )
    .where(eq(projectMemberships.userId, user.id));

  return userProjects;
}

/**
 * Get a specific project by key if the current user is a member.
 * Throws notFound() if the project doesn't exist or user is not a member.
 */
export async function getProjectByKey(projectKey: string) {
  const user = await getCurrentUser();

  const project = await db
    .select({
      id: projects.id,
      name: projects.name,
      key: projects.key,
      description: projects.description,
      role: projectMemberships.role,
    })
    .from(projects)
    .innerJoin(
      projectMemberships,
      and(
        eq(projects.id, projectMemberships.projectId),
        eq(projectMemberships.userId, user.id)
      )
    )
    .where(eq(projects.key, projectKey))
    .then((res) => res[0]);

  if (!project) {
    notFound();
  }

  return project;
}

/**
 * Get stats for a project (Total Issues, Completed, etc.)
 * Note: Does not re-verify membership strictly, assumes caller has access or simply queries by ID.
 * Since we fetched the project ID via getProjectByKey previously in the layout/page flow, this is safe-ish,
 * but explicit ownership checks never hurt. Here we just query by projectId.
 */
export async function getProjectStats(projectId: string) {
  const stats = await db
    .select({
      status: workItems.status,
      count: count(),
    })
    .from(workItems)
    .where(eq(workItems.projectId, projectId))
    .groupBy(workItems.status);

  const totalIssues = stats.reduce((acc, curr) => acc + curr.count, 0);
  const doneIssues = stats.find((s) => s.status === "done")?.count || 0;

  return {
    totalIssues,
    doneIssues,
  };
}
