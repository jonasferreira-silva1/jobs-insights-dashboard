"""
run_pipeline.py - Executa o pipeline completo de ETL do CAGED

Este é o script principal que orquestra:
1. Extração via FTP do Ministério do Trabalho
2. Transformação e limpeza dos dados
3. Carregamento no Supabase

Uso:
    python run_pipeline.py 2026 2       # Processa fevereiro de 2026
    python run_pipeline.py              # Processa o mês anterior ao atual
"""

import sys
from datetime import datetime
from extractor import extract_caged_data
from loader import load_caged_data
from setup_db import setup_database


def run_pipeline(year: int, month: int) -> bool:
    """
    Executa o pipeline completo de ETL
    
    Args:
        year: Ano para processar
        month: Mês para processar (1-12)
    
    Returns:
        True se sucesso, False caso contrário
    """
    print("=" * 60)
    print(f"PIPELINE CAGED - {month:02d}/{year}")
    print("=" * 60)

    # 0. Setup do banco
    print("\n[0/2] SETUP DO BANCO")
    print("-" * 40)
    setup_database()

    # 1. Extração
    print("\n[1/2] EXTRAÇÃO")
    print("-" * 40)
    
    data = extract_caged_data(year, month)
    
    if not data:
        print("ERRO: Falha na extração dos dados")
        return False
    
    print(f"\nDados extraídos:")
    print(f"  - Registros TI: {data['summary']['total_records']:,}")
    print(f"  - Admissões: {data['summary']['admissions']:,}")
    print(f"  - Demissões: {data['summary']['dismissals']:,}")
    print(f"  - Saldo: {data['summary']['balance']:+,}")
    
    # 2. Carregamento
    print("\n[2/2] CARREGAMENTO")
    print("-" * 40)
    
    success = load_caged_data(data)
    
    if not success:
        print("ERRO: Falha no carregamento dos dados")
        return False
    
    print("\n" + "=" * 60)
    print("PIPELINE CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    
    return True


def run_backfill(start_year: int, start_month: int, end_year: int, end_month: int):
    """
    Processa múltiplos meses (backfill)
    
    Útil para carregar dados históricos
    """
    current_year = start_year
    current_month = start_month
    
    results = []
    
    while (current_year < end_year) or (current_year == end_year and current_month <= end_month):
        success = run_pipeline(current_year, current_month)
        results.append({
            "month": f"{current_year}-{current_month:02d}",
            "success": success
        })
        
        # Avança para o próximo mês
        current_month += 1
        if current_month > 12:
            current_month = 1
            current_year += 1
    
    # Resumo
    print("\n" + "=" * 60)
    print("RESUMO DO BACKFILL")
    print("=" * 60)
    
    success_count = sum(1 for r in results if r["success"])
    print(f"Total: {len(results)} meses")
    print(f"Sucesso: {success_count}")
    print(f"Falhas: {len(results) - success_count}")
    
    for r in results:
        status = "OK" if r["success"] else "FALHOU"
        print(f"  {r['month']}: {status}")


if __name__ == "__main__":
    # Pega argumentos da linha de comando
    if len(sys.argv) >= 3:
        year = int(sys.argv[1])
        month = int(sys.argv[2])
    else:
        # Usa o mês anterior ao atual
        now = datetime.now()
        if now.month == 1:
            year = now.year - 1
            month = 12
        else:
            year = now.year
            month = now.month - 1
    
    # Valida
    if month < 1 or month > 12:
        print("ERRO: Mês deve ser entre 1 e 12")
        sys.exit(1)
    
    # Executa
    success = run_pipeline(year, month)
    sys.exit(0 if success else 1)
