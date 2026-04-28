"use client"

import { useEffect } from "react"
import {
    getTaskAssignees,
    getTaskAuditLogs,
    getTaskComments,
} from "@/services/task.service"

export function useTaskDetailEffects(task: any, state: any) {
    const loadAuditLogs = async () => {
        if (!task.id) return

        try {
            state.setAuditLoading(true)
            state.setAuditError(null)

            const data = await getTaskAuditLogs(task.id)
            state.setAuditLogs(Array.isArray(data?.logs) ? data.logs : [])
        } catch {
            state.setAuditError("Không thể tải log audit")
        } finally {
            state.setAuditLoading(false)
        }
    }

    const loadComments = async () => {
        if (!task.id) return

        try {
            state.setCommentsLoading(true)
            state.setCommentsError(null)

            const data = await getTaskComments(task.id)
            state.setComments(Array.isArray(data?.comments) ? data.comments : [])
        } catch {
            state.setCommentsError("Không thể tải bình luận")
        } finally {
            state.setCommentsLoading(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                state.dropdownRef.current &&
                !state.dropdownRef.current.contains(event.target as Node)
            ) {
                state.setIsOpen(false)
                state.setSelectedUsers(task.assigneeIds || [])
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [task.assigneeIds])

    useEffect(() => {
        state.setTitleValue(task.title ?? "")
        state.setDescriptionValue(task.description ?? "")
        state.setPriorityValue(task.priority ?? "")
        state.setStartDateValue(task.startDateValue ?? "")
        state.setDueDateValue(task.dueDateValue ?? "")
        state.setEstimateValue(task.estimate != null ? String(task.estimate) : "")
        state.setIsEditingTitle(false)
        state.setIsEditingDescription(false)
        state.setIsEditingEstimate(false)
        state.setSaveError(null)
    }, [task])

    useEffect(() => {
        loadAuditLogs()
        loadComments()
    }, [task.id])

    useEffect(() => {
        const handleTaskUpdated = () => {
            loadAuditLogs()
            loadComments()
        }

        window.addEventListener("task:updated", handleTaskUpdated)
        return () => window.removeEventListener("task:updated", handleTaskUpdated)
    }, [task.id])

    useEffect(() => {
        if (!task.projectId) return

        let active = true

        const loadAssignees = async () => {
            try {
                const data = await getTaskAssignees(task.projectId)

                if (!active) return

                state.setAvailableUsers(
                    Array.isArray(data.assignees) ? data.assignees : []
                )

                state.setCurrentUserRole(data.currentUserRole)
            } catch {
                if (active) {
                    state.setAvailableUsers([])
                    state.setCurrentUserRole(null)
                }
            }
        }

        void loadAssignees()

        return () => {
            active = false
        }
    }, [task.projectId])
}