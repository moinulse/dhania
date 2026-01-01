import { getIssueDetails } from "@/server/issues";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Using custom badge if not exists
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface IssuePageProps {
  params: Promise<{ projectKey: string; issueKey: string }>;
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { projectKey, issueKey } = await params;
  const issue = await getIssueDetails(projectKey, issueKey);

  if (!issue) {
    notFound();
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link
          href={`/projects/${projectKey}/issues`}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                {issue.key}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border bg-muted capitalize">
                {issue.type}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Description
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/20 min-h-[200px] whitespace-pre-wrap">
              {issue.description || "No description provided."}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Comments
            </h3>
            <div className="text-center py-8 border rounded-lg bg-muted/10 text-muted-foreground italic text-sm">
              Comments are coming soon.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Status
                </label>
                <div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Priority
                </label>
                <div className="capitalize text-sm font-medium">
                  {issue.priority}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Assignee
                </label>
                <div className="text-sm font-medium">
                  {issue.assignee ? issue.assignee.name : "Unassigned"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Reporter
                </label>
                <div className="text-sm font-medium">{issue.reporter.name}</div>
              </div>

              <Separator />

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">
                  Created
                </label>
                <div className="text-xs text-muted-foreground">
                  {issue.createdAt}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
