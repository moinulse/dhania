import "server-only";
import { projects, projectMemberships, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getProjectByKey } from "./projects";
import { getCurrentUser } from "./auth";
import { db } from "@/db";

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectKey: string) {
  const project = await getProjectByKey(projectKey);

  const members = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: projectMemberships.role,
      joinedAt: projectMemberships.createdAt,
    })
    .from(projectMemberships)
    .innerJoin(user, eq(projectMemberships.userId, user.id))
    .where(eq(projectMemberships.projectId, project.id));

  return members;
}

/**
 * Add a member to a project by email.
 * Requires the current user to be an admin of the project.
 */
export async function addMemberByEmail(projectKey: string, email: string) {
  const currentUser = await getCurrentUser();

  // 1. Get Project
  const project = await getProjectByKey(projectKey);

  // 2. Check Permissions (Current user must be admin)
  // getProjectByKey already verifies membership, but we need to check role specifically.
  const membership = await db.query.projectMemberships.findFirst({
    where: and(
      eq(projectMemberships.projectId, project.id),
      eq(projectMemberships.userId, currentUser.id)
    ),
  });

  if (!membership || membership.role !== "admin") {
    throw new Error("Unauthorized: Only project admins can add members.");
  }

  // 3. Find target user
  const targetUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!targetUser) {
    throw new Error("User not found. Please ask them to sign up first.");
  }

  // 4. Check if already member
  const existingMembership = await db.query.projectMemberships.findFirst({
    where: and(
      eq(projectMemberships.projectId, project.id),
      eq(projectMemberships.userId, targetUser.id)
    ),
  });

  if (existingMembership) {
    throw new Error("User is already a member of this project.");
  }

  // 5. Add member
  await db.insert(projectMemberships).values({
    projectId: project.id,
    userId: targetUser.id,
    role: "member",
  });

  return { success: true };
}

/**
 * Remove a member from a project.
 */
export async function removeMember(projectKey: string, userIdToRemove: string) {
  const currentUser = await getCurrentUser();
  const project = await getProjectByKey(projectKey);

  // Check Permissions
  const membership = await db.query.projectMemberships.findFirst({
    where: and(
      eq(projectMemberships.projectId, project.id),
      eq(projectMemberships.userId, currentUser.id)
    ),
  });

  if (!membership || membership.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (userIdToRemove === currentUser.id) {
    throw new Error("Cannot remove yourself. Leave project instead.");
  }

  await db
    .delete(projectMemberships)
    .where(
      and(
        eq(projectMemberships.projectId, project.id),
        eq(projectMemberships.userId, userIdToRemove)
      )
    );

  return { success: true };
}

/**
 * Update a member's role.
 */
export async function updateMemberRole(
  projectKey: string,
  userIdToUpdate: string,
  newRole: "admin" | "member" | "viewer"
) {
  const currentUser = await getCurrentUser();
  const project = await getProjectByKey(projectKey);

  // Check Permissions
  const membership = await db.query.projectMemberships.findFirst({
    where: and(
      eq(projectMemberships.projectId, project.id),
      eq(projectMemberships.userId, currentUser.id)
    ),
  });

  if (!membership || membership.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (userIdToUpdate === currentUser.id) {
    // Prevent demoting yourself if you are the only admin?
    // For MVP, just allow it but warn or prevent if last admin logic is complex.
    // Let's just allow it for now.
  }

  await db
    .update(projectMemberships)
    .set({ role: newRole })
    .where(
      and(
        eq(projectMemberships.projectId, project.id),
        eq(projectMemberships.userId, userIdToUpdate)
      )
    );

  return { success: true };
}
