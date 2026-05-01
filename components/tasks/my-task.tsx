'use client'

import { useEffect, useMemo, useState } from 'react'
import { getMyTasks } from '@/services/task.service'
import { Task, PriorityLevel, TaskStatus } from '@/types/task'
import { TaskRow } from '@/components/tasks/task-row'

function parseDateOnly(dateStr?: string) {
  if (!dateStr) return null

  const d = new Date(dateStr)

  if (Number.isNaN(d.getTime())) return null

  d.setHours(0, 0, 0, 0)

  return d
}

function priorityRank(priority?: string | null) {
  const normalized = String(priority ?? '').toLowerCase()

  switch (normalized) {
    case PriorityLevel.HIGH:
      return 3
    case PriorityLevel.MEDIUM:
      return 2
    case PriorityLevel.LOW:
      return 1
    default:
      return 0
  }
}

function statusRank(status: TaskStatus) {
  switch (status) {
    case TaskStatus.IN_PROGRESS:
      return 0
    case TaskStatus.TODO:
      return 1
    case TaskStatus.BACKLOG:
      return 2
    case TaskStatus.DONE:
      return 3
    case TaskStatus.CANCELLED:
      return 4
    default:
      return 99
  }
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const sr = statusRank(a.status) - statusRank(b.status)
    if (sr !== 0) return sr

    const dueA = parseDateOnly(a.dueDate)
    const dueB = parseDateOnly(b.dueDate)

    if (dueA && dueB) {
      const diff = dueA.getTime() - dueB.getTime()
      if (diff !== 0) return diff
    } else if (dueA && !dueB) {
      return -1
    } else if (!dueA && dueB) {
      return 1
    }

    const pr = priorityRank(b.priority) - priorityRank(a.priority)
    if (pr !== 0) return pr

    return String(a.title ?? '').localeCompare(
        String(b.title ?? ''),
        'vi'
    )
  })
}

export function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await getMyTasks()
        const nextTasks = Array.isArray(res?.tasks) ? res.tasks : []

        if (mounted) {
          setTasks(nextTasks)
        }
      } catch {
        if (mounted) {
          setError('Không thể tải danh sách công việc')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks)
  }, [tasks])

  if (loading) {
    return (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Đang tải...
          </div>
        </div>
    )
  }

  return (
      <section className="w-full py-2">
        <div className="w-full overflow-x-auto">
          {/* Header */}
          <div className="hidden xl:grid grid-cols-[140px_1fr_100px_150px_160px] gap-2 border">
            <div className="px-4 py-2 text-sm text-center font-semibold">Mã</div>
            <div className="px-4 py-2 text-sm text-center font-semibold">Nội dung</div>
            <div className="px-4 py-2 text-sm text-center font-semibold">Thời gian</div>
            <div className="px-4 py-2 text-sm text-center font-semibold">Ưu tiên</div>
            <div className="px-4 py-2 text-sm font-semibold">Trạng thái</div>
          </div>
          <div >
            {/* Nội dung - TaskRow tự xử lý mobile/desktop */}
            {error ? (
                <div className="px-5 py-6 text-sm text-red-600">{error}</div>
            ) : sortedTasks.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground">
                  Không có công việc nào
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4">
                  {sortedTasks.map((task) => <TaskRow key={task.id} task={task} />)}
                </div>
            )}
          </div>
        </div>
      </section>
  )
}