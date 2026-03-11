import {signToken} from "@/lib/jwt";
import {NextResponse} from "next/server";
import {connectDB} from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
    await connectDB()
    const { email, password } = await req.json()

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken({
        id: user._id.toString(),
        email: user.email,
        isGod: user.isGod,
    })

    const response = NextResponse.json({ success: true })

    const isProd = process.env.NODE_ENV === "production"
    response.cookies.set("accessToken", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
    })

    return response
}
