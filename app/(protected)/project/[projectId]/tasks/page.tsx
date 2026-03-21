"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { KanbanColumn } from "@/components/tasks/task-list"
import { Task, TaskStatus } from "@/types/task"
import { GET_METHOD } from "@/lib/req"
import { ApiTask, ApiResponse, ProjectInfo } from "@/types/project";

const statusColumns: Array<{ title: string; status: TaskStatus }> = [
    { title: "Backlog", status: TaskStatus.BACKLOG },
    { title: "Todo", status: TaskStatus.TODO },
    { title: "In Progress", status: TaskStatus.IN_PROGRESS },
    { title: "Done", status: TaskStatus.DONE },
    { title: "Cancelled", status: TaskStatus.CANCELLED },
]

function toTask(item: ApiTask, projectId?: string): Task {
    const code = `TSK-${item._id.slice(-6).toUpperCase()}`
    const priority =
        item.importance === "low" || item.importance === "medium" || item.importance === "high"
            ? item.importance
            : undefined

    const startDate = item.startDate
        ? new Date(item.startDate).toLocaleDateString("vi-VN")
        : undefined
    const dueDate = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString("vi-VN")
        : undefined
    const toLocalDateValue = (value?: string | null) => {
        if (!value) return undefined
        const date = new Date(value)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    const startDateValue = toLocalDateValue(item.startDate)
    const dueDateValue = toLocalDateValue(item.dueDate)

    const assignees = Array.isArray(item.assignees)
        ? item.assignees.map((a) => {
              if (typeof a === "string") return a
              const fullName = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim()
              return fullName || a.name || a.email || "User"
          })
        : undefined
    const assigneeIds = Array.isArray(item.assignees)
        ? item.assignees
              .map((a) => (typeof a === "string" ? a : a._id))
              .filter((id): id is string => !!id)
        : undefined

    return {
        id: item._id,
        projectId,
        code,
        title: item.title,
        status: item.status,
        priority,
        description: item.description ?? undefined,
        assignees,
        assigneeIds,
        labels: item.labels,
        startDate,
        dueDate,
        startDateValue,
        dueDateValue,
        estimate: item.estimate ?? undefined,
        createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleString("vi-VN")
            : undefined,
        updatedAt: item.updatedAt
            ? new Date(item.updatedAt).toLocaleString("vi-VN")
            : undefined,
    }
}

export default function ProjectTaskListPage() {
    const params = useParams<{ projectId: string }>()
    const projectId = params?.projectId

    const [project, setProject] = useState<ProjectInfo | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const handler = () => setReloadKey((key) => key + 1)
        window.addEventListener("task:created", handler)
        window.addEventListener("task:updated", handler)
        return () => {
            window.removeEventListener("task:created", handler)
            window.removeEventListener("task:updated", handler)
        }
    }, [])

    useEffect(() => {
        let active = true

        const load = async () => {
            if (!projectId) return
            try {
                const data = (await GET_METHOD(`/api/projects/${projectId}/tasks`)) as ApiResponse
                if (!active) return
                setProject(data?.project ?? null)
                const mapped = Array.isArray(data?.tasks)
                    ? data.tasks.map((task) => toTask(task, projectId))
                    : []
                setTasks(mapped)
            } catch {
                if (active) {
                    setProject(null)
                    setTasks([])
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        load()

        return () => {
            active = false
        }
    }, [projectId, reloadKey])

    const columns = useMemo(() => {
        return statusColumns.map((column) => ({
            ...column,
            tasks: tasks.filter((task) => task.status === column.status),
        }))
    }, [tasks])

    return (
        <div className="space-y-6">
            <section className="space-y-2">
                <h1 className="text-xl font-semibold">
                    {project?.title ?? "Task list"}
                </h1>
                {project?.projectId && (
                    <p className="text-sm text-muted-foreground">
                        {project.projectId}
                    </p>
                )}
                {loading && (
                    <p className="text-sm text-muted-foreground">Äang táº£i tasks...</p>
                )}
                {!loading && tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground">ChÆ°a cÃ³ task nÃ o.</p>
                )}
            </section>

            <section>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.status}
                            title={column.title}
                            status={column.status}
                            tasks={column.tasks}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}
