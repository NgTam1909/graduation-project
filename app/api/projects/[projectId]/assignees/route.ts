import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import Project, { ProjectRole, IProjectMember } from "@/models/project.model"
import User from "@/models/user.model"

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
            return NextResponse.json({ message: "KhÃ´ng thá»¥c projectId" }, { status: 400 })
        }

        await connectDB()

        let project = await Project.findOne({ projectId })
        if (!project && mongoose.isValidObjectId(projectId)) {
            project = await Project.findById(projectId)
        }

        if (!project) {
            return NextResponse.json({ message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n" }, { status: 404 })
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

        const users = await User.find({ _id: { $in: assignableIds } })
            .select("firstName lastName email")
            .lean()

        const userMap = new Map(
            users.map((u) => [
                u._id.toString(),
                {
                    id: u._id.toString(),
                    name: `${u.firstName} ${u.lastName}`.trim(),
                    email: u.email,
                },
            ])
        )

        const assignees = assignableIds
            .map((id) => userMap.get(id))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))

        return NextResponse.json({
            currentUserId: userId,
            currentUserRole: currentRole,
            assignees,
        })
    } catch {
        return NextResponse.json(
            { message: "KhÃ´ng thá»ƒ láº¥y danh sÃ¡ch ngÆ°á»i" },
            { status: 500 }
        )
    }
}
