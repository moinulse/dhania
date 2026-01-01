"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Issue {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string | null;
  type: string;
}

interface KanbanCardProps {
  issue: Issue;
  projectKey: string;
}

export function KanbanCard({ issue, projectKey }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.key,
    data: {
      type: "Issue",
      issue,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted border-2 border-primary/20 rounded-lg h-[100px] w-full"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/projects/${projectKey}/issues/${issue.key}`}>
        <Card className="hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-[10px] font-bold text-muted-foreground uppercase"
              >
                {issue.key}
              </Badge>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted border">
                {issue.type}
              </span>
            </div>
            <p className="text-sm font-medium leading-tight line-clamp-2">
              {issue.title}
            </p>
            <div className="flex justify-between items-center pt-1">
              {issue.priority === "high" && (
                <span className="text-red-500 text-xs font-bold">↑</span>
              )}
              {issue.priority === "low" && (
                <span className="text-blue-500 text-xs font-bold">↓</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
