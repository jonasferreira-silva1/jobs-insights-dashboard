"use client"

import { useMemo, useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const BRAZIL_TOPO_JSON = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"

interface StateData {
  state: string
  balance: number
}

interface BrazilMapProps {
  data: StateData[]
}

const stateCodeMap: Record<string, string> = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
}

export function BrazilMap({ data }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [tooltipContent, setTooltipContent] = useState<{ name: string; balance: number } | null>(null)

  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((d) => {
      // Indexa pelo nome completo E pela sigla para garantir o match
      map.set(d.state, d.balance)
      const code = stateCodeMap[d.state]
      if (code) map.set(code, d.balance)
    })
    return map
  }, [data])

  const maxBalance = Math.max(...data.map((d) => Math.abs(d.balance)))

  const getColor = (stateName: string) => {
    const stateCode = stateCodeMap[stateName]
    const balance = dataMap.get(stateCode) || 0

    if (balance === 0) return "#374151"

    const intensity = Math.min(Math.abs(balance) / maxBalance, 1)

    if (balance > 0) {
      // Verde: de #166534 (fraco) a #22c55e (forte)
      const r = Math.round(22 + intensity * (34 - 22))
      const g = Math.round(197 - intensity * (197 - 101))
      const b = Math.round(94 - intensity * (94 - 52))
      return `rgb(${r},${g},${b})`
    } else {
      // Vermelho: de #7f1d1d (fraco) a #ef4444 (forte)
      const r = Math.round(127 + intensity * (239 - 127))
      const g = Math.round(29 + intensity * (68 - 29))
      const b = Math.round(29 + intensity * (68 - 29))
      return `rgb(${r},${g},${b})`
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Mapa de Saldos por Estado</h3>
        <p className="text-sm text-muted-foreground">Saldo de vagas de TI por estado</p>
      </div>
      <div className="relative p-4">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 650,
            center: [-54, -15],
          }}
          className="h-[400px] w-full"
        >
          <Geographies geography={BRAZIL_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name
                const stateCode = stateCodeMap[stateName]
                const balance = dataMap.get(stateCode) || 0
                const isHovered = hoveredState === stateName

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(stateName)}
                    stroke="hsl(var(--border))"
                    strokeWidth={isHovered ? 2 : 0.5}
                    style={{
                      default: {
                        outline: "none",
                        transition: "all 0.2s ease",
                      },
                      hover: {
                        outline: "none",
                        filter: "brightness(1.2)",
                        cursor: "pointer",
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                    onMouseEnter={() => {
                      setHoveredState(stateName)
                      setTooltipContent({ name: stateName, balance })
                    }}
                    onMouseLeave={() => {
                      setHoveredState(null)
                      setTooltipContent(null)
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltipContent && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
            <p className="font-medium text-foreground">{tooltipContent.name}</p>
            <p
              className={`text-sm font-mono ${
                tooltipContent.balance >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              Saldo: {tooltipContent.balance >= 0 ? "+" : ""}
              {tooltipContent.balance.toLocaleString("pt-BR")}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-destructive" />
            <span className="text-xs text-muted-foreground">Negativo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <span className="text-xs text-muted-foreground">Neutro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">Positivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
