"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TimelineData {
  month: string
  admissions: number
  dismissals: number
  balance: number
}

interface TimelineChartProps {
  data: TimelineData[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area")

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-2 font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-medium text-foreground">
                {entry.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Evolução Temporal
          </h3>
          <p className="text-sm text-muted-foreground">
            Admissões e demissões em TI nos últimos meses
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <button
            onClick={() => setChartType("area")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              chartType === "area"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Área
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              chartType === "bar"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Barras
          </button>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="admissionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="dismissalsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="admissions"
                name="Admissões"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#admissionsGradient)"
              />
              <Area
                type="monotone"
                dataKey="dismissals"
                name="Demissões"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#dismissalsGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} barSize={32} barCategoryGap="40%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
              <Bar dataKey="admissions" name="Admissões" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="dismissals" name="Demissões" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
