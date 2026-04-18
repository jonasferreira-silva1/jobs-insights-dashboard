import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  const supabase = await createClient()

  try {
    // Busca resumo mensal
    let summaryQuery = supabase
      .from("monthly_summary")
      .select("*")
      .order("month", { ascending: false })

    if (month) {
      summaryQuery = summaryQuery.eq("month", month)
    }

    const { data: summaries, error: summaryError } = await summaryQuery.limit(1)

    if (summaryError) throw summaryError

    const currentMonth = summaries?.[0]?.month || month

    // Busca dados dos estados para o mês
    const { data: stateData, error: stateError } = await supabase
      .from("state_data")
      .select("*")
      .eq("month", currentMonth)
      .order("net_balance", { ascending: false })

    if (stateError) throw stateError

    // Busca dados de gênero
    const { data: genderData, error: genderError } = await supabase
      .from("gender_data")
      .select("*")
      .eq("month", currentMonth)

    if (genderError) throw genderError

    // Busca timeline (últimos 6 meses)
    const { data: timelineData, error: timelineError } = await supabase
      .from("timeline_data")
      .select("*")
      .order("month", { ascending: true })
      .limit(6)

    if (timelineError) throw timelineError

    // Busca lista de meses disponíveis
    const { data: availableMonths, error: monthsError } = await supabase
      .from("monthly_summary")
      .select("month")
      .order("month", { ascending: false })

    if (monthsError) throw monthsError

    return NextResponse.json({
      summary: summaries?.[0] || null,
      stateData: stateData || [],
      genderData: genderData || [],
      timelineData: timelineData || [],
      availableMonths: availableMonths?.map((m) => m.month) || [],
    })
  } catch (error) {
    console.error("Erro ao buscar dados do CAGED:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    )
  }
}
