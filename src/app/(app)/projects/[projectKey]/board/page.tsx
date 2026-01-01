import { getProjectIssues } from "@/server/issues";
import { KanbanBoard } from "@/components/issues/kanban-board";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface BoardPageProps {
  params: Promise<{ projectKey: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { projectKey } = await params;
  const issues = await getProjectIssues(projectKey);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Board</h1>
            <p className="text-muted-foreground">Drag and drop issues to update their status.</p>
        </div>
        <Button asChild>
          <Link href={`/projects/${projectKey}/issues/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard projectKey={projectKey} initialIssues={issues} />
      </div>
    </div>
  );
}
