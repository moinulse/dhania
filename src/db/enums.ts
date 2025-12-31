export const SYSTEM_ROLES = ["admin", "user", "project_manager"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const WORK_ITEM_TYPES = ["epic", "story", "task", "bug", "subtask"] as const;
export type WorkItemType = (typeof WORK_ITEM_TYPES)[number];

export const WORK_ITEM_STATUSES = ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"] as const;
export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number];

export const WORK_ITEM_PRIORITIES = ["lowest", "low", "medium", "high", "highest"] as const;
export type WorkItemPriority = (typeof WORK_ITEM_PRIORITIES)[number];

export const PROJECT_ROLES = ["owner", "admin", "member", "viewer"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const PR_STATES = ["open", "closed", "merged"] as const;
export type PrState = (typeof PR_STATES)[number];

export function isValidEnum<T extends readonly string[]>(
    value: string,
    enumValues: T
): value is T[number] {
    return enumValues.includes(value as T[number]);
}

export const DEFAULT_SYSTEM_ROLE: SystemRole = "user";
export const DEFAULT_WORK_ITEM_STATUS: WorkItemStatus = "backlog";
export const DEFAULT_WORK_ITEM_PRIORITY: WorkItemPriority = "medium";
export const DEFAULT_PROJECT_ROLE: ProjectRole = "member";
