import Link from "next/link";
import { getProjectByKey } from "@/server/projects";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectKey: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectKey } = await params;

  const project = await getProjectByKey(projectKey);

  const navItems = [
    { name: "Overview", href: `/projects/${projectKey}` },
    { name: "Board", href: `/projects/${projectKey}/board` },
    { name: "Backlog", href: `/projects/${projectKey}/issues` },
    { name: "Settings", href: `/projects/${projectKey}/settings` },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            href="/projects"
            className="hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
      </div>

      <nav className="flex items-center space-x-4 mb-6 border-b border-border pb-px">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium px-1 py-3 border-b-2 border-transparent hover:text-foreground hover:border-border transition-all text-muted-foreground"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
