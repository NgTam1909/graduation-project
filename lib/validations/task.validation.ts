import { z } from "zod"
import { TaskStatus, ImportanceLevel } from "@/types/task"

const dateFromInput = (value: string) => new Date(`${value}T00:00:00`)

export const createTaskSchema = z.object({
    title: z.string().min(1, "TiÃªu Ä‘á» khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"),

    description: z.string().optional(),

    status: z.nativeEnum(TaskStatus).optional(),

    importance: z.nativeEnum(ImportanceLevel).optional(),

    projectId: z.string().min(1, "Thiáº¿u project"),

    assignees: z.array(z.string()).optional(),

    labels: z.array(z.string()).optional(),

    startDate: z.string().optional(),

    dueDate: z.string().optional(),

    estimate: z.number().optional(),
}).superRefine((data, ctx) => {
    if (data.estimate !== undefined && data.estimate < 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Estimate khÃ´ng Ä‘Æ°á»£c Ã¢m",
            path: ["estimate"],
        })
    }

    if (data.startDate && data.dueDate) {
        const start = dateFromInput(data.startDate)
        const due = dateFromInput(data.dueDate)
        if (start > due) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "NgÃ y báº¯t Ä‘áº§u khÃ´ng Ä‘Æ°á»£c sau ngÃ y káº¿t thÃºc",
                path: ["startDate"],
            })
        }
    }

    if (data.dueDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = dateFromInput(data.dueDate)
        if (due < today) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "NgÃ y káº¿t thÃºc khÃ´ng Ä‘Æ°á»£c trÆ°á»›c ngÃ y hiá»‡n táº¡i",
                path: ["dueDate"],
            })
        }
    }
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z
    .object({
        title: z
            .string()
            .min(1, "TiÃƒÂªu Ã„â€˜Ã¡Â»Â khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c Ã„â€˜Ã¡Â»Æ’ trÃ¡Â»â€˜ng")
            .optional(),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        importance: z.nativeEnum(ImportanceLevel).optional(),
        assignees: z.array(z.string()).optional(),
        labels: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
        estimate: z.number().nullable().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.estimate !== undefined && data.estimate !== null && data.estimate < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Estimate khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c ÃƒÂ¢m",
                path: ["estimate"],
            })
        }

        const hasStart = data.startDate && data.startDate.trim().length > 0
        const hasDue = data.dueDate && data.dueDate.trim().length > 0

        if (hasStart && hasDue) {
            const start = dateFromInput(data.startDate as string)
            const due = dateFromInput(data.dueDate as string)
            if (start > due) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "NgÃƒÂ y bÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c sau ngÃƒÂ y kÃ¡ÂºÂ¿t thÃƒÂºc",
                    path: ["startDate"],
                })
            }
        }

        if (hasDue) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const due = dateFromInput(data.dueDate as string)
            if (due < today) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "NgÃƒÂ y kÃ¡ÂºÂ¿t thÃƒÂºc khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c trÃ†Â°Ã¡Â»â€ºc ngÃƒÂ y hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i",
                    path: ["dueDate"],
                })
            }
        }
    })

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
