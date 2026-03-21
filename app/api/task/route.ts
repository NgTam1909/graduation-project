import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import Task from "@/models/task.model"
import Project, { ProjectRole, IProjectMember } from "@/models/project.model"
import { createTaskSchema } from "@/lib/validations/task.validation"
import ActivityLog, { ActivityAction } from "@/models/activityLog.model"

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

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const body = await req.json()
        const parsed = createTaskSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dá»¯ liá»‡u khÃ´ng há»£p lá»‡", errors: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const data = parsed.data
        const rawProjectId = data.projectId as string | undefined

        if (!rawProjectId) {
            return NextResponse.json(
                { message: "Thiáº¿u project" },
                { status: 400 }
            )
        }

        let project = await Project.findOne({ projectId: rawProjectId })
        if (!project && mongoose.isValidObjectId(rawProjectId)) {
            project = await Project.findById(rawProjectId)
        }

        if (!project) {
            return NextResponse.json(
                { message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n" },
                { status: 404 }
            )
        }

        let currentRole: ProjectRole | null = null
        if (project.owner?.userId?.toString() === userId) {
            currentRole = project.owner.role
        } else {
            const member = project.members.find((m: IProjectMember) => m.userId?.toString() === userId)
            currentRole = member?.role ?? null
        }

        if (!currentRole) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const ownerId = project.owner.userId.toString()
        const memberIds = project.members.map((m: IProjectMember) => m.userId.toString())
        const allIds = Array.from(new Set([ownerId, ...memberIds]))

        let assignableIds: string[] = []
        if (currentRole === ProjectRole.MEMBER) {
            assignableIds = [userId]
        } else if (currentRole === ProjectRole.LEADER) {
            const memberOnlyIds = project.members
                .filter((m: IProjectMember) => m.role === ProjectRole.MEMBER)
                .map((m: IProjectMember) => m.userId.toString())
            assignableIds = Array.from(new Set([userId, ...memberOnlyIds]))
        } else {
            assignableIds = allIds
        }

        const requestedAssignees = data.assignees && data.assignees.length > 0 ? data.assignees : []

        const invalidAssignees = requestedAssignees.filter(
            (assigneeId) => !assignableIds.includes(assigneeId)
        )

        if (invalidAssignees.length > 0) {
            return NextResponse.json(
                { message: "KhÃ´ng cÃ³ quyá»n gáº¯n ngÆ°á»i thÆ°á»±c hiá»‡n nÃ y" },
                { status: 403 }
            )
        }

        const task = await Task.create({
            ...data,
            projectId: project._id,
            creatorId: new mongoose.Types.ObjectId(userId),
            assignees: requestedAssignees.map((id) => new mongoose.Types.ObjectId(id)),
            overDue: false,
        })

        try {
            await ActivityLog.create({
                userId: new mongoose.Types.ObjectId(userId),
                projectId: project._id,
                entityType: "Task",
                entityId: task._id,
                action: ActivityAction.CREATE_TASK,
                newValue: {
                    title: task.title,
                    status: task.status,
                    assignees: requestedAssignees,
                },
            })
        } catch {
            // ignore audit log errors
        }

        return NextResponse.json(task)
    } catch {
        return NextResponse.json(
            { message: "Create task failed" },
            { status: 500 }
        )
    }
}
