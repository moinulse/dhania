"use client";

import { removeMemberAction, updateMemberRoleAction } from "@/app/(app)/projects/[projectKey]/settings/members/_actions/member-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface MemberListProps {
  projectKey: string;
  members: any[]; // strict type would be better
  currentUser: any;
}

export function MemberList({ projectKey, members, currentUser }: MemberListProps) {
    
    // Check if current user is admin to show controls
    const isCurrentUserAdmin = members.find(m => m.userId === currentUser.id)?.role === 'admin';

    const handleRemove = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        const result = await removeMemberAction(projectKey, userId);
        if (result.error) toast.error(result.error);
        else toast.success("Member removed");
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updateMemberRoleAction(projectKey, userId, newRole);
        if (result.error) toast.error(result.error);
        else toast.success("Role updated");
    };

    return (
        <div className="border rounded-md divide-y">
            {members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCurrentUserAdmin && member.userId !== currentUser.id ? (
                            <>
                                <select 
                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(member.userId)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <span className="text-xs px-2 py-1 bg-muted rounded capitalize text-muted-foreground">
                                {member.role}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
