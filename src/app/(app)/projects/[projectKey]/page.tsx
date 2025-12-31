import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectByKey, getProjectStats } from "@/server/projects";

interface ProjectPageProps {
  params: Promise<{ projectKey: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectKey } = await params;

  const project = await getProjectByKey(projectKey);
  const { totalIssues, doneIssues } = await getProjectStats(project.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneIssues}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {project.description || "No description provided for this project."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
