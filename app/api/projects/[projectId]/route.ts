import mongoose from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import Project, { ProjectRole, IProjectMember } from "@/models/project.model"
import { updateProjectSchema } from "@/lib/validations/project.validation"
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

async function findProjectByParam(projectId: string) {
    let project = await Project.findOne({ projectId })
    if (!project && mongoose.isValidObjectId(projectId)) {
        project = await Project.findById(projectId)
    }
    return project
}

function getUserRole(project: typeof Project.prototype, userId: string) {
    if (project.owner?.userId?.toString() === userId) {
        return project.owner.role
    }
    const member = project.members.find((m: IProjectMember) => m.userId?.toString() === userId)
    return member?.role ?? null
}

function canEditProject(role: ProjectRole | null) {
    return role === ProjectRole.ADMIN || role === ProjectRole.LEADER
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
            return NextResponse.json({ message: "KhÃ´ng tháº¥y projectId" }, { status: 400 })
        }

        await connectDB()

        const project = await findProjectByParam(projectId)
        if (!project) {
            return NextResponse.json({ message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n" }, { status: 404 })
        }

        const isMember =
            project.owner?.userId?.toString() === userId ||
            project.members?.some((m: IProjectMember) => m.userId?.toString() === userId)

        if (!isMember) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({
            projectId: project.projectId,
            title: project.title,
            description: project.description ?? "",
            isPublic: project.isPublic,
        })
    } catch {
        return NextResponse.json(
            { message: "KhÃ´ng thá»ƒ láº¥y thÃ´ng tin dá»± Ã¡n" },
            { status: 500 }
        )
    }
}

export async function PATCH(
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
            return NextResponse.json({ message: "KhÃ´ng tháº¥y projectId" }, { status: 400 })
        }

        const body = await req.json()
        const parsed = updateProjectSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dá»¯ liá»‡u khÃ´ng há»£p lá»‡", errors: parsed.error.flatten() },
                { status: 400 }
            )
        }

        await connectDB()

        const project = await findProjectByParam(projectId)
        if (!project) {
            return NextResponse.json({ message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n" }, { status: 404 })
        }

        const role = getUserRole(project, userId)
        if (!canEditProject(role)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const oldValue = {
            title: project.title,
            description: project.description ?? "",
            isPublic: project.isPublic,
        }

        project.title = parsed.data.title
        project.description = parsed.data.description ?? ""
        project.isPublic = parsed.data.visibility === "public"
        await project.save()

        try {
            await ActivityLog.create({
                userId: new mongoose.Types.ObjectId(userId),
                projectId: project._id,
                entityType: "Project",
                entityId: project._id,
                action: ActivityAction.UPDATE_PROJECT,
                oldValue,
                newValue: {
                    title: project.title,
                    description: project.description ?? "",
                    isPublic: project.isPublic,
                },
            })
        } catch {
            // ignore audit log errors
        }

        return NextResponse.json({
            success: true,
            projectId: project.projectId,
            title: project.title,
            description: project.description ?? "",
            isPublic: project.isPublic,
        })
    } catch {
        return NextResponse.json(
            { message: "KhÃ´ng thá»ƒ cáº­p nháº­t dá»± Ã¡n" },
            { status: 500 }
        )
    }
}

export async function DELETE(
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

        let project = await Project.findOne({ projectId })
        if (!project && mongoose.isValidObjectId(projectId)) {
            project = await Project.findById(projectId)
        }

        if (!project) {
            return NextResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
        }

        if (!project.owner?.userId?.equals(userId)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        await Project.deleteOne({ _id: project._id })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { message: "Không thể xóa dự án" },
            { status: 500 }
        )
    }
}
