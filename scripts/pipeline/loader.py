"""
loader.py - Carrega dados processados do CAGED no Supabase/PostgreSQL

Este script:
1. Recebe dados processados do extractor.py
2. Conecta ao Supabase via API
3. Insere/atualiza os dados nas tabelas
"""

import os
from datetime import datetime
from supabase import create_client, Client

# Configuração do Supabase
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Usa service role para bypass RLS


class CAGEDLoader:
    """Carrega dados do CAGED no Supabase"""
    
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias")
        
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"Conectado ao Supabase: {SUPABASE_URL}")
    
    def load_summary(self, summary: dict) -> bool:
        """Carrega resumo mensal — mapeia campos do extractor para o schema do banco"""
        try:
            month_str = summary["month"]
            month_label = self._month_label(month_str)
            row = {
                "month": month_str,
                "month_label": month_label,
                "total_admissions": summary.get("total_admissions", summary.get("admissions", 0)),
                "total_dismissals": summary.get("total_dismissals", summary.get("dismissals", 0)),
                "net_balance": summary.get("net_balance", summary.get("balance", 0)),
                "avg_salary": summary.get("avg_salary", 0),
                "total_records": summary.get("total_records", 0),
                "processed_at": summary.get("processed_at"),
            }
            self.supabase.table("monthly_summary").upsert(row, on_conflict="month").execute()
            print(f"Resumo do mês {month_str} salvo com sucesso")
            return True
        except Exception as e:
            print(f"Erro ao salvar resumo: {e}")
            return False

    def _month_label(self, month_str: str) -> str:
        """Converte '2026-02' em 'Fevereiro/2026'"""
        months_pt = {
            "01": "Janeiro", "02": "Fevereiro", "03": "Março",
            "04": "Abril", "05": "Maio", "06": "Junho",
            "07": "Julho", "08": "Agosto", "09": "Setembro",
            "10": "Outubro", "11": "Novembro", "12": "Dezembro",
        }
        try:
            year, month = month_str.split("-")
            return f"{months_pt[month]}/{year}"
        except Exception:
            return month_str

    def load_state_data(self, state_data: list) -> bool:
        """Carrega dados por estado — mapeia campos do extractor para o schema do banco"""
        if not state_data:
            return True
        try:
            month = state_data[0]["month"]
            self.supabase.table("state_data").delete().eq("month", month).execute()

            rows = []
            for s in state_data:
                rows.append({
                    "month": s["month"],
                    "state_code": s["state_code"],
                    "state_name": s["state_name"],
                    "admissions": s.get("admissions", 0),
                    "dismissals": s.get("dismissals", 0),
                    "net_balance": s.get("net_balance", s.get("balance", 0)),
                    "avg_salary": s.get("avg_salary", 0),
                })

            self.supabase.table("state_data").insert(rows).execute()
            print(f"Dados de {len(rows)} estados salvos")
            return True
        except Exception as e:
            print(f"Erro ao salvar dados de estados: {e}")
            return False
    
    def load_gender_data(self, gender_data: list) -> bool:
        """Carrega dados de gênero"""
        if not gender_data:
            return True
            
        try:
            month = gender_data[0]["month"]
            
            # Remove dados antigos do mês
            self.supabase.table("gender_data").delete().eq("month", month).execute()
            
            # Insere novos dados
            result = self.supabase.table("gender_data").insert(gender_data).execute()
            
            print(f"Dados de gênero salvos")
            return True
        except Exception as e:
            print(f"Erro ao salvar dados de gênero: {e}")
            return False
    
    def load_timeline_data(self, month: str, admissions: int, dismissals: int) -> bool:
        """Adiciona ponto na timeline"""
        try:
            months_short = {
                "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
                "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
                "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
            }
            year, m = month.split("-")
            month_label = f"{months_short[m]}/{year[2:]}"

            data = {
                "month": month,
                "month_label": month_label,
                "admissions": admissions,
                "dismissals": dismissals,
                "net_balance": admissions - dismissals,
            }
            self.supabase.table("timeline_data").upsert(data, on_conflict="month").execute()
            print(f"Timeline atualizada para {month}")
            return True
        except Exception as e:
            print(f"Erro ao atualizar timeline: {e}")
            return False
    
    def load_all(self, data: dict) -> bool:
        """Carrega todos os dados de uma extração"""
        success = True
        
        # Summary
        if "summary" in data:
            success = self.load_summary(data["summary"]) and success
            
            # Adiciona à timeline
            self.load_timeline_data(
                data["summary"]["month"],
                data["summary"]["admissions"],
                data["summary"]["dismissals"]
            )
        
        # State data
        if "state_data" in data:
            success = self.load_state_data(data["state_data"]) and success
        
        # Gender data
        if "gender_data" in data:
            success = self.load_gender_data(data["gender_data"]) and success
        
        return success


def load_caged_data(data: dict) -> bool:
    """
    Função principal para carregar dados no Supabase
    
    Args:
        data: Dicionário com dados do extractor.py
    
    Returns:
        True se sucesso, False caso contrário
    """
    loader = CAGEDLoader()
    return loader.load_all(data)


if __name__ == "__main__":
    # Teste com dados de exemplo
    test_data = {
        "summary": {
            "month": "2026-02",
            "total_records": 4500000,
            "admissions": 38149,
            "dismissals": 36768,
            "balance": 1381,
            "avg_salary": 4145.00,
            "processed_at": datetime.now().isoformat()
        },
        "state_data": [
            {
                "month": "2026-02",
                "state_code": "SP",
                "state_name": "São Paulo",
                "admissions": 15000,
                "dismissals": 14200,
                "balance": 800,
                "avg_salary": 5200.00
            },
            {
                "month": "2026-02",
                "state_code": "RJ",
                "state_name": "Rio de Janeiro",
                "admissions": 5500,
                "dismissals": 5100,
                "balance": 400,
                "avg_salary": 4800.00
            }
        ],
        "gender_data": [
            {"month": "2026-02", "gender": "Masculino", "count": 28500, "percentage": 74.7},
            {"month": "2026-02", "gender": "Feminino", "count": 9649, "percentage": 25.3}
        ]
    }
    
    success = load_caged_data(test_data)
    print(f"\nCarregamento: {'Sucesso' if success else 'Falhou'}")
