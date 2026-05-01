// CreateTaskForm.tsx
"use client"

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
import { PriorityLevel, TaskStatus } from "@/types/task"
import { useCreateTask } from "@/hooks/useCreateTask"

type CreateTaskFormProps = {
    projectId: string
    parentId?: string
    onCreatedAction?: () => void
}

export default function CreateTaskForm({
                                           projectId,
                                           parentId,
                                           onCreatedAction,
                                       }: CreateTaskFormProps) {
    const { form, loading, error, assigneeOptions, canAssignOthers, onSubmit } = useCreateTask({
        projectId,
        parentId,
        onSuccess: onCreatedAction,
    })

    return (
        <div className="max-w-xl space-y-4 wb-5 max-h-[80vh] overflow-y-auto">
            <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input type="hidden" {...form.register("projectId")} />
                    <input type="hidden" {...form.register("parentId")} />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập tiêu đề task..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Mô tả task..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={() => (
                            <FormItem>
                                <FormLabel>Trạng thái</FormLabel>
                                <FormControl>
                                    <div className="flex h-10 w-full items-center rounded-md border bg-muted px-3 text-sm">
                                        {TaskStatus.BACKLOG}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="assignees"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Người thực hiện</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value ? [value] : [])}
                                    value={field.value?.[0] ?? ""}
                                    disabled={!canAssignOthers}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn người thực hiện" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {assigneeOptions.map((option) => (
                                            <SelectItem key={option.id} value={option.id}>
                                                <span className="text-sm">{option.name || option.email}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Độ ưu tiên</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Mức độ ưu tiên của task" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(PriorityLevel).map((priority) => (
                                            <SelectItem key={priority} value={priority}>
                                                {priority}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày bắt đầu</FormLabel>
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

                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày kết thúc</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        min={form.getValues("startDate") || new Date().toISOString().slice(0, 10)}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="estimate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giới hạn (giờ)</FormLabel>
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

                    {error && <p className="text-red-500">{error}</p>}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Đang tạo..." : "Tạo Task"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}