"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  userName?: string;
}

export function TopBar({ userName }: TopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Work Tracking
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground">{userName}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
