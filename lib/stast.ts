import { Task } from "@/types/task"

export function buildAdvancedStats(tasks: Task[] = []) {
  const now = new Date()
  let overdue = 0

  const statusCount = {
    backlog: 0,
    todo: 0,
    inprogress: 0,
    done: 0,
    cancelled: 0,
  }

  const userMap: Record<string, number> = {}

  tasks.forEach((t) => {
    statusCount[t.status]++

    if (
      t.dueDate &&
      new Date(t.dueDate) > now &&
      t.status !== "done" &&
      t.status !== "cancelled"
    ) {
      overdue++
    }

    if (t.assignees && t.assignees.length > 0) {
      t.assignees.forEach((name) => {
        userMap[name] = (userMap[name] || 0) + 1
      })
    }
  })

  return {
    statusCount,
    overdue,
    userStats: Object.entries(userMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
  }
}
