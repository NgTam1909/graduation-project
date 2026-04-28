import { cookies } from "next/headers"
import { jwtVerify } from "jose"

import { connectDB } from "@/lib/db"
import User from "@/models/user.model"
import {MyTasks} from "@/components/tasks/my-task";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getCurrentUsername() {
    const token = (await cookies()).get("accessToken")?.value

    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, SECRET)
        const userId =
            (payload as { id?: string; userId?: string }).id ??
            (payload as { id?: string; userId?: string }).userId

        if (!userId) return null

        await connectDB()

        const user = await User.findById(userId).select(
            "firstName lastName email"
        )

        if (!user) return null

        const fullName = [user.lastName, user.firstName]
            .filter(Boolean)
            .join(" ")
            .trim()

        return fullName || user.email
    } catch {
        return null
    }
}

export default async function DashboardPage() {
    const now = new Date()
    const hour = now.getHours()
    const username = (await getCurrentUsername()) ?? "bạn"
    const greeting =
        hour < 4
            ? 'Hãy chú ý sức khỏe'
            : hour < 12
                ? 'Chào buổi sáng'
                : hour < 18
                    ? 'Chào buổi chiều'
                    : hour < 23
                        ? 'Chào buổi tối'
                        : 'Hãy chú ý sức khỏe'

    const today = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    })
    const time = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (

        <div className="p-4 sm:p-6 lg:p-10 space-y-10">

            {/* Header */}
            <div className="space-y-1 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    {greeting}, {username}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {time}, {today}
                </p>
            </div>

            {/* Task Section */}
            <div>
                <h2 className="text-lg sm:text-xl font-semibold ">
                    Danh sách công việc
                </h2>
                    <MyTasks />

            </div>

        </div>

    )
}



