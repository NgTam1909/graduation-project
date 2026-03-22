import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"

export default function TopUserChart({ data }: any) {
    // Format số nguyên cho YAxis
    const formatYAxis = (value: number) => {
        return Math.floor(value).toString()
    }
        return (
        <ResponsiveContainer height={300}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-white"
                    axisLine={{ stroke: 'currentColor' }}
                />
                <YAxis
                    tickFormatter={formatYAxis}
                    allowDecimals={false}
                    className="text-gray-600 dark:text-gray-300"
                    axisLine={{ stroke: 'currentColor' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgb(255 255 255 / var(--tw-bg-opacity))',
                        border: '1px solid rgb(209 213 219)',
                        color: 'rgb(75 85 99)'
                    }}
                    itemStyle={{ color: 'rgb(75 85 99)' }}
                    labelStyle={{ color: 'rgb(75 85 99)' }}
                    // Dark mode styles sẽ được thêm qua className nếu tooltip hỗ trợ
                />

                <Bar
                    dataKey="value"
                    name="Số task"
                    fill="#3B82F6"
                    className="dark:fill-[#60A5FA]"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}