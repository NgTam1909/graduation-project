import { DELETE_METHOD, GET_METHOD } from "@/lib/req"
import {Project} from "@/types/project";

export async function getProjectsService(): Promise<Project[]> {
    const data = (await GET_METHOD("/api/projects")) as Project[]
    return Array.isArray(data) ? data : []
}

export async function deleteProjectService(projectId: string) {
    return DELETE_METHOD(`/api/projects/${projectId}`)
}