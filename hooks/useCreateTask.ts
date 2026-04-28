import { useState } from "react"
import { CreateTaskInput } from "@/lib/validations/task.validation"
import { createTask as createTaskRequest } from "@/services/task.service"

export function useCreateTask() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createTask = async (data: CreateTaskInput) => {
        try {
            setLoading(true)
            setError(null)

            return await createTaskRequest(data)
        } catch (err: unknown) {
            const payload = (err as { response?: { data?: { message?: string } } })?.response?.data
            const message = payload?.message ?? "Tạo thất bại!"
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return { createTask, loading, error }
}
