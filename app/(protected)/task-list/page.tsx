"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { KanbanColumn } from "@/components/tasks/task-list"
import { Task, TaskStatus } from "@/types/task"
import { GET_METHOD } from "@/lib/req"
import { Project } from "@/types/project"


const columns: Array<{ title: string; status: TaskStatus; tasks: Task[] }> = [
    { title: "Backlog", status: TaskStatus.BACKLOG, tasks: [] },
    { title: "Todo", status: TaskStatus.TODO, tasks: [] },
    { title: "In Progress", status: TaskStatus.IN_PROGRESS, tasks: [] },
]

export default function TaskListPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                const data = (await GET_METHOD("/api/projects")) as Project[]
                if (active) setProjects(Array.isArray(data) ? data : [])
            } catch {
                if (active) setProjects([])
            } finally {
                if (active) setLoading(false)
            }
        }

        load()

        return () => {
            active = false
        }
    }, [])

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h1 className="text-xl font-semibold">Dự án</h1>
                {loading && <p className="text-sm text-muted-foreground">Đang tải dự án...</p>}
                {!loading && projects.length === 0 && (
                    <p className="text-sm text-muted-foreground">Chưa có dự án.</p>
                )}
                <ul className="space-y-2">
                    {projects.map((project) => (
                        <li key={project._id}>
                            <Link
                                href={`/project/${project.projectId}/tasks`}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {project.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Task list</h2>
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
