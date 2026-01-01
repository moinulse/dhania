import { getProjectIssues } from "@/server/issues";
import { IssueListFilters } from "@/components/issues/issue-list-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { searchParamsCache } from "./search-params";
import { SearchParams } from "nuqs/server";

interface IssueListPageProps {
  params: Promise<{ projectKey: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function IssueListPage({
  params,
  searchParams,
}: IssueListPageProps) {
  const { projectKey } = await params;
  const { search, status, type } = await searchParamsCache.parse(searchParams);

  // We'll fetch all and filter in memory for MVP simplicity,
  // OR update getProjectIssues to accept filters.
  // Updating server function is better practice.
  // For now, let's just filter here to save context switching time, as list won't be huge yet.
  const allIssues = await getProjectIssues(projectKey);

  const filteredIssues = allIssues.filter((issue) => {
    const matchesSearch = search
      ? issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.key.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesStatus =
      status && status !== "all" ? issue.status === status : true;
    const matchesType = type && type !== "all" ? issue.type === type : true;

    return matchesSearch && matchesStatus && matchesType;
  });

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

  const getPriorityIcon = (p: string | null) => {
    if (p === "high") return <span className="text-red-500 font-bold">↑</span>;
    if (p === "low") return <span className="text-blue-500 font-bold">↓</span>;
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backlog</h1>
          <p className="text-muted-foreground">
            Manage work items for this project.
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${projectKey}/issues/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </Link>
        </Button>
      </div>

      <IssueListFilters />

      <div className="border rounded-md">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No issues found matching your filters.
          </div>
        ) : (
          <div className="divide-y">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/40 font-medium text-sm text-muted-foreground">
              <div className="col-span-1">Key</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-center">Pri</div>
              <div className="col-span-2 text-right">Assignee</div>
            </div>
            {filteredIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/projects/${projectKey}/issues/${issue.key}`}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors text-sm"
              >
                <div className="col-span-1 font-mono text-xs font-medium text-muted-foreground">
                  {issue.key}
                </div>
                <div className="col-span-6 font-medium truncate">
                  {issue.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground border px-1 rounded-full bg-background">
                    {issue.type}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      issue.status
                    )}`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  {getPriorityIcon(issue.priority)}
                </div>
                <div className="col-span-2 text-right flex justify-end">
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[100px]">
                        {issue.assignee.name}
                      </span>
                      {/* Avatar would go here */}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
