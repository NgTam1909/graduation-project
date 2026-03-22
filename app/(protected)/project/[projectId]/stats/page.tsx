'use client'

import { useParams } from "next/navigation"
import SmartDashboard from "@/components/projects/stas-project"

export default function ProjectStatsPage() {
    const params = useParams<{ projectId: string }>()
    const projectId = params?.projectId

    if (!projectId) {
        return <p className="text-sm text-muted-foreground">Thiếu projectId.</p>
    }

    return (
        <div className="space-y-6">
            <section className="space-y-2">
                <h1 className="text-xl font-semibold">Thống kê</h1>
                <p className="text-sm text-muted-foreground">
                    Tổng quan công việc của dự án.
                </p>
            </section>
            <SmartDashboard projectId={projectId} />
        </div>
    )
}
