
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Task, PriorityLevel, TaskStatus } from '@/types/task'
import { getTaskOverDue} from "@/lib/overDue"
type Props = {
    task: Task
}

function formatDateDDMMYYYY(dateStr?: string) {
    if (!dateStr) return '--'

    const d = new Date(dateStr)

    if (Number.isNaN(d.getTime())) return '--'

    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()

    return `${dd}/${mm}/${yyyy}`
}

function priorityPill(priority?: string | null) {
    const normalized = String(priority ?? '').toLowerCase()

    switch (normalized) {
        case PriorityLevel.HIGH:
            return {
                label: 'High',
                className: 'bg-red-500 text-white border-red-500',
            }

        case PriorityLevel.MEDIUM:
            return {
                label: 'Medium',
                className: 'bg-neutral-400 text-white border-neutral-400',
            }

        case PriorityLevel.LOW:
            return {
                label: 'Low',
                className: 'bg-white text-black border-black',
            }

        default:
            return {
                label: 'None',
                className: 'bg-white text-black border-black/50',
            }
    }
}

function statusLabel(status: TaskStatus) {
    switch (status) {
        case TaskStatus.TODO:
            return 'To do'

        case TaskStatus.IN_PROGRESS:
            return 'In progress'

        case TaskStatus.DONE:
            return 'Done'

        case TaskStatus.CANCELLED:
            return 'Cancelled'

        case TaskStatus.BACKLOG:
            return 'Backlog'

        default:
            return String(status)
    }
}

export function TaskRow({ task }: Props) {
    const router = useRouter()

    const pill = priorityPill(task.priority)
    const code = (task.code ?? task.id ?? '').toString()
    const due = formatDateDDMMYYYY(task.dueDate)

    const { isWarning, label } = getTaskOverDue(task)
    function goDetail() {
        if (!task.projectId) return

        router.push(`/project/${task.projectId}/tasks?taskId=${task.id}`)
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={goDetail}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    goDetail()
                }
            }}
            className={cn(
                'grid grid-cols-[160px_1fr_160px_180px_160px] border-b border-black last:border-b-0 cursor-pointer hover:bg-black/[0.03]',
                isWarning && 'outline outline-2 outline-red-600'
            )}
        >
            <div className="px-5 py-4 text-sm font-semibold">{code}</div>

            <div className="px-5 py-4 text-sm font-semibold">{task.title}</div>

            <div className="px-5 py-4 text-sm font-semibold">{due}</div>

            <div className="px-5 py-4">
        <span
            className={cn(
                'inline-flex w-[120px] justify-center rounded-full border px-6 py-2 text-sm font-bold',
                pill.className
            )}
        >
          {pill.label}
        </span>
            </div>

            <div className="px-5 py-4 text-sm font-semibold">
                <div className="flex items-center gap-2">
                    <span>{statusLabel(task.status)}</span>

                    {isWarning && (
                        <span className="rounded border border-red-600 px-2 py-0.5 text-xs font-bold text-red-600">
              {label}
            </span>
                    )}
                </div>
            </div>
        </div>
    )
}