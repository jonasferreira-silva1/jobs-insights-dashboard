"""
setup_db.py - Cria as tabelas no Supabase caso não existam

Executa o schema SQL via API REST do Supabase (endpoint /rest/v1/rpc ou SQL direto).
Chamado automaticamente pelo run_pipeline.py antes do ETL.
"""

import os
import requests

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# DDL completo do schema
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE,
  month_label VARCHAR(20) NOT NULL,
  total_admissions INTEGER NOT NULL DEFAULT 0,
  total_dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  avg_salary DECIMAL(10, 2),
  total_records INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS state_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  state_name VARCHAR(50) NOT NULL,
  admissions INTEGER NOT NULL DEFAULT 0,
  dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  avg_salary DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, state_code)
);

CREATE TABLE IF NOT EXISTS timeline_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL UNIQUE,
  month_label VARCHAR(20) NOT NULL DEFAULT '',
  admissions INTEGER NOT NULL DEFAULT 0,
  dismissals INTEGER NOT NULL DEFAULT 0,
  net_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gender_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, gender)
);

CREATE TABLE IF NOT EXISTS job_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  state_name VARCHAR(50) NOT NULL,
  municipality VARCHAR(100),
  occupation_code VARCHAR(10),
  occupation_name VARCHAR(200),
  salary DECIMAL(10, 2),
  movement_type VARCHAR(20),
  gender VARCHAR(20),
  age INTEGER,
  education_level VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_state_data_month ON state_data(month);
CREATE INDEX IF NOT EXISTS idx_state_data_state ON state_data(state_code);
CREATE INDEX IF NOT EXISTS idx_job_records_month ON job_records(month);
CREATE INDEX IF NOT EXISTS idx_job_records_state ON job_records(state_code);
CREATE INDEX IF NOT EXISTS idx_timeline_month ON timeline_data(month);

ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE gender_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_summary' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON monthly_summary FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'state_data' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON state_data FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timeline_data' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON timeline_data FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gender_data' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON gender_data FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'job_records' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON job_records FOR SELECT USING (true);
  END IF;
END $$;
"""


def setup_database() -> bool:
    """
    Cria as tabelas no Supabase via endpoint SQL.
    Usa IF NOT EXISTS, então é seguro rodar múltiplas vezes.

    Returns:
        True se sucesso, False caso contrário
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERRO: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias")
        return False

    print("Verificando/criando tabelas no banco de dados...")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

    # O Supabase expõe um endpoint SQL via extensão pg_net ou via REST direto
    # Usamos o endpoint /rest/v1/rpc com a função exec_sql, ou o endpoint direto do PostgREST
    # O caminho correto para SQL raw no Supabase é via Management API
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"

    # Tenta via função RPC exec_sql (precisa existir no banco)
    response = requests.post(url, headers=headers, json={"sql": SCHEMA_SQL})

    if response.status_code == 200:
        print("Tabelas criadas/verificadas com sucesso via RPC!")
        return True

    # Fallback: tenta via endpoint SQL direto (Supabase Management API)
    project_ref = _extract_project_ref(SUPABASE_URL)
    if project_ref:
        return _setup_via_management_api(project_ref, headers)

    print(f"AVISO: Não foi possível criar tabelas automaticamente (status {response.status_code}).")
    print("Execute manualmente o arquivo scripts/001_create_tables.sql no SQL Editor do Supabase.")
    return False


def _extract_project_ref(url: str) -> str | None:
    """Extrai o project ref da URL do Supabase (ex: https://xyzabc.supabase.co -> xyzabc)"""
    try:
        host = url.replace("https://", "").split(".")[0]
        return host if host else None
    except Exception:
        return None


def _setup_via_management_api(project_ref: str, headers: dict) -> bool:
    """Tenta criar tabelas via Supabase Management API"""
    url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    response = requests.post(url, headers=headers, json={"query": SCHEMA_SQL})

    if response.status_code in (200, 201):
        print("Tabelas criadas/verificadas com sucesso via Management API!")
        return True

    print(f"AVISO: Management API retornou {response.status_code}.")
    print("Execute manualmente o arquivo scripts/001_create_tables.sql no SQL Editor do Supabase.")
    return False


if __name__ == "__main__":
    setup_database()
