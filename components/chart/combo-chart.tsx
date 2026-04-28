import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts"

type Item = {
    month: string
    created: number
    completed: number
    overdue: number
    carryOver?: number
}

type Props = {
    data: Item[]
    onSelectMonth?: (month: string) => void
}

export default function TaskMonthlyChart({
                                             data,
                                             onSelectMonth,
                                         }: Props) {
    // sort tăng dần thời gian
    const sortedData = [...data]
        .sort((a, b) => {
            const [ma, ya] = a.month.split("/").map(Number)
            const [mb, yb] = b.month.split("/").map(Number)

            const da = new Date(ya, ma - 1).getTime()
            const db = new Date(yb, mb - 1).getTime()

            return da - db
        })
        .map((item) => {
            const carryOver = item.carryOver ?? 0
            const created = item.created ?? 0
            const completed = item.completed ?? 0
            const overdue = item.overdue ?? 0

            const pending = carryOver + created

            return {
                ...item,
                carryOver,
                created,
                completed,
                overdue,
                pending,
                overdueSafe: Math.min(overdue, pending),
            }
        })

    return (
        <ResponsiveContainer width="100%" height={340}>
            <BarChart
                data={sortedData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                onClick={(state) => {
                    const month = state?.activeLabel
                    if (typeof month === "string") {
                        onSelectMonth?.(month)
                    }
                }}
            >
                <CartesianGrid
                    strokeDasharray="4 4"
                    opacity={0.1}
                    vertical={false}
                />

                <XAxis
                    dataKey="month"
                    tick={{
                        fontSize: 12,
                        fontWeight: 500,
                        fill: '#6b7280'
                    }}
                    axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                    tickLine={false}
                />

                <YAxis
                    allowDecimals={false}
                    tick={{
                        fontSize: 12,
                        fontWeight: 500,
                        fill: '#6b7280'
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                />

                <Tooltip
                    cursor={{ fill: '#f9fafb', opacity: 0.5 }}
                    contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 500
                    }}
                    formatter={(value, name) => [value ?? 0, name]}
                    labelStyle={{
                        fontWeight: 600,
                        marginBottom: "4px",
                        color: "#374151"
                    }}
                />

                <Legend
                    wrapperStyle={{
                        paddingTop: "16px",
                        fontSize: "12px"
                    }}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>
                {value}
            </span>
                    )}
                />

                <Bar
                    dataKey="overdueSafe"
                    stackId="a"
                    fill="#ef4444"
                    name="Task quá hạn"
                    barSize={36}
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(e: any) => {
                        const month = e?.payload?.month
                        if (month && onSelectMonth) onSelectMonth(month)
                    }}
                />

                <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="#10b981"
                    name="Task hoàn thành"
                    radius={[4, 4, 0, 0]}
                />

                <Bar
                    dataKey="pending"
                    stackId="a"
                    fill="#f3f4f6"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    name="Task cần làm"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}