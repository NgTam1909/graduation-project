"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import {
    taskDetailActionLabels,
    taskDetailFieldLabels,
    taskDetailPriorityOptions,
} from "@/constants/task-detail"

import { TaskSubtasks } from "@/components/tasks/task-subtasks"
import { useTaskDetail } from "@/hooks/useTaskDetail"

import { ActivityLog } from "@/types/activity-log"
import { Task } from "@/types/task"

type TaskDetailProps = {
    task: Task
}

const getPriorityBadgeVariant = (priority?: string) => {
    if (priority === "high") return "destructive" as const
    if (priority === "medium") return "default" as const
    return "secondary" as const
}

const formatLogTime = (value: string) => {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString("vi-VN")
}

export function TaskDetail({ task }: TaskDetailProps) {
    const {
        isOpen,
        setIsOpen,

        availableUsers,
        selectedUsers,

        titleValue,
        descriptionValue,
        priorityValue,
        startDateValue,
        dueDateValue,
        estimateValue,

        isEditingTitle,
        isEditingDescription,
        isEditingEstimate,

        commentValue,

        timelineItems,

        saveError,
        auditLoading,
        commentsLoading,
        auditError,
        commentsError,

        dropdownRef,
        startDateRef,
        dueDateRef,

        setTitleValue,
        setDescriptionValue,
        setEstimateValue,
        setCommentValue,

        setIsEditingTitle,
        setIsEditingDescription,
        setIsEditingEstimate,

        handleSelectUser,
        handleTitleBlur,
        handleDescriptionBlur,
        handlePriorityChange,
        handleStartDateChange,
        handleDueDateChange,
        handleEstimateBlur,
        handleCommentSubmit,
    } = useTaskDetail(task)

    const disableAssigneeButton = availableUsers.length === 0

    const getAssigneeNames = () => {
        if (!selectedUsers.length) return "Chưa nhận"

        return selectedUsers
            .map((assigneeId) => {
                const user = availableUsers.find((item) => item.id === assigneeId)
                return user?.name ?? assigneeId
            })
            .join(", ")
    }

    const formatLogValue = (key: string, value: unknown) => {
        if (value === null || value === undefined || value === "") return "Trống"

        if (Array.isArray(value)) {
            if (key === "assignees") {
                return (
                    value
                        .map((assigneeId) => {
                            const user = availableUsers.find(
                                (item) => item.id === String(assigneeId)
                            )

                            return user?.name ?? String(assigneeId)
                        })
                        .join(", ") || "Trống"
                )
            }

            return value.map((item) => String(item)).join(", ")
        }

        if (typeof value === "string") {
            const date = new Date(value)

            if (
                !Number.isNaN(date.getTime()) &&
                (
                    key === "startDate" ||
                    key === "dueDate" ||
                    /^\d{4}-\d{2}-\d{2}T/.test(value)
                )
            ) {
                return date.toLocaleDateString("vi-VN")
            }
        }

        return String(value)
    }

    const getLogChanges = (log: ActivityLog) => {
        const oldValue = (log.oldValue ?? {}) as Record<string, unknown>
        const newValue = (log.newValue ?? {}) as Record<string, unknown>

        const keys = Array.from(
            new Set([
                ...Object.keys(oldValue),
                ...Object.keys(newValue),
            ])
        )

        return keys
            .filter(
                (key) =>
                    JSON.stringify(oldValue[key]) !==
                    JSON.stringify(newValue[key])
            )
            .map((key) => ({
                key,
                label: taskDetailFieldLabels[key] ?? key,
                from: formatLogValue(key, oldValue[key]),
                to: formatLogValue(key, newValue[key]),
            }))
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                        {task.code}
                    </Badge>

                    <Badge variant="secondary">
                        {task.status}
                    </Badge>

                    <Select
                        value={priorityValue}
                        onValueChange={(value) =>
                            void handlePriorityChange(
                                value as "low" | "medium" | "high" | ""
                            )
                        }
                    >
                        <SelectTrigger className="h-8 w-[132px] border-0 px-0 shadow-none focus:ring-0">
                            <Badge variant={getPriorityBadgeVariant(priorityValue)}>
                                <SelectValue placeholder="None" />
                            </Badge>
                        </SelectTrigger>

                        <SelectContent>
                            {taskDetailPriorityOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    {!isEditingTitle ? (
                        <button
                            type="button"
                            className="text-left text-xl font-semibold hover:text-foreground"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {titleValue || "Chưa có tiêu đề"}
                        </button>
                    ) : (
                        <Input
                            value={titleValue}
                            onChange={(e) =>
                                setTitleValue(e.target.value)
                            }
                            onBlur={() => {
                                setIsEditingTitle(false)
                                void handleTitleBlur()
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setIsEditingTitle(false)
                                    void handleTitleBlur()
                                }
                            }}
                            autoFocus
                            className="text-xl font-semibold"
                        />
                    )}
                </div>

                <div>
                    {!isEditingDescription ? (
                        <button
                            type="button"
                            className="min-h-6 text-left text-sm text-muted-foreground hover:text-foreground"
                            onClick={() =>
                                setIsEditingDescription(true)
                            }
                        >
                            {descriptionValue || "Chưa có mô tả"}
                        </button>
                    ) : (
                        <Textarea
                            value={descriptionValue}
                            onChange={(e) =>
                                setDescriptionValue(e.target.value)
                            }
                            onBlur={() => {
                                setIsEditingDescription(false)
                                void handleDescriptionBlur()
                            }}
                            autoFocus
                        />
                    )}
                </div>
            </div>

            <TaskSubtasks parentTask={task} />

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">
                        Chi tiết
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative flex items-start justify-between" ref={dropdownRef}>
                        <span className="text-sm text-muted-foreground">Người thực hiện</span>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex cursor-pointer items-center gap-2 rounded-md p-1 text-sm transition-colors hover:bg-accent"
                                disabled={disableAssigneeButton}
                            >
                                <span>{getAssigneeNames()}</span>
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border bg-popover shadow-lg">
                                    <div className="max-h-64 overflow-y-auto py-1">
                                        {availableUsers.length > 0 ? (
                                            availableUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => void handleSelectUser(user.id)}
                                                    className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-accent"
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-sm">{user.name}</span>
                                                        {user.email && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        )}
                                                        {user.position && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.position}
                                                            </p>
                                                        )}
                                                        {user.skills && user.skills.length > 0 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.skills.join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-center text-sm text-muted-foreground">
                                                Chưa có người làm
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Ngày bắt đầu</span>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className="hover:text-foreground"
                                onClick={() => startDateRef.current?.showPicker?.()}
                            >
                                {startDateValue || "N/A"}
                            </button>
                            <Input
                                ref={startDateRef}
                                type="date"
                                className="pointer-events-none absolute h-0 w-0 opacity-0"
                                value={startDateValue}
                                max={dueDateValue || undefined}
                                onChange={(e) => void handleStartDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Ngày kết thúc</span>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                type="button"
                                className="hover:text-foreground"
                                onClick={() => dueDateRef.current?.showPicker?.()}
                            >
                                {dueDateValue || "N/A"}
                            </button>
                            <Input
                                ref={dueDateRef}
                                type="date"
                                className="pointer-events-none absolute h-0 w-0 opacity-0"
                                value={dueDateValue}
                                min={startDateValue || undefined}
                                onChange={(e) => void handleDueDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Giới hạn (h)</span>
                        <div className="flex items-center gap-2 text-sm">
                            {!isEditingEstimate ? (
                                <button
                                    type="button"
                                    className="hover:text-foreground"
                                    onClick={() => setIsEditingEstimate(true)}
                                >
                                    {estimateValue ? `${estimateValue}h` : "0"}
                                </button>
                            ) : (
                                <Input
                                    type="number"
                                    min={0}
                                    className="h-8 w-[120px]"
                                    value={estimateValue}
                                    onChange={(e) => setEstimateValue(e.target.value)}
                                    onBlur={() => {
                                        setIsEditingEstimate(false)
                                        void handleEstimateBlur()
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setIsEditingEstimate(false)
                                            void handleEstimateBlur()
                                        }
                                    }}
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Nhãn</span>
                        <span className="text-sm">
                            {task.labels && task.labels.length > 0 ? task.labels.join(", ") : "Không có"}
                        </span>
                    </div>

                    <Separator />
                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                        <span className="text-sm">{task.createdAt ?? "N/A"}</span>
                    </div>

                    <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Cập nhật gần nhất:</span>
                        <span className="text-sm">{task.updatedAt ?? "N/A"}</span>
                    </div>

                    {saveError && <div className="text-xs text-red-500">{saveError}</div>}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Bình luận"
                                value={commentValue}
                                onChange={(e) => setCommentValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        void handleCommentSubmit()
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => void handleCommentSubmit()}
                                disabled={commentValue.trim().length === 0}
                            >
                                Gửi
                            </Button>
                        </div>
                        {commentsError && <p className="text-sm text-red-500">{commentsError}</p>}
                    </div>
                    {!auditLoading && auditError && (
                        <p className="text-sm text-red-500">{auditError}</p>
                    )}

                    {!auditLoading && !commentsLoading && !auditError && timelineItems.length > 0 && (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            {timelineItems.map((item) => {
                                if (item.kind === "comment") {
                                    return (
                                        <div key={item.id} className="rounded-md border p-2">
                                            <div className="text-sm font-medium">Bình luận</div>
                                            <div className="text-xs text-muted-foreground">
                                                {(item.comment.user?.name ?? "Hệ thống") +
                                                    "  " +
                                                    formatLogTime(item.comment.createdAt)}
                                            </div>
                                            <div className="mt-2 text-sm">{item.comment.content}</div>
                                        </div>
                                    )
                                }

                                const changes = getLogChanges(item.log)
                                return (
                                    <div key={item.id} className="rounded-md border p-2">
                                        <div className="text-sm font-medium">
                                            {taskDetailActionLabels[item.log.action] ?? item.log.action}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(item.log.user?.name ?? "Hệ thống") +
                                                "  " +
                                                formatLogTime(item.log.createdAt)}
                                        </div>
                                        {changes.length > 0 && (
                                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                {changes.map((change) => (
                                                    <div key={`${item.log.id}-${change.key}`}>
                                                        <span className="font-medium text-foreground/80">
                                                            {change.label}:
                                                        </span>{" "}
                                                        {change.to}
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