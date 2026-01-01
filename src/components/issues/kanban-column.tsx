"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";

interface Issue {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string | null;
  type: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  issues: Issue[];
  projectKey: string;
}

export function KanbanColumn({
  id,
  title,
  issues,
  projectKey,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  return (
    <div className="flex flex-col w-72 min-h-[500px] bg-gray-100 rounded-lg p-2">
      <div className="px-2 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2">
        <SortableContext
          items={issues.map((i) => i.key)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <KanbanCard key={issue.key} issue={issue} projectKey={projectKey} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
