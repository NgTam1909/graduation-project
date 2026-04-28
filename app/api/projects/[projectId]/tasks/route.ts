import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import Project from "@/models/project.model"
import Task from "@/models/task.model"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getUserIdFromRequest(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, SECRET)
        const id = (payload.id || payload.userId) as string | undefined
        return id ?? null
    } catch {
        return null
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { projectId } = await params
        if (!projectId) {
            return NextResponse.json({ message: "Không thấy projectId" }, { status: 400 })
        }

        await connectDB()

        const project = await Project.findOne({ projectId })
        if (!project) {
            return NextResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
        }

        const isMember =
            project.owner?.userId?.toString() === userId ||
            project.members?.some((m) => m.userId?.toString() === userId)

        if (!isMember) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const tasks = await Task.find({ projectId: project._id })
            .populate("assignees", "firstName lastName email")
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            project: {
                title: project.title,
                projectId: project.projectId,
            },
            tasks,
        })
    } catch {
        return NextResponse.json(
            { message: "Không tìm thấy task" },
            { status: 500 }
        )
    }
}
