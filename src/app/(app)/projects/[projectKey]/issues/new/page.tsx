import { CreateIssueForm } from "@/components/issues/create-issue-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Issue",
  description: "Add a new work item to the project.",
};

interface CreateIssuePageProps {
    params: Promise<{ projectKey: string }>;
}

export default async function CreateIssuePage({ params }: CreateIssuePageProps) {
  const { projectKey } = await params;

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Issue</h1>
        <p className="text-muted-foreground">
            Add a new task, bug, feature, or epic to {projectKey}.
        </p>
      </div>
      <CreateIssueForm projectKey={projectKey} />
    </div>
  );
}
