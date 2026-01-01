"use client";

import { useState } from "react";
import { addMemberAction } from "@/app/(app)/projects/[projectKey]/settings/members/_actions/member-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddMemberForm({ projectKey }: { projectKey: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await addMemberAction(projectKey, email);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Member added successfully");
      setEmail("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm items-end">
      <div className="grid w-full items-center gap-1.5">
        <Input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
