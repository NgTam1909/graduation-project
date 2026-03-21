
export enum TaskStatus {
    BACKLOG = "backlog",
    TODO = "todo",
    IN_PROGRESS = "inprogress",
    DONE = "done",
    CANCELLED = "cancelled",
}

export enum ImportanceLevel {
    NONE = "none",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}
export interface Task {
    id: string;
    projectId?: string;
    code: string;
    title: string;
    status: TaskStatus;
    description?: string;
    assignees?: string[];
    assigneeIds?: string[];
    labels?: string[];
    priority?: "low" | "medium" | "high";
    startDate?: string;
    dueDate?: string;
    startDateValue?: string;
    dueDateValue?: string;
    estimate?: number;
    createdAt?: string;
    updatedAt?: string;
}
