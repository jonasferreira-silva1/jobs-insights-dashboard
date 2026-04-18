# BrJobsInsights

**Onde estão crescendo as vagas de TI no Brasil?**

> Pipeline de dados + dashboard que responde essa pergunta todo mês, usando os microdados públicos do **CAGED** (Cadastro Geral de Empregados e Desempregados).

---

## O que é

O Brasil tem um paradoxo: existem vagas abertas em regiões onde os candidatos não estão mirando, por falta de informação. O CAGED registra tudo isso mensalmente. Este projeto automatiza a coleta, limpeza e visualização desses dados.

### Dados de Fevereiro/2026

- **+1.381 vagas em TI** (setor CNAE J)
- **R$ 4.145** salário médio em TI
- **38.149 admissões** em tecnologia
- **São Paulo** lidera em saldo (+802)
- **4.5M registros** processados

---

## Arquitetura

```
FTP do Ministério do Trabalho (ftp.mtps.gov.br)
        │
        ▼
  extractor.py          ← download .7z, descompactação, limpeza com pandas
        │
        ▼
  loader.py             ← inserção em lotes no Supabase/PostgreSQL
        │
        ▼
  Supabase (PostgreSQL) ← armazenamento na nuvem
        │
        ▼
  Next.js Dashboard     ← API Routes + visualização web
```

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Extração** | Python, ftplib, py7zr, pandas |
| **Banco** | Supabase (PostgreSQL) |
| **Dashboard** | Next.js 16, TypeScript, Tailwind CSS v4, Recharts, shadcn/ui |
| **Deploy** | Vercel |

---

## Rodar o Dashboard

```bash
pnpm install
pnpm dev
```

Acesse **http://localhost:3000**

O dashboard busca dados do **Supabase** via API Routes (`/api/caged`).

---

## Rodar o Pipeline

O pipeline Python baixa dados do FTP do Ministério do Trabalho e insere no Supabase.
As tabelas são criadas automaticamente na primeira execução caso não existam.

```bash
cd scripts/pipeline

# Instalar dependências
pip install py7zr pandas supabase requests

# Executar (processa o mês anterior ao atual)
python run_pipeline.py

# Ou especificar ano e mês
python run_pipeline.py 2026 2
```

### Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

> As chaves ficam em **Settings > API** no painel do Supabase.

---

## Estrutura do Projeto

```
brjobs-insights/
├── app/
│   ├── api/caged/route.ts     # API que busca dados do Supabase
│   ├── layout.tsx
│   └── page.tsx               # Dashboard principal
├── components/dashboard/       # Componentes do dashboard
│   ├── brazil-map.tsx
│   ├── data-table.tsx
│   ├── gender-chart.tsx
│   ├── header.tsx
│   ├── metric-card.tsx
│   ├── state-ranking.tsx
│   ├── tech-stack.tsx
│   └── timeline-chart.tsx
├── lib/
│   └── supabase/              # Clientes Supabase
├── scripts/
│   ├── 001_create_tables.sql  # Schema do banco (referência)
│   └── pipeline/
│       ├── extractor.py       # Download e limpeza do FTP
│       ├── loader.py          # Carrega no Supabase
│       ├── setup_db.py        # Cria tabelas automaticamente
│       └── run_pipeline.py    # Orquestrador
└── README.md
```

---

## Tabelas do Banco

- `monthly_summary` - Métricas agregadas por mês
- `state_data` - Dados de admissões/demissões por estado
- `timeline_data` - Série histórica mensal
- `gender_data` - Distribuição por gênero
- `job_records` - Registros detalhados (amostra)

---

## Autor

**Jonas Ferreira Silva** — [@jonasferreira-silva1](https://github.com/jonasferreira-silva1)

## Licença

MIT
