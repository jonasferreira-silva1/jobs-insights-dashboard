"use client"

import { Database, FileCode2, Server, BarChart3, Cloud } from "lucide-react"

const techStack = [
  {
    layer: "Extração",
    tech: "ftplib + py7zr",
    description: "Download via FTP do Ministério do Trabalho, descompactação .7z",
    icon: FileCode2,
  },
  {
    layer: "Transformação",
    tech: "pandas",
    description: "Filtragem por CNAE, agregação por estado e gênero",
    icon: Server,
  },
  {
    layer: "Armazenamento",
    tech: "Supabase (PostgreSQL)",
    description: "Upsert mensal, RLS com leitura pública, índices por mês e estado",
    icon: Database,
  },
  {
    layer: "Dashboard",
    tech: "Next.js + Recharts",
    description: "API Routes, SWR, react-simple-maps, shadcn/ui",
    icon: BarChart3,
  },
  {
    layer: "Deploy",
    tech: "Vercel",
    description: "CI/CD automático a cada push",
    icon: Cloud,
  },
]

export function TechStack() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Stack Tecnológica</h3>
        <p className="text-sm text-muted-foreground">Arquitetura do pipeline de dados</p>
      </div>
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {techStack.map((item, index) => (
            <div
              key={item.layer}
              className="group relative flex items-start gap-4 rounded-lg border border-transparent bg-muted/50 p-3 transition-all hover:border-primary/30 hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">{item.layer}</span>
                </div>
                <p className="font-medium text-foreground">{item.tech}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {index < techStack.length - 1 && (
                <div className="absolute -bottom-3 left-7 hidden h-3 w-px bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
