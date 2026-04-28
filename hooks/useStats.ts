'use client'

import { useMemo, useState } from "react"
import { buildAdvancedStats } from "@/lib/stast"
import { Task } from "@/types/task"
import {getTaskOverDue} from "@/lib/overDue";
import type {MonthlyItem, StatsListFilter} from "@/types/stats"



function monthKeyFromDate(date: Date) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
}

function isTaskOverdue(task: Task, now: Date) {
    return getTaskOverDue(task, now).isOverdue
}

export function useStats(tasks: Task[]) {
    const currentMonth = useMemo(() => monthKeyFromDate(new Date()), [])
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [listFilter, setListFilter] = useState<StatsListFilter>({
        kind: "all",
    })

    const monthlyData = useMemo<MonthlyItem[]>(() => {
        const now = new Date()
        const map = new Map<string, MonthlyItem>()

        const ensure = (key: string) => {
            if (!map.has(key)) {
                map.set(key, { month: key, created: 0, completed: 0, overdue: 0 })
            }
            return map.get(key)!
        }

        tasks.forEach((task) => {
            if (task.createdAt) {
                const key = monthKeyFromDate(new Date(task.createdAt))
                const item = ensure(key)
                item.created += 1

                if (isTaskOverdue(task, now)) {
                    item.overdue += 1
                }
            }

            if (task.status === "done" && task.updatedAt) {
                const key = monthKeyFromDate(new Date(task.updatedAt))
                const item = ensure(key)
                item.completed += 1
            }
        })

        return Array.from(map.values())
    }, [tasks])
    const tasksInSelectedMonth = useMemo(() => {
        if (!selectedMonth) return tasks

        return tasks.filter((t) => {
            if (!t.createdAt) return false
            return monthKeyFromDate(new Date(t.createdAt)) === selectedMonth
        })
    }, [tasks, selectedMonth])

    const { statusCount } = useMemo(() => {
        return buildAdvancedStats(tasksInSelectedMonth)
    }, [tasksInSelectedMonth])

    const pieData = useMemo(() => {
        return Object.entries(statusCount).map(([name, value]) => ({
            name,
            value,
        }))
    }, [statusCount])

    const overdueCount = useMemo(() => {
        const now = new Date()
        return tasks.filter((task) =>
            getTaskOverDue(task, now).isOverdue
        ).length
    }, [tasks])

    const completedCount = useMemo(() => {
        return tasks.filter((t) => t.status === "done").length
    }, [tasks])

    const cancelledCount = useMemo(() => {
        return tasks.filter((t) => t.status === "cancelled").length
    }, [tasks])
    const filteredTasks = useMemo(() => {
        const now = new Date()

        if (listFilter.kind === "all") return tasks
        if (listFilter.kind === "done") {
            return tasks.filter((t) => t.status === "done")
        }
        if (listFilter.kind === "cancelled") {
            return tasks.filter((t) => t.status === "cancelled")
        }
        if (listFilter.kind === "status") {
            return tasks.filter((t) => t.status === listFilter.status)
        }

        // overdue
        return tasks.filter((t) => isTaskOverdue(t, now))
    }, [tasks, listFilter])

    return {
        currentMonth,
        selectedMonth,
        setSelectedMonth,
        listFilter,
        setListFilter,
        monthlyData,
        pieData,
        filteredTasks,
        totalCount: tasks.length,
        completedCount,
        overdueCount,
        cancelledCount,
    }
}
