import { Task, TaskStatus } from "@/types/task"

function startOfDay(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}
function parseDate(value?: string) {
    if (!value) return null

    const d = new Date(value)

    if (Number.isNaN(d.getTime())) return null

    return d
}
export function parseDateOnly(dateStr?: string) {
    if (!dateStr) return null

    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return null

    return startOfDay(d)
}

export function getTaskOverDue(task: Task, now = new Date()) {
    const today = startOfDay(now)
    const dueDate = parseDateOnly(task.dueDate)

    const isFinished =
        task.status === TaskStatus.DONE ||
        task.status === TaskStatus.CANCELLED

    const isDueToday =
        !!dueDate &&
        dueDate.getTime() === today.getTime() &&
        !isFinished
    let isOverdue =
        !!dueDate &&
        dueDate.getTime() < today.getTime() &&
        !isFinished

    let isDelayed = false

    if (
        !isFinished &&
        task.startDate &&
        typeof task.estimate === "number"
    ) {
        const startDate = parseDate(task.startDate)

        let endDate: Date | null = null

        if (task.status === "inprogress") {
            endDate = now
        } else if (task.updatedAt) {
            endDate = parseDate(task.updatedAt)
        }

        if (startDate && endDate) {
            const estimateMs = task.estimate * 60 * 60 * 1000

            isDelayed =
                endDate.getTime() - startDate.getTime() > estimateMs
        }
    }



    return {
        dueDate,
        isDueToday,
        isOverdue,
        isDelayed,
        isWarning: isDueToday || isOverdue || isDelayed,
        label: isOverdue
            ? "Quá hạn"
            : isDelayed
                ? "Chậm tiến độ"
                : isDueToday
                    ? "Cảnh báo"
                    : null
    }
}