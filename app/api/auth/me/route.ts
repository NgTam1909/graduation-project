import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/user.model"
import { updateProfileSchema } from "@/lib/validations/auth.validation"
import {getUserIdFromRequest} from "@/lib/jwt";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        await connectDB()

        const user = await User.findById(userId).select(
            "firstName lastName phone email isGod position skills"
        )

        return NextResponse.json(user)
    } catch {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        const parsed = updateProfileSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Lỗi xác thực", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const update: Record<string, unknown> = {}
        const unset: Record<string, unknown> = {}

        const hasFirstName = Object.prototype.hasOwnProperty.call(body ?? {}, "firstName")
        const hasLastName = Object.prototype.hasOwnProperty.call(body ?? {}, "lastName")
        const hasPhone = Object.prototype.hasOwnProperty.call(body ?? {}, "phone")
        const hasPosition = Object.prototype.hasOwnProperty.call(body ?? {}, "position")
        const hasSkills = Object.prototype.hasOwnProperty.call(body ?? {}, "skills")

        if (hasFirstName && typeof parsed.data.firstName === "string") {
            update.firstName = parsed.data.firstName.trim()
        }

        if (hasLastName && typeof parsed.data.lastName === "string") {
            update.lastName = parsed.data.lastName.trim()
        }

        if (hasPhone && typeof parsed.data.phone === "string") {
            update.phone = parsed.data.phone.trim()
        }

        if (hasPosition) {
            if (typeof parsed.data.position === "string" && parsed.data.position.trim().length > 0) {
                update.position = parsed.data.position.trim()
            } else {
                unset.position = ""
            }
        }

        if (hasSkills) {
            if (Array.isArray(parsed.data.skills)) {
                update.skills = parsed.data.skills
            } else {
                // Xóa skill khỏi giao diện người dùng dưới dạng chuỗi rỗng -> không xác định sau khi xử lý trước.
                update.skills = []
            }
        }

        await connectDB()

        const nextUser = await User.findByIdAndUpdate(
            userId,
            Object.keys(unset).length > 0 ? { $set: update, $unset: unset } : { $set: update },
            { new: true }
        ).select("firstName lastName phone email isGod position skills")

        return NextResponse.json({ success: true, user: nextUser })
    } catch {
        return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
    }
}
