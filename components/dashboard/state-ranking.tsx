"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StateData {
  state: string
  balance: number
  admissions: number
  dismissals: number
  avgSalary: number
}

interface StateRankingProps {
  data: StateData[]
  title: string
  sortBy: "balance" | "avgSalary"
}

export function StateRanking({ data, title, sortBy }: StateRankingProps) {
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "balance") return b.balance - a.balance
    return b.avgSalary - a.avgSalary
  })

  const maxValue = Math.max(...data.map((d) => Math.abs(sortBy === "balance" ? d.balance : d.avgSalary)))

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {sortedData.slice(0, 10).map((item, index) => {
            const value = sortBy === "balance" ? item.balance : item.avgSalary
            const percentage = (Math.abs(value) / maxValue) * 100
            const isPositive = value >= 0

            return (
              <div key={item.state} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{item.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sortBy === "balance" && (
                      isPositive ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )
                    )}
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold",
                        sortBy === "balance"
                          ? isPositive
                            ? "text-primary"
                            : "text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {sortBy === "balance"
                        ? `${isPositive ? "+" : ""}${value.toLocaleString("pt-BR")}`
                        : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      sortBy === "balance"
                        ? isPositive
                          ? "bg-primary"
                          : "bg-destructive"
                        : "bg-chart-2"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
