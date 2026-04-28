export type ActivityUser = {
    id: string
    name: string
    email?: string | null
}

export type ActivityEntityType = "Project" | "Task" | "Invite"

export interface ActivityLog {
    id: string
    action: string
    entityType: ActivityEntityType
    entityId?: string | null
    createdAt: string
    oldValue?: Record<string, unknown> | null
    newValue?: Record<string, unknown> | null
    metadata?: Record<string, unknown> | null
    user?: ActivityUser | null
}
