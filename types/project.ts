import {  TaskStatus } from "@/types/task"

export type ProjectInfo = {
    title: string;
    projectId: string;
};

export type ApiTask = {
    _id: string;
    parentId?: string;
    title: string;
    status: TaskStatus;
    description?: string | null;
    priority?: "none" | "low" | "medium" | "high";
    dueDate?: string | null;
    startDate?: string | null;
    estimate?: number | null;
    assignees?: Array<{
        _id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    }> | string[];
    labels?: string[];
    createdAt?: string;
    updatedAt?: string;
};

export type ApiResponse = {
    project: ProjectInfo;
    tasks: ApiTask[];
};
 export type  JoinInfo = {
     projectId: string;
     title: string;
     isPublic: boolean;
     isMember: boolean;
 };
export type Project = {
    _id: string
    title: string
    projectId: string
    isPublic: boolean
}