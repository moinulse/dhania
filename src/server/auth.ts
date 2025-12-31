import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const ctxHeaders = await headers();
  const session = await auth.api.getSession({
    headers: ctxHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  return session.user;
});
