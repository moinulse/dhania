import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth();

  const ctxHeaders = await headers();
  const session = await auth.api.getSession({
    headers: ctxHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar userName={session.user.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
