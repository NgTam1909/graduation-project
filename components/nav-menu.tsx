'use client';

import { useEffect, useMemo, useState } from "react"
import {Search, Bell, HelpCircle, User, ArrowRight} from 'lucide-react';
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { GET_METHOD, POST_METHOD } from "@/lib/req";
import { ActivityLog } from "@/types/activity-log";

/* type props */
type NavMenuProps = {
    onToggleSidebarAction?: () => void
    className?: string
}

export default function NavMenu({
    onToggleSidebarAction,
    className,
}: NavMenuProps) {
    const pathname = usePathname()
    const projectId = useMemo(() => {
        if (!pathname) return null
        const match = pathname.match(/\/project\/([^/]+)/)
        return match?.[1] ?? null
    }, [pathname])
    const [projectLogs, setProjectLogs] = useState<ActivityLog[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [logsError, setLogsError] = useState<string | null>(null)

    const actionLabels: Record<string, string> = {
        CREATE_PROJECT: "Tạo dự án",
        UPDATE_PROJECT: "Cập nhật dự án",
        DELETE_PROJECT: "Xóa dự án",
        INVITE_MEMBER: "Mời thành viên",
        CHANGE_ROLE: "Thay đổi vai trò",
        CREATE_TASK: "Tạo công việc",
        UPDATE_TASK: "Cập nhật công việc",
        UPDATE_TASK_STATUS: "Cập nhật trạng thái công việc",
    }

    const fieldLabels: Record<string, string> = {
        title: "Tiêu đề",
        description: "Mô tả",
        status: "Trạng thái",
        importance: "Độ ưu tiên",
        labels: "Nhãn",
        estimate: "Giới hạn",
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

    const loadProjectLogs = async () => {
        if (!projectId) {
            setProjectLogs([])
            return
        }
        try {
            setLogsLoading(true)
            setLogsError(null)
            const data = (await GET_METHOD(`/api/activity/project/${projectId}`)) as {
                logs?: ActivityLog[]
            }
            setProjectLogs(Array.isArray(data?.logs) ? data.logs : [])
        } catch {
            setLogsError("Không thể tải thông báo")
        } finally {
            setLogsLoading(false)
        }
    }

    const handleNotificationOpenChange = (open: boolean) => {
        if (open) {
            loadProjectLogs()
        }
    }

    const handleLogout = async () => {
        await POST_METHOD("/api/auth/logout", {})

        localStorage.removeItem("accessToken")

        window.location.href = "/login"
    }

    useEffect(() => {
        loadProjectLogs()
    }, [projectId])

    useEffect(() => {
        const handleTaskUpdated = () => {
            loadProjectLogs()
        }
        window.addEventListener("task:updated", handleTaskUpdated)
        return () => window.removeEventListener("task:updated", handleTaskUpdated)
    }, [projectId])

    return (
        <nav className={cn("w-full border-b bg-background", className)}>
            <div
                className={cn(
                    "flex w-full items-center justify-between px-4 py-2"
                )}
            >

                {/* LEFT */}
                <div className="flex items-center gap-3">

                    {/* nút toggle sidebar */}
                    {onToggleSidebarAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleSidebarAction}
                            aria-label="Mở sidebar"
                        >
                            <Image src="/logo.svg" alt="Logo" width={20} height={20} />
                        </Button>
                    )}

                    <div className="relative w-80">
                        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="w-full pl-8 pr-4"
                        />
                    </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">

                    <Button variant="ghost" size="icon">
                        <HelpCircle size={20} />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <DropdownMenu onOpenChange={handleNotificationOpenChange}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="ThÃ´ng bÃ¡o">
                                <Bell size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-96">
                            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!projectId && (
                                <div className="px-2 py-2 text-xs text-muted-foreground">
                                    Chọn project để xem thông báo.
                                </div>
                            )}
                            {projectId && logsLoading && (
                                <div className="px-2 py-2 text-xs text-muted-foreground">
                                    Đang tải thông báo...
                                </div>
                            )}
                            {projectId && !logsLoading && logsError && (
                                <div className="px-2 py-2 text-xs text-red-500">
                                    {logsError}
                                </div>
                            )}
                            {projectId && !logsLoading && !logsError && projectLogs.length === 0 && (
                                <div className="px-2 py-2 text-xs text-muted-foreground">
                                    Chưa có thông báo.
                                </div>
                            )}
                            {projectId && !logsLoading && !logsError && projectLogs.length > 0 && (
                                <div className="max-h-80 overflow-auto">
                                    {projectLogs.map((log) => {
                                        const changes = getLogChanges(log)
                                        return (
                                            <div
                                                key={log.id}
                                                className="rounded-md px-2 py-2 text-sm hover:bg-accent"
                                            >
                                                <div className="font-medium">
                                                    {actionLabels[log.action] ?? log.action}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {(log.user?.name ?? "Hệ thống") +
                                                        " - " +
                                                        formatLogTime(log.createdAt)}
                                                </div>
                                                {changes.length > 0 && (
                                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                        {changes.map((change) => (
                                                            <div key={`${log.id}-${change.key}`}>
                                                                <span className="font-medium text-foreground/80">
                                                                    {change.label}:
                                                                </span>{" "}
                                                                {change.from} <ArrowRight size={12} className="text-muted-foreground" /> {change.to}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-6" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="User menu">
                                <User size={20} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>
                                Quản lý tài khoản
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-red-500"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </div>
        </nav>
    );
}
