"use server";

import { createIssue, updateIssueStatus } from "@/server/issues";
import { CreateIssueInput, createIssueSchema } from "@/schemas/issue";
import { redirect } from "next/navigation";

export async function createIssueAction(
  projectKey: string,
  input: CreateIssueInput
) {
  // Validate input again server-side
  const result = createIssueSchema.safeParse(input);
  if (!result.success) {
    return { error: "Invalid input", details: result.error.flatten() };
  }

  try {
    const newIssue = await createIssue(projectKey, result.data);
    // Return success but don't redirect yet if we want to show a toast,
    // OR redirect directly. Given the standard pattern, let's return success
    // and let the client redirect, OR redirect here.
    // Redirecting here is safer for ensuring the new page loads fresh.
  } catch (error) {
    console.error("Failed to create issue:", error);
    return { error: "Failed to create issue" };
  }

  redirect(`/projects/${projectKey}/issues`);
}

export async function updateIssueStatusAction(
  projectKey: string,
  issueKey: string,
  status: string
) {
  try {
    await updateIssueStatus(projectKey, issueKey, status);
    return { success: true };
  } catch (error) {
    console.error("Failed to update issue status:", error);
    return { error: "Failed to update issue status" };
  }
}
