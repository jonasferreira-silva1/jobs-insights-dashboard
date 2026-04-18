"use client"

import { Database, Github, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HeaderProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  months: string[]
  lastUpdate: string
}

export function Header({ selectedMonth, onMonthChange, months, lastUpdate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">BrJobsInsights</h1>
            <p className="text-xs text-muted-foreground">Dados do CAGED</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <RefreshCw className="h-4 w-4" />
            <span>Atualizado: {lastUpdate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[160px] border-border bg-secondary">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="border-border"
            asChild
          >
            <a
              href="https://github.com/jonasferreira-silva1/data-pipeline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub Repository</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
