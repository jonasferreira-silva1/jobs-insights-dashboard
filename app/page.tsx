"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  BarChart3,
  Database,
  Loader2,
} from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StateRanking } from "@/components/dashboard/state-ranking"
import { BrazilMap } from "@/components/dashboard/brazil-map"
import { TimelineChart } from "@/components/dashboard/timeline-chart"
import { TechStack } from "@/components/dashboard/tech-stack"
import { GenderChart } from "@/components/dashboard/gender-chart"
import { DataTable } from "@/components/dashboard/data-table"

// Tipos
interface MonthlySummary {
  month: string
  month_label: string
  total_admissions: number
  total_dismissals: number
  net_balance: number
  avg_salary: number
  total_records: number
  processed_at: string
}

interface StateData {
  state_code: string
  state_name: string
  admissions: number
  dismissals: number
  net_balance: number
  avg_salary: number
}

interface TimelineData {
  month: string
  month_label: string
  admissions: number
  dismissals: number
  net_balance: number
}

interface GenderData {
  gender: string
  count: number
  percentage: number
}

interface CAGEDData {
  summary: MonthlySummary | null
  stateData: StateData[]
  genderData: GenderData[]
  timelineData: TimelineData[]
  availableMonths: string[]
}

// Fetcher para SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Mapeamento para o formato esperado pelos componentes
function mapStateData(data: StateData[]) {
  return data.map((s) => ({
    state: s.state_name,
    code: s.state_code,
    admissions: s.admissions,
    dismissals: s.dismissals,
    balance: s.net_balance,
    avgSalary: Number(s.avg_salary),
  }))
}

function mapTimelineData(data: TimelineData[]) {
  return data.map((t) => ({
    month: t.month_label,
    admissions: t.admissions,
    dismissals: t.dismissals,
    balance: t.net_balance,
  }))
}

