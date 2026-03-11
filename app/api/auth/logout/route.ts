import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out",
    })

    const isProd = process.env.NODE_ENV === "production"
    response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    })

    return response
}
