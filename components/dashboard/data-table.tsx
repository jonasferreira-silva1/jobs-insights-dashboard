"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface StateData {
  state: string
  balance: number
  admissions: number
  dismissals: number
  avgSalary: number
}

interface DataTableProps {
  data: StateData[]
}

type SortKey = keyof StateData
type SortDirection = "asc" | "desc"

export function DataTable({ data }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("balance")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [search, setSearch] = useState("")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const filteredData = data.filter((item) =>
    item.state.toLowerCase().includes(search.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    const modifier = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * modifier
    }

    return ((aValue as number) - (bValue as number)) * modifier
  })

  const SortHeader = ({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyValue)}
      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown
        className={cn(
          "h-3 w-3",
          sortKey === sortKeyValue && "text-primary"
        )}
      />
    </button>
  )

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Dados Detalhados</h3>
          <p className="text-sm text-muted-foreground">Todos os estados brasileiros</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs">
                <SortHeader label="Estado" sortKeyValue="state" />
              </th>
              <th className="px-4 py-3 text-right text-xs">
                <SortHeader label="Admissões" sortKeyValue="admissions" />
              </th>
              <th className="px-4 py-3 text-right text-xs">
                <SortHeader label="Demissões" sortKeyValue="dismissals" />
              </th>
              <th className="px-4 py-3 text-right text-xs">
                <SortHeader label="Saldo" sortKeyValue="balance" />
              </th>
              <th className="px-4 py-3 text-right text-xs">
                <SortHeader label="Salário Médio" sortKeyValue="avgSalary" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={item.state}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50",
                  index === sortedData.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {item.state}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                  {item.admissions.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                  {item.dismissals.toLocaleString("pt-BR")}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono text-sm font-semibold",
                    item.balance >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {item.balance >= 0 ? "+" : ""}
                  {item.balance.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                  R$ {item.avgSalary.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
