"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Clock, MessageSquare, Tag, User, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Task } from "@/types/task"
import { GET_METHOD, PATCH_METHOD } from "@/lib/req"
import { Input } from "@/components/ui/input"
import { ActivityLog } from "@/types/activity-log"

type TaskDetailProps = {
    task: Task
}

type AssigneeOption = {
    id: string
    name: string
    email?: string
}

type AssigneeResponse = {
    currentUserId: string
    currentUserRole: "Admin" | "Leader" | "Member"
    assignees: AssigneeOption[]
}

export function TaskDetail({ task }: TaskDetailProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [availableUsers, setAvailableUsers] = useState<AssigneeOption[]>([])
    const [selectedUsers, setSelectedUsers] = useState<string[]>(task.assigneeIds || [])
    const [currentUserRole, setCurrentUserRole] = useState<AssigneeResponse["currentUserRole"] | null>(null)
    const [startDateValue, setStartDateValue] = useState(task.startDateValue ?? "")
    const [dueDateValue, setDueDateValue] = useState(task.dueDateValue ?? "")
    const [estimateValue, setEstimateValue] = useState(
        task.estimate != null ? String(task.estimate) : ""
    )
    const [isEditingEstimate, setIsEditingEstimate] = useState(false)
    const [savingField, setSavingField] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([])
    const [auditLoading, setAuditLoading] = useState(false)
    const [auditError, setAuditError] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const startDateRef = useRef<HTMLInputElement>(null)
    const dueDateRef = useRef<HTMLInputElement>(null)

    const actionLabels: Record<string, string> = {
        CREATE_PROJECT: "Tạo project",
        UPDATE_PROJECT: "Cập nhật project",
        DELETE_PROJECT: "Xóa project",
        INVITE_MEMBER: "Mời thành viên",
        CHANGE_ROLE: "Đổi vai trò",
        CREATE_TASK: "Tạo task",
        UPDATE_TASK: "Cập nhật task",
        UPDATE_TASK_STATUS: "Đổi trạng thái task",
    }

    const fieldLabels: Record<string, string> = {
        title: "Tiêu đề",
        description: "Mô tả",
        status: "Trạng thái",
        importance: "Mức độ",
        labels: "Nhãn",
        estimate: "Estimate",
        assignees: "Người thực hiện",
        startDate: "Ngày bắt đầu",
        dueDate: "Ngày kết thúc",
        projectId: "Project",
    }

    const formatLogTime = (value: string) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return date.toLocaleString("vi-VN")
    }

    const formatFieldValue = (key: string, value: unknown) => {
        if (value === null || value === undefined || value === "") return "trống"
        if (Array.isArray(value)) {
            if (key === "assignees") {
                const names = value.map((assigneeId) => {
                    const user = availableUsers.find((u) => u.id === assigneeId)
                    return user?.name ?? String(assigneeId)
                })
                return names.join(", ") || "trống"
            }
            return value.map((item) => String(item)).join(", ")
        }
        if (typeof value === "string") {
            if (key === "startDate" || key === "dueDate") {
                const date = new Date(value)
                if (!Number.isNaN(date.getTime())) {
                    return date.toLocaleDateString("vi-VN")
                }
            }
            return value
        }
        if (typeof value === "number" || typeof value === "boolean") {
            return String(value)
        }
        return JSON.stringify(value)
    }

    const getLogChanges = (log: ActivityLog) => {
        const oldValue = (log.oldValue ?? {}) as Record<string, unknown>
        const newValue = (log.newValue ?? {}) as Record<string, unknown>
        const keys = Array.from(new Set([...Object.keys(oldValue), ...Object.keys(newValue)]))
        return keys
            .filter((key) => JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key]))
            .map((key) => ({
                key,
                label: fieldLabels[key] ?? key,
                from: formatFieldValue(key, oldValue[key]),
                to: formatFieldValue(key, newValue[key]),
            }))
    }

    const loadAuditLogs = async () => {
        if (!task.id) return
        try {
            setAuditLoading(true)
            setAuditError(null)
            const data = (await GET_METHOD(`/api/activity/task/${task.id}`)) as {
                logs?: ActivityLog[]
            }
            setAuditLogs(Array.isArray(data?.logs) ? data.logs : [])
        } catch {
            setAuditError("Không thể tải log audit")
        } finally {
            setAuditLoading(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSelectedUsers(task.assigneeIds || [])
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [task.assigneeIds])

    useEffect(() => {
        setStartDateValue(task.startDateValue ?? "")
        setDueDateValue(task.dueDateValue ?? "")
        setEstimateValue(task.estimate != null ? String(task.estimate) : "")
        setIsEditingEstimate(false)
        setSaveError(null)
        setSavingField(null)
    }, [task])

    useEffect(() => {
        loadAuditLogs()
    }, [task.id])

    useEffect(() => {
        const handleTaskUpdated = () => {
            loadAuditLogs()
        }
        window.addEventListener("task:updated", handleTaskUpdated)
        return () => window.removeEventListener("task:updated", handleTaskUpdated)
    }, [task.id])

    useEffect(() => {
        if (!task.projectId) return
        let active = true

        const load = async () => {
            try {
                const data = (await GET_METHOD(
                    `/api/projects/${task.projectId}/assignees`
                )) as AssigneeResponse
                if (!active) return
                setAvailableUsers(Array.isArray(data.assignees) ? data.assignees : [])
                setCurrentUserRole(data.currentUserRole)
            } catch {
                if (active) {
                    setAvailableUsers([])
                    setCurrentUserRole(null)
                }
            }
        }

        load()

        return () => {
            active = false
        }
    }, [task.projectId])

    const handleSelectUser = async (userId: string) => {
        const newSelectedUsers =
            currentUserRole === "Member"
                ? [userId]
                : selectedUsers.includes(userId)
                    ? selectedUsers.filter((id) => id !== userId)
                    : [...selectedUsers, userId]

        setSelectedUsers(newSelectedUsers)

        try {
            setSavingField("assignees")
            setSaveError(null)
            await PATCH_METHOD(`/api/task/${task.id}`, {
                assignees: newSelectedUsers,
            })
            window.dispatchEvent(new CustomEvent("task:updated"))
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to update assignees:", error)
            setSelectedUsers(task.assigneeIds || [])
            setSaveError("Cáº­p nháº­t ngÆ°á»i thÃ¡Â»Â±c hiÃ¡Â»â€¡n tháº¥t báº¡i")
        } finally {
            setSavingField(null)
        }
    }

    const handleStartDateChange = async (value: string) => {
        setStartDateValue(value)
        try {
            setSavingField("startDate")
            setSaveError(null)
            await PATCH_METHOD(`/api/task/${task.id}`, { startDate: value ?? "" })
            window.dispatchEvent(new CustomEvent("task:updated"))
        } catch {
            setSaveError("Cáº­p nháº­t ngÃ y báº¯t Ä‘áº§u tháº¥t báº¡i")
        } finally {
            setSavingField(null)
        }
    }

    const handleDueDateChange = async (value: string) => {
        setDueDateValue(value)
        try {
            setSavingField("dueDate")
            setSaveError(null)
            await PATCH_METHOD(`/api/task/${task.id}`, { dueDate: value ?? "" })
            window.dispatchEvent(new CustomEvent("task:updated"))
        } catch {
            setSaveError("Cáº­p nháº­t ngÃ y káº¿t thÃºc tháº¥t báº¡i")
        } finally {
            setSavingField(null)
        }
    }

    const handleEstimateBlur = async () => {
        try {
            setSavingField("estimate")
            setSaveError(null)
            if (estimateValue.trim() === "") {
                await PATCH_METHOD(`/api/task/${task.id}`, { estimate: null })
                window.dispatchEvent(new CustomEvent("task:updated"))
                setSavingField(null)
                return
            }
            const num = Number(estimateValue)
            if (Number.isNaN(num)) {
                setSaveError("Estimate khÃ´ng há»£p lá»‡")
                setSavingField(null)
                return
            }
            await PATCH_METHOD(`/api/task/${task.id}`, { estimate: num })
            window.dispatchEvent(new CustomEvent("task:updated"))
        } catch {
            setSaveError("Cáº­p nháº­t estimate tháº¥t báº¡i")
        } finally {
            setSavingField(null)
        }
    }

    const getAssigneeNames = () => {
        if (!selectedUsers || selectedUsers.length === 0) return "ChÆ°a nháº­n"

        const names = selectedUsers.map((assigneeId) => {
            const user = availableUsers.find((u) => u.id === assigneeId)
            if (user) return user.name
            const fallback = task.assignees?.find((name) => !!name)
            return fallback || assigneeId
        })

        return names.join(", ")
    }

    const disableAssigneeButton = availableUsers.length === 0

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                        {task.code}
                    </Badge>
                    <Badge variant="secondary">{task.status}</Badge>
                    {task.priority && (
                        <Badge
                            variant={
                                task.priority === "high"
                                    ? "destructive"
                                    : task.priority === "medium"
                                        ? "default"
                                        : "secondary"
                            }
                        >
                            {task.priority}
                        </Badge>
                    )}
                </div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
                {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between relative" ref={dropdownRef}>
                        <span className="text-sm text-muted-foreground">Assignees</span>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded-md transition-colors"
                                disabled={disableAssigneeButton}
                            >
                                <User size={14} className="text-muted-foreground" />
                                <span>{getAssigneeNames()}</span>
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-popover border rounded-md shadow-lg z-50">
                                    <div className="py-1 max-h-64 overflow-y-auto">
                                        {availableUsers.length > 0 ? (
                                            availableUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleSelectUser(user.id)}
                                                    className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-sm">{user.name}</span>
                                                        {user.email && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedUsers.includes(user.id) && (
                                                        <Check size={14} className="text-primary ml-2" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                                                KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Start date</span>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className="flex items-center gap-2 hover:text-foreground"
                                onClick={() => {
                                    if (startDateRef.current?.showPicker) {
                                        startDateRef.current.showPicker()
                                    } else {
                                        startDateRef.current?.focus()
                                    }
                                }}
                            >
                                <Calendar size={14} className="text-muted-foreground" />
                                <span>{startDateValue || "ChÆ°a Ä‘áº·t"}</span>
                            </button>
                            <Input
                                ref={startDateRef}
                                type="date"
                                className="absolute h-0 w-0 opacity-0 pointer-events-none"
                                value={startDateValue}
                                max={dueDateValue || undefined}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Due date</span>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className="flex items-center gap-2 hover:text-foreground"
                                onClick={() => {
                                    if (dueDateRef.current?.showPicker) {
                                        dueDateRef.current.showPicker()
                                    } else {
                                        dueDateRef.current?.focus()
                                    }
                                }}
                            >
                                <Calendar size={14} className="text-muted-foreground" />
                                <span>{dueDateValue || "ChÆ°a Ä‘áº·t"}</span>
                            </button>
                            <Input
                                ref={dueDateRef}
                                type="date"
                                className="absolute h-0 w-0 opacity-0 pointer-events-none"
                                value={dueDateValue}
                                min={startDateValue || undefined}
                                onChange={(e) => handleDueDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Estimate</span>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className="flex items-center gap-2 hover:text-foreground"
                                onClick={() => setIsEditingEstimate(true)}
                            >
                                <Clock size={14} className="text-muted-foreground" />
                                <span>
                                    {estimateValue ? `${estimateValue}h` : "ChÆ°a nháº­p"}
                                </span>
                            </button>
                            {isEditingEstimate && (
                                <Input
                                    type="number"
                                    min={0}
                                    className="h-8 w-[120px]"
                                    value={estimateValue}
                                    onChange={(e) => setEstimateValue(e.target.value)}
                                    onBlur={() => {
                                        setIsEditingEstimate(false)
                                        handleEstimateBlur()
                                    }}
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Labels</span>
                        <div className="flex items-center gap-2 text-sm">
                            <Tag size={14} className="text-muted-foreground" />
                            <span>
                                {task.labels && task.labels.length > 0
                                    ? task.labels.join(", ")
                                    : "ChÆ°a gáº¯n"}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">{task.createdAt ?? "N/A"}</span>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Updated</span>
                        <span className="text-sm">{task.updatedAt ?? "N/A"}</span>
                    </div>
                    {savingField && (
                        <div className="text-xs text-muted-foreground">Saving...</div>
                    )}
                    {saveError && (
                        <div className="text-xs text-red-500">{saveError}</div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Input
                            placeholder="Comment"
                        />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {auditLoading && (
                        <p className="text-sm text-muted-foreground">
                            Đang tải log audit...
                        </p>
                    )}
                    {!auditLoading && auditError && (
                        <p className="text-sm text-red-500">{auditError}</p>
                    )}
                    {!auditLoading && !auditError && auditLogs.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Chưa có log audit.
                        </p>
                    )}
                    {!auditLoading && !auditError && auditLogs.length > 0 && (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            {auditLogs.map((log) => {
                                const changes = getLogChanges(log)
                                return (
                                    <div key={log.id} className="rounded-md border p-2">
                                        <div className="text-sm font-medium">
                                            {actionLabels[log.action] ?? log.action}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(log.user?.name ?? "Hệ thống") +
                                                " • " +
                                                formatLogTime(log.createdAt)}
                                        </div>
                                        {changes.length > 0 && (
                                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                {changes.map((change) => (
                                                    <div key={`${log.id}-${change.key}`}>
                                                        <span className="font-medium text-foreground/80">
                                                            {change.label}:
                                                        </span>{" "}
                                                        {change.from} → {change.to}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
