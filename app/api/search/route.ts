import mongoose from "mongoose"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

import { connectDB } from "@/lib/db"
import User from "@/models/user.model"
import Project from "@/models/project.model"
import Task from "@/models/task.model"
import {SearchProject, SearchTask, SearchUser} from "@/types/search";

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

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function toShortTaskCode(id: string) {
    const suffix = id.slice(-6).toUpperCase()
    return `TSK-${suffix}`
}

function includesQuery(value: unknown, q: string) {
    if (!q) return false
    if (typeof value !== "string") return false
    return value.toLocaleLowerCase("vi-VN").includes(q.toLocaleLowerCase("vi-VN"))
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
        const limitRaw = req.nextUrl.searchParams.get("limit")?.trim()
        const limit = Math.max(
            1,
            Math.min(20, limitRaw ? Number.parseInt(limitRaw, 10) || 10 : 10)
        )

        if (!q) {
            return NextResponse.json({
                q,
                users: [] as SearchUser[],
                projects: [] as SearchProject[],
                tasks: [] as SearchTask[],
            })
        }

        const safe = escapeRegex(q)
        const userObjectId = new mongoose.Types.ObjectId(userId)
        const qLower = q.toLocaleLowerCase("vi-VN")

        await connectDB()

        // Only public projects are searchable (explicit requirement).
        const projects = (await Project.find({
            isPublic: true,
            $or: [
                { title: { $regex: safe, $options: "i" } },
                { projectId: { $regex: safe, $options: "i" } },
            ],
        })
            .select("_id title projectId isPublic")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()) as unknown as Array<Record<string, unknown>>

        const [users, tasksAgg] = await Promise.all([
            User.find({
                $or: [
                    { firstName: { $regex: safe, $options: "i" } },
                    { lastName: { $regex: safe, $options: "i" } },
                    { email: { $regex: safe, $options: "i" } },
                    { phone: { $regex: safe, $options: "i" } },
                ],
            })
                .select("_id firstName lastName email")
                .limit(limit)
                .lean(),

            // Tasks are searchable only if they belong to public projects.
            Task.aggregate([
                {
                    $match: {
                        $or: [
                            { title: { $regex: safe, $options: "i" } },
                            { code: { $regex: safe, $options: "i" } },
                            { status: { $regex: safe, $options: "i" } },
                        ]
                    },
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "projectId",
                        foreignField: "_id",
                        as: "project",
                    },
                },
                { $unwind: "$project" },
                // Private projects are hidden from non-members, but still searchable for members/owner.
                {
                    $match: {
                        $or: [
                            { "project.isPublic": true },
                            { "project.owner.userId": userObjectId },
                            { "project.members.userId": userObjectId },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        projectSlug: "$project.projectId",
                        projectTitle: "$project.title",
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: limit },
            ]),
        ])

        const usersOut: SearchUser[] = (users as unknown as Array<Record<string, unknown>>).map((u) => {
            const id = String(u._id ?? "")
            const firstName = typeof u.firstName === "string" ? u.firstName : ""
            const lastName = typeof u.lastName === "string" ? u.lastName : ""
            const email = typeof u.email === "string" ? u.email : ""
            const name = `${firstName} ${lastName}`.trim() || email
            return { id, name, email }
        })

        const projectsOut: SearchProject[] = projects.map((p) => ({
            id: String(p._id ?? ""),
            projectId: typeof p.projectId === "string" ? p.projectId : "",
            title: typeof p.title === "string" ? p.title : "",
            isPublic: Boolean(p.isPublic),
        }))

        const tasksOut: SearchTask[] = (tasksAgg as Array<Record<string, unknown>>)
            .map((t) => {
                const id = String(t._id ?? "")
                const title = typeof t.title === "string" ? t.title : ""
                const projectId = typeof t.projectSlug === "string" ? t.projectSlug : ""
                const projectTitle =
                    typeof t.projectTitle === "string" ? t.projectTitle : ""
                if (!id || !projectId) return null
                // Extra guard: ensure the returned task really matches the query.
                if (!includesQuery(title, qLower)) {
                    return null
                }
                return {
                    id,
                    code: toShortTaskCode(id),
                    title,
                    projectId,
                    projectTitle,
                }
            })
            .filter((t): t is NonNullable<typeof t> => t !== null)

        return NextResponse.json({
            q,
            users: usersOut,
            projects: projectsOut,
            tasks: tasksOut,
        })
    } catch {
        return NextResponse.json({ message: "Search failed" }, { status: 500 })
    }
}
