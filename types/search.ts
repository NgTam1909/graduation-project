export type SearchUser = {
    id: string
    name: string
    email: string
}

export type SearchProject = {
    id: string
    projectId: string
    title: string
    isPublic: boolean
}

export type SearchTask = {
    id: string
    code: string
    title: string
    projectId: string
    projectTitle: string
}

export type SearchResponse = {
    q: string
    users: SearchUser[]
    projects: SearchProject[]
    tasks: SearchTask[]
    message?: string
}

