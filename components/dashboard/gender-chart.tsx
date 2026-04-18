"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface GenderData {
  women: number
  men: number
}

interface GenderChartProps {
  data: GenderData
}

export function GenderChart({ data }: GenderChartProps) {
  const total = data.women + data.men
  const womenPercentage = ((data.women / total) * 100).toFixed(1)
  const menPercentage = ((data.men / total) * 100).toFixed(1)

  const chartData = [
    { name: "Mulheres", value: data.women, color: "#ec4899" },
    { name: "Homens", value: data.men, color: "#22c55e" },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString("pt-BR")} contratações
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Diversidade de Gênero</h3>
        <p className="text-sm text-muted-foreground">Admissões em TI por gênero</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ec4899" }} />
              <span className="text-sm text-foreground">Mulheres</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-semibold text-foreground">
                {data.women.toLocaleString("pt-BR")}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">({womenPercentage}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              <span className="text-sm text-foreground">Homens</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-semibold text-foreground">
                {data.men.toLocaleString("pt-BR")}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">({menPercentage}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