// Mapeamento de mês para label
const monthLabels: Record<string, string> = {
  "2026-02": "Fevereiro/2026",
  "2026-01": "Janeiro/2026",
  "2025-12": "Dezembro/2025",
  "2025-11": "Novembro/2025",
  "2025-10": "Outubro/2025",
  "2025-09": "Setembro/2025",
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-02")

  // Busca dados do Supabase
  const { data, error, isLoading } = useSWR<CAGEDData>(
    `/api/caged?month=${selectedMonth}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache por 1 minuto
    }
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados do CAGED...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data?.summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-lg font-semibold text-destructive">
            Erro ao carregar dados
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível conectar ao banco de dados. Verifique se a pipeline foi executada.
          </p>
        </div>
      </div>
    )
  }

  const { summary, stateData, genderData, timelineData, availableMonths } = data
  const states = mapStateData(stateData)
  const timeline = mapTimelineData(timelineData)

  // Lista de meses para o dropdown
  // Lista de meses para o dropdown — usa month_label do banco se disponível
  const months = availableMonths.map((m) => monthLabels[m] || m)

  // Encontra o estado líder e o pior estado
  const topState = states.length > 0
    ? states.reduce((prev, current) => (prev.balance > current.balance) ? prev : current)
    : null
  const worstState = states.length > 0
    ? states.reduce((prev, current) => (prev.balance < current.balance) ? prev : current)
    : null
  const topSalaryState = states.length > 0
    ? states.reduce((prev, current) => (prev.avgSalary > current.avgSalary) ? prev : current)
    : null

  // Formata o mês para exibição curta dinamicamente
  const shortMonthFormatted = summary.month_label
    ? summary.month_label.replace("/20", "/").toLowerCase().replace("fevereiro", "fev").replace("janeiro", "jan").replace("dezembro", "dez").replace("novembro", "nov").replace("outubro", "out").replace("setembro", "set").replace("agosto", "ago").replace("julho", "jul").replace("junho", "jun").replace("maio", "mai").replace("abril", "abr").replace("março", "mar")
    : selectedMonth

  // Calcula dados de gênero
  const menData = genderData.find((g) => g.gender === "Masculino")
  const womenData = genderData.find((g) => g.gender === "Feminino")

  // Handler para mudança de mês — busca a key pelo label ou usa direto
  const handleMonthChange = (monthLabel: string) => {
    const byLabel = Object.entries(monthLabels).find(([, label]) => label === monthLabel)?.[0]
    if (byLabel) { setSelectedMonth(byLabel); return }
    const byAvailable = availableMonths.find((m) => m === monthLabel)
    if (byAvailable) setSelectedMonth(byAvailable)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedMonth={monthLabels[selectedMonth] || selectedMonth}
        onMonthChange={handleMonthChange}
        months={months}
        lastUpdate={new Date(summary.processed_at).toLocaleDateString("pt-BR")}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
                  Onde estão crescendo as vagas de TI no Brasil?
                </h2>
                <p className="max-w-2xl text-muted-foreground text-pretty">
                  Pipeline de dados que responde a essa pergunta todo mês, usando os
                  microdados públicos do CAGED — o registro oficial de todo vínculo
                  formal de trabalho aberto ou fechado no país.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <Database className="h-5 w-5 text-primary" />
                <span className="font-mono text-sm font-medium text-primary">
                  {(summary.total_records / 1000000).toFixed(1)}M registros processados
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Saldo de Vagas TI"
              value={summary.net_balance.toLocaleString("pt-BR")}
              subtitle="Setor CNAE J"
              trend={{
                value: summary.net_balance,
                label: `em ${shortMonthFormatted}`,
              }}
              icon={<Briefcase className="h-5 w-5" />}
            />
            <MetricCard
              title="Admissões em TI"
              value={summary.total_admissions.toLocaleString("pt-BR")}
              subtitle="Contratações no mês"
              trend={{
                value: summary.total_admissions - summary.total_dismissals,
                label: "líquido",
              }}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <MetricCard
              title="Salário Médio TI"
              value={`R$ ${Number(summary.avg_salary).toLocaleString("pt-BR")}`}
              subtitle="Média do setor"
              icon={<DollarSign className="h-5 w-5" />}
            />
            <MetricCard
              title="Total de Estados"
              value={states.length.toString()}
              subtitle="Com dados de TI"
              trend={{
                value: states.filter((s) => s.balance > 0).length,
                label: "com saldo positivo",
              }}
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Highlight Cards */}
        {topState && worstState && topSalaryState && (
          <section className="mb-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">Estado líder em saldo TI</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{topState.state}</span>
                  <span className="font-mono text-sm text-primary">+{topState.balance}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {states[1] && states[2] && (
                    <>À frente de {states[1].state} (+{states[1].balance}) e {states[2].state} (+{states[2].balance})</>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-4">
                <p className="text-sm text-muted-foreground">Maior salário médio TI</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-chart-3">
                    R$ {topSalaryState.avgSalary.toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topSalaryState.state} lidera em remuneração
                </p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">
                  {worstState.balance < 0 ? "Fechou negativo" : "Menor saldo"}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-destructive">
                    {worstState.state}: {worstState.balance}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {worstState.balance < 0
                    ? "Mais demissões que contratações em TI"
                    : "Menor crescimento no período"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Charts Grid */}
        <section className="mb-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <BrazilMap data={states} />
            <StateRanking
              data={states}
              title="Ranking de Saldo por Estado"
              sortBy="balance"
            />
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-8">
          <TimelineChart data={timeline} />
        </section>

        {/* Bottom Grid */}
        <section className="mb-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <StateRanking
              data={states}
              title="Ranking de Salário Médio"
              sortBy="avgSalary"
            />
            <GenderChart
              data={{
                women: womenData?.count || 0,
                men: menData?.count || 0,
              }}
            />
            <TechStack />
          </div>
        </section>

        {/* Data Table */}
        <section className="mb-8">
          <DataTable data={states} />
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">BrJobsInsights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dados do CAGED via FTP do Ministério do Trabalho
            </p>
            <p className="text-sm text-muted-foreground">
              Criado por{" "}
              <a
                href="https://github.com/jonasferreira-silva1"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Jonas Ferreira Silva
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
