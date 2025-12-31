"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, projectMemberships } from "@/db/schema";
import { createProjectSchema } from "@/schemas/project";
import { z } from "zod";

export async function createProject(
  input: z.infer<typeof createProjectSchema>
) {
  const ctxHeaders = await headers();
  const session = await auth.api.getSession({
    headers: ctxHeaders,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const result = createProjectSchema.safeParse(input);

  if (!result.success) {
    return { error: "Invalid input", details: result.error.flatten() };
  }

  const { name, key, description } = result.data;

  try {
    // Transaction to create project and add creator as admin
    const newProject = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          name,
          key,
          description,
          createdByUser: session.user.id,
        })
        .returning();

      await tx.insert(projectMemberships).values({
        projectId: project.id,
        userId: session.user.id,
        role: "admin",
      });

      return project;
    });

    return { success: true, projectKey: newProject.key };
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT") {
      // Very basic check, SQLite error codes might vary or need better parsing
      // depending on the driver, but typically unique constraint violation
      // on 'key' would trigger this.
      return { error: "Project key already exists" };
    }
    console.error("Failed to create project:", error);
    return { error: "Failed to create project" };
  }
}
