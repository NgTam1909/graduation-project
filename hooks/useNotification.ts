'use client'

import { useCallback, useEffect, useState } from "react"
import { GET_METHOD } from "@/lib/req"
import { NotificationItem } from "@/types/notification"

export function useNotification() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [logsError, setLogsError] = useState<string | null>(null)

    const loadNotifications = useCallback(async () => {
        try {
            setLogsLoading(true)
            setLogsError(null)

            const data = (await GET_METHOD("/api/activity/me")) as {
                notifications?: NotificationItem[]
            }

            setNotifications(Array.isArray(data?.notifications) ? data.notifications : [])
        } catch {
            setLogsError("Không thể tải thông báo")
        } finally {
            setLogsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadNotifications()
    }, [loadNotifications])

    useEffect(() => {
        const reload = () => {
            void loadNotifications()
        }

        window.addEventListener("task:updated", reload)
        return () => window.removeEventListener("task:updated", reload)
    }, [loadNotifications])

    return {
        notifications,
        logsLoading,
        logsError,
        loadNotifications,
    }
}