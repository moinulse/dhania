import { getProjectMembers } from "@/server/members";
import { getCurrentUser } from "@/server/auth";
import { AddMemberForm } from "@/components/projects/settings/add-member-form";
import { MemberList } from "@/components/projects/settings/member-list";
import { Separator } from "@/components/ui/separator";

interface MembersPageProps {
  params: Promise<{ projectKey: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { projectKey } = await params;
  const members = await getProjectMembers(projectKey);
  const currentUser = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-medium">Project Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage who has access to this project.
        </p>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Add Member</h3>
        <AddMemberForm projectKey={projectKey} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Current Members</h3>
        <MemberList projectKey={projectKey} members={members} currentUser={currentUser} />
      </div>
    </div>
  );
}
