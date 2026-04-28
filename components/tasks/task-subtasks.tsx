"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTaskSubtasks } from "@/hooks/useTaskSubtasks"
import { Task } from "@/types/task"

type TaskSubtasksProps = {
    parentTask: Task
}

export function TaskSubtasks({ parentTask }: TaskSubtasksProps) {
    const router = useRouter()
    const { items, loading, error } = useTaskSubtasks(parentTask)

    const handleOpenCreateSubtask = () => {
        if (!parentTask.projectId || !parentTask.id) return

        router.push(
            `/project/${parentTask.projectId}/tasks?createTask=1&parentId=${parentTask.id}`
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    className="p-2 rounded-lg hover:bg-muted transition"
                    onClick={handleOpenCreateSubtask}
                    aria-label="Them task nhanh"
                >
                    Add sub-task
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Danh sách Sub-task</span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {loading && <p className="text-xs text-muted-foreground">Đang tải Sub-task</p>}
            {!loading && items.length > 0 && (
                <div className="space-y-2">
                    {items.map((subtask) => (
                        <div key={subtask.id} className="rounded-md border px-3 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {subtask.code}
                                </span>
                                <Badge variant="secondary">{subtask.status}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {subtask.assigneesText || "Chưa có"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

