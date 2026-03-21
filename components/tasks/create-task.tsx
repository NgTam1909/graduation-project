"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createTaskSchema, CreateTaskInput } from "@/lib/validations/task.validation"
import { useCreateTask } from "@/hooks/useCreateTask"
import { GET_METHOD } from "@/lib/req"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { TaskStatus, ImportanceLevel } from "@/types/task"

type CreateTaskFormProps = {
    projectId: string
    onCreatedAction?: () => void
}

type AssigneeOption = {
    id: string
    name: string
    email: string
}

type AssigneeResponse = {
    currentUserId: string
    currentUserRole: "Admin" | "Leader" | "Member"
    assignees: AssigneeOption[]
}

export default function CreateTaskForm({ projectId, onCreatedAction }: CreateTaskFormProps) {
    const { createTask, loading, error } = useCreateTask()
    const today = new Date().toISOString().slice(0, 10)
    const [assigneeOptions, setAssigneeOptions] = useState<AssigneeOption[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentUserRole, setCurrentUserRole] = useState<AssigneeResponse["currentUserRole"] | null>(null)

    const form = useForm<CreateTaskInput>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: TaskStatus.BACKLOG,
            importance: ImportanceLevel.NONE,
            projectId,
            startDate: "",
            dueDate: "",
            estimate: undefined,
            assignees: [],
        },
    })

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                const data = (await GET_METHOD(
                    `/api/projects/${projectId}/assignees`
                )) as AssigneeResponse
                if (!active) return
                setAssigneeOptions(Array.isArray(data.assignees) ? data.assignees : [])
                setCurrentUserId(data.currentUserId)
                setCurrentUserRole(data.currentUserRole)

                if (data.currentUserRole === "Member" && data.currentUserId) {
                    form.setValue("assignees", [data.currentUserId], {
                        shouldValidate: true,
                        shouldDirty: true,
                    })
                } else {
                    form.setValue("assignees", [], {
                        shouldValidate: false,
                        shouldDirty: false,
                    })
                }
            } catch {
                if (active) {
                    setAssigneeOptions([])
                    setCurrentUserId(null)
                    setCurrentUserRole(null)
                }
            }
        }

        load()

        return () => {
            active = false
        }
    }, [projectId, form])

    const onSubmit = async (data: CreateTaskInput) => {
        const created = await createTask(data)
        if (created) {
            form.reset({
                title: "",
                description: "",
                status: TaskStatus.BACKLOG,
                importance: ImportanceLevel.NONE,
                projectId,
                startDate: "",
                dueDate: "",
                estimate: undefined,
                assignees:
                    currentUserRole === "Member" && currentUserId
                        ? [currentUserId]
                        : [],
            })
            onCreatedAction?.()
        }
    }

    const canAssignOthers = currentUserRole !== "Member"
    const assignHelperText =
        currentUserRole === "Member"
            ? "Báº¡n chá»‰ cÃ³ thá»ƒ tá»± nháº­n task."
            : currentUserRole === "Leader"
                ? "Leader cÃ³ thá»ƒ giao task cho thÃ nh viÃªn."
                : currentUserRole === "Admin"
                    ? "Admin cÃ³ thá»ƒ giao task cho táº¥t cáº£ thÃ nh viÃªn."
                    : ""

    return (
        <div className="max-w-xl space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* TITLE */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>TiÃªu Ä‘á»</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nháº­p tiÃªu Ä‘á» task..." {...field} />
                                </FormControl>
                                {assignHelperText && (
                                    <p className="text-xs text-muted-foreground">{assignHelperText}</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* DESCRIPTION */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>MÃ´ táº£</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="MÃ´ táº£ task..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* STATUS */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tráº¡ng thÃ¡i</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(TaskStatus).map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ASSIGNEE */}
                    <FormField
                        control={form.control}
                        name="assignees"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NgÆ°á»i thá»±c hiá»‡n</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value ? [value] : [])}
                                    value={field.value?.[0] ?? ""}
                                    disabled={!canAssignOthers}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chá»n ngÆ°á»i thá»±c hiá»‡n" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {assigneeOptions.map((option) => (
                                            <SelectItem key={option.id} value={option.id}>
                                                {option.name || option.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* IMPORTANCE */}
                    <FormField
                        control={form.control}
                        name="importance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Äá»™ Æ°u tiÃªn</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chá»n Ä‘á»™ Æ°u tiÃªn" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ImportanceLevel).map((i) => (
                                            <SelectItem key={i} value={i}>
                                                {i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* START DATE */}
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NgÃ y báº¯t Ä‘áº§u</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        max={form.getValues("dueDate") || undefined}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* DUE DATE */}
                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NgÃ y káº¿t thÃºc</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        min={form.getValues("startDate") || today}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ESTIMATE */}
                    <FormField
                        control={form.control}
                        name="estimate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estimate (giá»)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === "" ? undefined : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ERROR */}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* SUBMIT */}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Äang táº¡o..." : "Táº¡o Task"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
