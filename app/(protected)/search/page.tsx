"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSearch } from "@/hooks/useSearch"

export default function SearchPage() {
    const params = useSearchParams()
    const q = (params.get("q") ?? "").trim()
    const { data, loading, error } = useSearch(q)

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Tìm kiếm</h1>
                <p className="text-sm text-muted-foreground">
                    Từ khóa:{" "}
                    <span className="font-medium text-foreground">
                        {q ? q : "(trống)"}
                    </span>
                </p>
                <p className="text-xs text-muted-foreground">
                    Lưu ý: dự án private không hiển thị trong mục Projects. Task thuộc dự án private
                    chỉ hiện nếu bạn là thành viên.
                </p>
            </div>

            {loading && <div className="text-sm text-muted-foreground">Đang tìm...</div>}
            {!loading && error && <div className="text-sm text-red-600">{error}</div>}

            {!loading && !error && data && (
                <div className="grid gap-6 md:grid-cols-3">
                    <section className="rounded-xl border bg-background p-4">
                        <div className="mb-3 text-sm font-semibold">Projects</div>
                        {data.projects.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Không có kết quả</div>
                        ) : (
                            <ul className="space-y-2">
                                {data.projects.map((p) => (
                                    <li key={p.id}>
                                        <Link
                                            href={`/project/${p.projectId}/tasks`}
                                            className={cn(
                                                "block rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                            )}
                                        >
                                            <div className="font-medium">{p.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.projectId}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-xl border bg-background p-4">
                        <div className="mb-3 text-sm font-semibold">Tasks</div>
                        {data.tasks.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Không có kết quả</div>
                        ) : (
                            <ul className="space-y-2">
                                {data.tasks.map((t) => (
                                    <li key={t.id}>
                                        <Link
                                            href={`/project/${t.projectId}/tasks?taskId=${t.id}`}
                                            className="block rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="font-medium">{t.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t.code}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t.projectTitle}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-xl border bg-background p-4">
                        <div className="mb-3 text-sm font-semibold">Users</div>
                        {data.users.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Không có kết quả</div>
                        ) : (
                            <ul className="space-y-2">
                                {data.users.map((u) => (
                                    <li key={u.id} className="rounded-md border px-3 py-2">
                                        <div className="text-sm font-medium">{u.name}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}
