"use server";

import { addMemberByEmail, removeMember, updateMemberRole } from "@/server/members";
import { revalidatePath } from "next/cache";

export async function addMemberAction(projectKey: string, email: string) {
  try {
    await addMemberByEmail(projectKey, email);
    revalidatePath(`/projects/${projectKey}/settings/members`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function removeMemberAction(projectKey: string, userId: string) {
  try {
    await removeMember(projectKey, userId);
    revalidatePath(`/projects/${projectKey}/settings/members`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateMemberRoleAction(projectKey: string, userId: string, role: string) {
    try {
        await updateMemberRole(projectKey, userId, role as "admin" | "member" | "viewer");
        revalidatePath(`/projects/${projectKey}/settings/members`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
