export type RoleType = "admin" | "leader" | "member"

export type TaskStatus = "todo" | "doing" | "done"

export interface IUser {
    _id?: string
    name: string
    email: string
    password: string
    role: RoleType
    isGod?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface IProject {
    _id?: string
    name: string
    description?: string
    owner: string
    members: string[]
    isPublic?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface ITask {
    _id?: string
    title: string
    description?: string
    project: string
    assignee: string
    status: TaskStatus
    deadline?: Date
    createdBy: string
    createdAt?: Date
    updatedAt?: Date
}

export interface IComment {
    _id?: string
    task: string
    author: string
    content: string
    createdAt?: Date
}

export interface IActivityLog {
    _id?: string
    user: string
    action: string
    targetId?: string
    createdAt?: Date
}