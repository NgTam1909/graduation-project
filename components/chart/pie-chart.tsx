'use client'

import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts"

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#94a3b8"]

export default function ClickablePie({
                                         data,
                                         onClick
                                     }: any) {
    return (
        <ResponsiveContainer height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    onClick={(e) => onClick(e.name)}
                >
                    {data.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    )
}