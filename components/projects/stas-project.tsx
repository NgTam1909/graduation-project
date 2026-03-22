'use client'

import { useEffect, useMemo, useState } from "react"
import { buildAdvancedStats } from "@/lib/stast"
import ClickablePie from "@/components/chart/pie-chart"
import TopUserChart from "@/components/chart/bar-chart"
import { GET_METHOD } from "@/lib/req"
import { ApiResponse, ApiTask } from "@/types/project"
import { Task, TaskStatus } from "@/types/task"

type Props = {
    projectId: string
}

export default function AdvancedDashboard({ projectId }: Props) {
    const [filter, setFilter] = useState<string | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        const loadTasks = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = (await GET_METHOD(`/api/projects/${projectId}/tasks`)) as ApiResponse
                if (!active) return
                const items = Array.isArray(data?.tasks) ? data.tasks : []
                setTasks(items.map((item) => toTask(item, projectId)))
            } catch {
                if (active) {
                    setTasks([])
                    setError("Không thể tải danh sách task")
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadTasks()

        return () => {
            active = false
        }
    }, [projectId])

    const { statusCount, overdue, userStats } = buildAdvancedStats(tasks)

    // PIE DATA
    const pieData = Object.entries(statusCount).map(
        ([key, value]) => ({
            name: key,
            value,
        })
    )

    // FILTERED TASKS
    const safeTasks = Array.isArray(tasks) ? tasks : []
    const filteredTasks = useMemo(() => {
        if (!filter) return tasks
        return tasks.filter((t) => t.status === filter)
    }, [tasks, filter])

    return (
        <div className="space-y-6">

            {/* OVERDUE */}
            <div className="text-red-500 font-semibold">
                Quá hạn: {overdue}
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* PIE */}
                <ClickablePie
                    data={pieData}
                    onClick={(name: string) => setFilter(name)}
                />

                {/* TOP USER */}
                <TopUserChart data={userStats} />

            </div>
            {/* FILTER INFO */}
            {filter && (
                <div>
                    Đang lọc: <b>{filter}</b>
                    <button onClick={() => setFilter(null)}>
                        ❌
                    </button>
                </div>
            )}
            {/* TASK LIST */}
            <div>
                <h3 className="font-semibold mb-2">Task List</h3>

                <div className="space-y-2">
                    {loading && (
                        <p className="text-sm text-muted-foreground">Đang tải task...</p>
                    )}
                    {!loading && error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    {!loading && !error && filteredTasks.length === 0 && (
                        <p className="text-sm text-muted-foreground">Không có task phù hợp.</p>
                    )}
                    {!loading && !error && filteredTasks.length > 0 && (
                        filteredTasks.map((t) => (
                            <div
                                key={t.id}
                                className="p-2 border rounded"
                            >
                                {t.title} - {t.status}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    )
}

function toTask(item: ApiTask, projectId?: string): Task {
    const code = `TSK-${item._id.slice(-6).toUpperCase()}`
    const priority =
        item.importance === "low" || item.importance === "medium" || item.importance === "high"
            ? item.importance
            : undefined

    const assignees = Array.isArray(item.assignees)
        ? item.assignees.map((a) => {
              if (typeof a === "string") return a
              const fullName = `${a.lastName ?? ""} ${a.firstName ?? ""}`.trim()
              return fullName || a.name || a.email || "User"
          })
        : undefined

    return {
        id: item._id,
        projectId,
        code,
        title: item.title,
        status: item.status as TaskStatus,
        priority,
        description: item.description ?? undefined,
        assignees,
        labels: item.labels,
        startDate: item.startDate ?? undefined,
        dueDate: item.dueDate ?? undefined,
        estimate: item.estimate ?? undefined,
        createdAt: item.createdAt ?? undefined,
        updatedAt: item.updatedAt ?? undefined,
    }
}
