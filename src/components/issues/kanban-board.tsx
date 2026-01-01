"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updateIssueStatusAction } from "@/app/(app)/projects/[projectKey]/issues/_actions/issue-actions";
import { toast } from "sonner";

const COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

interface Issue {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string | null;
  type: string;
}

interface KanbanBoardProps {
  projectKey: string;
  initialIssues: Issue[];
}

export function KanbanBoard({ projectKey, initialIssues }: KanbanBoardProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts, allows clicks on links
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeIssue = issues.find((i) => i.key === active.id);
    if (activeIssue) {
      setActiveIssue(activeIssue);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeIssueKey = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column or another issue
    let newStatus = overId;
    const overIssue = issues.find(i => i.key === overId);
    if (overIssue) {
        newStatus = overIssue.status;
    }

    const currentIssue = issues.find(i => i.key === activeIssueKey);
    if (!currentIssue) return;

    if (currentIssue.status !== newStatus) {
        // Optimistic UI update
        const updatedIssues = issues.map(i => 
            i.key === activeIssueKey ? { ...i, status: newStatus } : i
        );
        setIssues(updatedIssues);

        // Server update
        const result = await updateIssueStatusAction(projectKey, activeIssueKey, newStatus);
        if (result && result.error) {
            toast.error(result.error);
            // Revert on error
            setIssues(issues);
        }
    }

    setActiveIssue(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            projectKey={projectKey}
            issues={issues.filter((i) => i.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}>
        {activeIssue ? (
          <KanbanCard issue={activeIssue} projectKey={projectKey} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
