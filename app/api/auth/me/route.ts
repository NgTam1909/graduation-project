import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { connectDB } from "@/lib/db"
import User from "@/models/user.model"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("accessToken")?.value

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { payload } = await jwtVerify(token, SECRET)

        await connectDB()

        const user = await User.findById(payload.userId).select(
            "firstName lastName email isGod"
        )

        return NextResponse.json(user)
    } catch {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
}