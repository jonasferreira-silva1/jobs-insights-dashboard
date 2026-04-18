"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-4 w-4" />
    if (trend.value < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (!trend) return ""
    if (trend.value > 0) return "text-primary"
    if (trend.value < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn("mt-4 flex items-center gap-2 text-sm", getTrendColor())}>
          {getTrendIcon()}
          <span className="font-medium">
            {trend.value > 0 ? "+" : ""}
            {trend.value.toLocaleString("pt-BR")}
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}

      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
    </div>
  )
}
