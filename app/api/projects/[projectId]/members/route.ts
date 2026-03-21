import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import Project, { ProjectRole } from "@/models/project.model"
import User from "@/models/user.model"
import { updateMemberRoleSchema } from "@/lib/validations/member.validation"

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

        const isMember =
            project.owner?.userId?.toString() === userId ||
            project.members?.some((m) => m.userId?.toString() === userId)

        if (!isMember) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const currentRole =
            project.owner?.userId?.toString() === userId
                ? project.owner.role
                : project.members.find((m) => m.userId?.toString() === userId)?.role ??
                  null

        const ownerId = project.owner.userId.toString()
        const memberIds = project.members.map((m) => m.userId.toString())
        const allIds = Array.from(new Set([ownerId, ...memberIds]))

        const users = await User.find({ _id: { $in: allIds } })
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

        const members = [
            {
                ...userMap.get(ownerId),
                role: project.owner.role,
                isOwner: true,
            },
            ...project.members
                .filter((m) => m.userId.toString() !== ownerId)
                .map((m) => ({
                    ...userMap.get(m.userId.toString()),
                    role: m.role,
                    isOwner: false,
                })),
        ].filter((m) => m && m.id)

        return NextResponse.json({ members, currentRole })
    } catch {
        return NextResponse.json(
            { message: "KhÃ´ng thá»ƒ láº¥y danh sÃ¡ch thÃ nh viÃªn" },
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
            return NextResponse.json({ message: "KhÃƒÂ´ng thÃ¡Â»Â¥c projectId" }, { status: 400 })
        }

        const body = await req.json()
        const parsed = updateMemberRoleSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Dá»¯ liá»‡u khÃ´ng há»£p lá»‡", errors: parsed.error.flatten() },
                { status: 400 }
            )
        }

        await connectDB()

        let project = await Project.findOne({ projectId })
        if (!project && mongoose.isValidObjectId(projectId)) {
            project = await Project.findById(projectId)
        }

        if (!project) {
            return NextResponse.json({ message: "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y dÃ¡Â»Â± ÃƒÂ¡n" }, { status: 404 })
        }

        const currentRole =
            project.owner?.userId?.toString() === userId
                ? project.owner.role
                : project.members.find((m) => m.userId?.toString() === userId)?.role ??
                  null

        if (currentRole !== ProjectRole.ADMIN) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const { memberId, role } = parsed.data
        const ownerId = project.owner.userId.toString()
        if (memberId === ownerId) {
            return NextResponse.json(
                { message: "KhÃƒÂ´ng thá»ƒ Ä‘á»•i quyá»n owner" },
                { status: 400 }
            )
        }

        const member = project.members.find((m) => m.userId?.toString() === memberId)
        if (!member) {
            return NextResponse.json({ message: "Member not found" }, { status: 404 })
        }

        member.role = role
        await project.save()

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { message: "KhÃƒÂ´ng thá»ƒ cáº­p nháº­t quyá»n" },
            { status: 500 }
        )
    }
}
