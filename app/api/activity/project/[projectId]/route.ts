import mongoose from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import ActivityLog from "@/models/activityLog.model"
import Project from "@/models/project.model"
import {PopulatedUser} from "@/types/user"
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
            return NextResponse.json({ message: "Thiếu projectId" }, { status: 400 })
        }

        await connectDB()

        const project = await findProjectByParam(projectId)
        if (!project) {
            return NextResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
        }

        const isMember =
            project.owner?.userId?.toString() === userId ||
            project.members?.some((m) => m.userId?.toString() === userId)

        if (!isMember) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const logs = await ActivityLog.find({
            projectId: project._id,
            entityType: { $in: ["Project", "Invite"] },
        })
            .populate("userId", "firstName lastName email")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()

        const formatted = logs.map((log) => {
            const userDoc = log.userId as PopulatedUser | null
            const user =
                userDoc && typeof userDoc === "object" && "firstName" in userDoc
                    ? {
                          id: userDoc._id?.toString?.() ?? "",
                          name: `${userDoc.lastName ?? ""} ${userDoc.firstName ?? ""}`.trim(),
                          email: userDoc.email ?? null,
                      }
                    : null

            return {
                id: log._id.toString(),
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId?.toString() ?? null,
                createdAt:
                    log.createdAt instanceof Date
                        ? log.createdAt.toISOString()
                        : new Date(log.createdAt).toISOString(),
                oldValue: log.oldValue ?? null,
                newValue: log.newValue ?? null,
                metadata: log.metadata ?? null,
                user,
            }
        })

        return NextResponse.json({ logs: formatted })
    } catch {
        return NextResponse.json(
            { message: "Không thể lấy log audit" },
            { status: 500 }
        )
    }
}
