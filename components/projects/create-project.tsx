"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    createProjectSchema,
    CreateProjectInput,
} from "@/lib/validations/project.validation"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

type CreateProjectProps = {
    onSuccessAction?: () => void
}

export default function CreateProject({ onSuccessAction }: CreateProjectProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            title: "",
            description: "",
            visibility: "private",
        },
    })

    async function onSubmit(data: CreateProjectInput) {
        setError(null)

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const payload = await res.json().catch(() => null)
                setError(payload?.message ?? "Tạo dự án thất bại")
                return
            }

            form.reset()
            router.refresh()
            onSuccessAction?.()
        } catch {
            setError("Tạo dự án thất bại")
        }
    }

    return (
        <div className="border rounded-xl p-6 bg-background shadow-sm">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    {/* Project name */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project name</FormLabel>

                                <FormControl>
                                    <Input placeholder="Project name" {...field} />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>

                                <FormControl>
                                    <Textarea
                                        placeholder="Project description"
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Visibility */}
                    <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between border rounded-lg p-4">
                                <div>
                                    <FormLabel>Public project</FormLabel>

                                    <p className="text-sm text-muted-foreground">
                                        Anyone in workspace can join
                                    </p>
                                </div>

                                <FormControl>
                                    <Switch
                                        checked={field.value === "public"}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked ? "public" : "private")
                                        }
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {error && (
                        <p className="text-sm text-red-500" role="alert">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Đang tạo..." : "Create project"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
