
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts"
const COLOR_MAP = {
    backlog: "#fbbf24",      // Vàng nhạt
    todo: "#60a5fa",         // Xanh dương nhạt
    inprogress: "#a78bfa",   // Tím nhạt
    done: "#34d399",         // Xanh lục nhạt
    cancelled: "#cbd5e1",    // Xám lạnh
}

type PieItem = {
    name: string
    value: number
}

export default function ClickablePie({
                                         data,
                                         onClick
                                     }: {
    data: PieItem[]
    onClick?: (name: string) => void
}) {
    return (
        <ResponsiveContainer height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    onClick={(e: any) => {
                        const name = e?.name
                        if (typeof name === "string") onClick?.(name)
                    }}
                >
                    {data.map((item, i) => (
                        <Cell
                            key={i}
                            fill={COLOR_MAP[item.name as keyof typeof COLOR_MAP]}
                        />
                    ))}
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    )
}
