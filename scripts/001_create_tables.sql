-- BrJobsInsights - Schema do Banco de Dados
-- Tabelas para armazenar dados do CAGED processados

-- Tabela de resumo mensal (métricas agregadas)
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE, -- Formato: 2026-02
  month_label VARCHAR(20) NOT NULL, -- Formato: Fevereiro/2026
  total_admissions INTEGER NOT NULL DEFAULT 0,
  total_dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  avg_salary DECIMAL(10, 2),
  total_records INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dados por estado
CREATE TABLE IF NOT EXISTS state_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL, -- Formato: 2026-02
  state_code VARCHAR(2) NOT NULL, -- UF: SP, RJ, etc.
  state_name VARCHAR(50) NOT NULL,
  admissions INTEGER NOT NULL DEFAULT 0,
  dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  avg_salary DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, state_code)
);

-- Tabela de evolução temporal (série histórica)
CREATE TABLE IF NOT EXISTS timeline_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE, -- Formato: 2026-02
  month_label VARCHAR(20) NOT NULL, -- Formato: Fev/26
  admissions INTEGER NOT NULL DEFAULT 0,
  dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dados por gênero
CREATE TABLE IF NOT EXISTS gender_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL,
  gender VARCHAR(20) NOT NULL, -- Masculino, Feminino
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, gender)
);

-- Tabela de registros detalhados (amostra para a tabela de dados)
CREATE TABLE IF NOT EXISTS job_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  state_name VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),
  occupation_code VARCHAR(10),
  occupation_name VARCHAR(200),
  salary DECIMAL(10, 2),
  movement_type VARCHAR(20), -- Admissão, Demissão
  gender VARCHAR(20),
  age INTEGER,
  education_level VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_state_data_month ON state_data(month);
CREATE INDEX IF NOT EXISTS idx_state_data_state ON state_data(state_code);
CREATE INDEX IF NOT EXISTS idx_job_records_month ON job_records(month);
CREATE INDEX IF NOT EXISTS idx_job_records_state ON job_records(state_code);
CREATE INDEX IF NOT EXISTS idx_timeline_month ON timeline_data(month);

-- Desabilitar RLS para estas tabelas (dados públicos do CAGED)
ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE gender_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_records ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (dados são públicos)
CREATE POLICY "Allow public read access" ON monthly_summary FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON state_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON timeline_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gender_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON job_records FOR SELECT USING (true);
