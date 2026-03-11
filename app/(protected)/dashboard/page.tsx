'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const [greeting, setGreeting] = useState('')
    const [today, setToday] = useState('')
    const [time, setTime] = useState('')


    useEffect(() => {

        const now = new Date()
        const hour = now.getHours()
        const minute = now.getMinutes()

        const greet =
           hour < 4
               ? 'Bạn không ngủ sao?'
               :hour < 12
                   ? 'Chào buổi sáng'
                   : hour < 18
                       ? 'Chào buổi chiều'
                       : hour < 23
                           ?'Chào buổi tối'
                           :'Muộn rồi hãy nghỉ ngơi đi!'

        setGreeting(greet)

        setToday(
            now.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            })
        )
        setTime(
            now.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            })
        )


    }, [])

    const tasks = [
        {
            id: 'TSK-001',
            name: 'Thiết kế giao diện',
            updatedAt: '10:45',
            status: 'Doing',
            assignee: 'Tâm',
        },
        {
            id: 'TSK-002',
            name: 'Xây dựng API',
            updatedAt: '09:20',
            status: 'Todo',
            assignee: 'An',
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Doing':
                return 'bg-blue-100 text-blue-600'
            case 'Todo':
                return 'bg-yellow-100 text-yellow-600'
            case 'Done':
                return 'bg-green-100 text-green-600'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    return (

        <div className="p-4 sm:p-6 lg:p-10 space-y-10">

            {/* Header */}
            <div className="space-y-1 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    {greeting}, Tâm 👋
                </h1>

                <p className="text-sm text-muted-foreground">
                    {time}, {today}
                </p>
            </div>

            {/* Task Section */}
            <div>

                <h2 className="text-lg sm:text-xl font-semibold mb-6">
                    Danh sách công việc của bạn
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    {tasks.map((task) => (

                        <div
                            key={task.id}
                            className="bg-background border rounded-xl p-5 space-y-4 hover:shadow-md transition"
                        >

                            {/* Top */}
                            <div className="flex justify-between items-start">

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {task.id}
                                    </p>

                                    <h3 className="font-semibold text-base">
                                        {task.name}
                                    </h3>
                                </div>

                                <span
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(
                                        task.status
                                    )}`}
                                >
                                    {task.status}
                                </span>

                            </div>

                            {/* Info */}
                            <div className="text-xs text-muted-foreground">
                                Cập nhật: {task.updatedAt}
                            </div>

                            <div className="text-sm">
                                👤 {task.assignee}
                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    )
}