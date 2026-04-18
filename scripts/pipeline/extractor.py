"""
extractor.py - Download e processamento de dados do CAGED via FTP do Ministério do Trabalho

Este script:
1. Conecta ao FTP público do Ministério do Trabalho
2. Baixa os arquivos .7z do CAGED (microdados)
3. Descompacta usando py7zr
4. Limpa e processa os dados com pandas
5. Filtra apenas registros de TI (CNAE seção J)
"""

import os
import ftplib
import tempfile
from datetime import datetime
from pathlib import Path
import py7zr
import pandas as pd

# Configurações do FTP do Ministério do Trabalho
FTP_HOST = "ftp.mtps.gov.br"
FTP_PATH = "/pdet/microdados/NOVO CAGED"

# Códigos CNAE para TI (Seção J - Informação e Comunicação)
CNAE_TI_CODES = [
    "62",  # Atividades dos serviços de tecnologia da informação
    "63",  # Atividades de prestação de serviços de informação
    "61",  # Telecomunicações
    "58",  # Edição e edição integrada à impressão
    "59",  # Atividades cinematográficas, produção de vídeos
    "60",  # Atividades de rádio e de televisão
]

# Mapeamento de UF para nomes dos estados
UF_NAMES = {
    11: "Rondônia", 12: "Acre", 13: "Amazonas", 14: "Roraima", 15: "Pará",
    16: "Amapá", 17: "Tocantins", 21: "Maranhão", 22: "Piauí", 23: "Ceará",
    24: "Rio Grande do Norte", 25: "Paraíba", 26: "Pernambuco", 27: "Alagoas",
    28: "Sergipe", 29: "Bahia", 31: "Minas Gerais", 32: "Espírito Santo",
    33: "Rio de Janeiro", 35: "São Paulo", 41: "Paraná", 42: "Santa Catarina",
    43: "Rio Grande do Sul", 50: "Mato Grosso do Sul", 51: "Mato Grosso",
    52: "Goiás", 53: "Distrito Federal"
}

UF_SIGLAS = {
    11: "RO", 12: "AC", 13: "AM", 14: "RR", 15: "PA", 16: "AP", 17: "TO",
    21: "MA", 22: "PI", 23: "CE", 24: "RN", 25: "PB", 26: "PE", 27: "AL",
    28: "SE", 29: "BA", 31: "MG", 32: "ES", 33: "RJ", 35: "SP", 41: "PR",
    42: "SC", 43: "RS", 50: "MS", 51: "MT", 52: "GO", 53: "DF"
}


class CAGEDExtractor:
    """Extrai e processa dados do CAGED do FTP do Ministério do Trabalho"""
    
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or tempfile.mkdtemp()
        self.ftp = None
        
    def connect_ftp(self):
        """Conecta ao servidor FTP do Ministério do Trabalho"""
        print(f"Conectando ao FTP: {FTP_HOST}")
        self.ftp = ftplib.FTP(FTP_HOST)
        self.ftp.login()  # Login anônimo
        print("Conectado com sucesso!")
        
    def disconnect_ftp(self):
        """Desconecta do servidor FTP"""
        if self.ftp:
            self.ftp.quit()
            print("Desconectado do FTP")
            
    def list_available_months(self, year: int) -> list:
        """Lista os meses disponíveis para um ano específico"""
        try:
            path = f"{FTP_PATH}/{year}"
            self.ftp.cwd(path)
            files = self.ftp.nlst()
            months = sorted(set([f[:6] for f in files if f.endswith('.7z')]))
            return months
        except ftplib.error_perm:
            print(f"Ano {year} não encontrado no FTP")
            return []
    
    def download_month(self, year: int, month: int) -> str:
        """Baixa o arquivo do CAGED para um mês específico"""
        month_str = f"{year}{month:02d}"
        filename = f"CAGEDMOV{month_str}.7z"
        local_path = os.path.join(self.output_dir, filename)

        # Tenta primeiro no subdiretório do mês (estrutura atual do FTP)
        # ex: /2026/202602/CAGEDMOV202602.7z
        paths_to_try = [
            f"{FTP_PATH}/{year}/{month_str}",
            f"{FTP_PATH}/{year}",
        ]

        for path in paths_to_try:
            try:
                self.ftp.cwd(path)
                print(f"Baixando {filename} de {path}...")
                with open(local_path, 'wb') as f:
                    self.ftp.retrbinary(f'RETR {filename}', f.write)
                print(f"Download concluído: {local_path}")
                return local_path
            except ftplib.error_perm:
                continue

        print(f"Erro: {filename} não encontrado no FTP")
        return None
    
    def extract_7z(self, filepath: str) -> str:
        """Descompacta arquivo .7z"""
        extract_dir = os.path.join(self.output_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        
        print(f"Descompactando {filepath}...")
        with py7zr.SevenZipFile(filepath, mode='r') as z:
            z.extractall(path=extract_dir)
        
        # Encontra o arquivo CSV/TXT extraído
        for f in os.listdir(extract_dir):
            if f.endswith(('.txt', '.csv')):
                return os.path.join(extract_dir, f)
        
        return extract_dir
    
    def load_and_clean(self, filepath: str) -> pd.DataFrame:
        """Carrega e limpa os dados do CAGED"""
        print(f"Carregando dados de {filepath}...")

        df = pd.read_csv(
            filepath,
            sep=';',
            encoding='latin-1',
            low_memory=False
        )

        print(f"Registros totais: {len(df):,}")

        # Normaliza nomes das colunas removendo acentos via encode/decode
        def normalize(col):
            col = col.lower().strip()
            # Remove acentos via encode latin-1 -> ascii ignorando erros
            col = col.encode('latin-1').decode('ascii', errors='ignore')
            # Remove caracteres especiais restantes
            col = ''.join(c for c in col if c.isalnum() or c == '_')
            return col

        df.columns = [normalize(c) for c in df.columns]
        print(f"Colunas: {list(df.columns)}")

        return df
    
    def filter_ti_jobs(self, df: pd.DataFrame) -> pd.DataFrame:
        """Filtra apenas vagas de TI baseado no CNAE"""
        # Tenta filtrar pela seção J (letra) — coluna 'seo' ou 'secao'
        for col in ['seo', 'secao', 'seao']:
            if col in df.columns:
                df_ti = df[df[col].astype(str).str.upper().str.strip() == 'J'].copy()
                if len(df_ti) > 0:
                    print(f"Registros de TI (seção J): {len(df_ti):,}")
                    return df_ti

        # Fallback: filtra pelos 2 primeiros dígitos do subclasse
        for col in ['subclasse', 'cnae', 'cnae20subclasse']:
            if col in df.columns:
                df['_cnae2'] = df[col].astype(str).str[:2]
                df_ti = df[df['_cnae2'].isin(CNAE_TI_CODES)].copy()
                if len(df_ti) > 0:
                    print(f"Registros de TI (CNAE): {len(df_ti):,}")
                    return df_ti

        print("AVISO: Não foi possível filtrar TI, usando todos os registros")
        return df
    
    def process_month(self, year: int, month: int) -> dict:
        """Processa um mês completo e retorna dados agregados"""
        
        # Baixa o arquivo
        filepath = self.download_month(year, month)
        if not filepath:
            return None
        
        # Descompacta
        extracted = self.extract_7z(filepath)
        
        # Carrega e limpa
        df = self.load_and_clean(extracted)
        
        # Filtra TI
        df_ti = self.filter_ti_jobs(df)
        
        # Calcula métricas
        result = self._calculate_metrics(df_ti, year, month)
        
        # Limpa arquivos temporários
        os.remove(filepath)
        
        return result
    
    def _calculate_metrics(self, df: pd.DataFrame, year: int, month: int) -> dict:
        """Calcula métricas agregadas dos dados"""
        
        month_key = f"{year}-{month:02d}"
        
        # Identifica coluna de movimento
        # CAGED: saldomovimentao = 1 (admissão), -1 (demissão)
        mov_col = None
        for col in ['saldomovimentao', 'tipomovimentao', 'saldomovimentacao', 'tipomovimentacao']:
            if col in df.columns:
                mov_col = col
                break

        # Identifica coluna de salário
        sal_col = None
        for col in ['valorsalriofixo', 'salrio', 'salario', 'valorsalariofixo']:
            if col in df.columns:
                sal_col = col
                break

        # Identifica coluna de UF
        uf_col = None
        for col in ['uf', 'codigouf', 'sigla_uf']:
            if col in df.columns:
                uf_col = col
                break

        # Identifica coluna de sexo
        sex_col = None
        for col in ['sexo', 'genero']:
            if col in df.columns:
                sex_col = col
                break

        # Calcula admissões e demissões
        # saldomovimentao: 1 = admissão, -1 = demissão
        # tipomovimentao: 1 = admissão, 2 = demissão
        if mov_col in ('saldomovimentao', 'saldomovimentacao'):
            admissions = len(df[df[mov_col] > 0])
            dismissals = len(df[df[mov_col] < 0])
        elif mov_col in ('tipomovimentao', 'tipomovimentacao'):
            admissions = len(df[df[mov_col] == 1])
            dismissals = len(df[df[mov_col] == 2])
        else:
            admissions = len(df) // 2
            dismissals = len(df) // 2

        balance = admissions - dismissals
        
        # Salário médio — trata vírgula como separador decimal (padrão BR)
        avg_salary = 0
        if sal_col and sal_col in df.columns:
            sal_series = df[sal_col].astype(str).str.replace(',', '.', regex=False)
            sal_series = pd.to_numeric(sal_series, errors='coerce')
            avg_salary = sal_series.mean()
        
        # Dados por estado
        state_data = []
        if uf_col:
            for uf_code, group in df.groupby(uf_col):
                uf_code = int(uf_code) if pd.notna(uf_code) else 0
                if uf_code in UF_NAMES:
                    if mov_col in ('saldomovimentao', 'saldomovimentacao'):
                        state_admissions = len(group[group[mov_col] > 0])
                        state_dismissals = len(group[group[mov_col] < 0])
                    elif mov_col in ('tipomovimentao', 'tipomovimentacao'):
                        state_admissions = len(group[group[mov_col] == 1])
                        state_dismissals = len(group[group[mov_col] == 2])
                    else:
                        state_admissions = len(group) // 2
                        state_dismissals = len(group) // 2
                    state_balance = state_admissions - state_dismissals
                    state_salary = 0
                    if sal_col and sal_col in group.columns:
                        s = group[sal_col].astype(str).str.replace(',', '.', regex=False)
                        state_salary = pd.to_numeric(s, errors='coerce').mean()
                    
                    state_data.append({
                        "month": month_key,
                        "state_code": UF_SIGLAS.get(uf_code, "XX"),
                        "state_name": UF_NAMES.get(uf_code, "Desconhecido"),
                        "admissions": state_admissions,
                        "dismissals": state_dismissals,
                        "balance": state_balance,
                        "avg_salary": round(state_salary, 2) if pd.notna(state_salary) else 0
                    })
        
        # Dados de gênero
        gender_data = []
        if sex_col:
            # CAGED: 1=Masculino, 3=Feminino (não 2)
            gender_map = {1: "Masculino", 3: "Feminino", 2: "Feminino"}
            for sex, group in df.groupby(sex_col):
                sex_name = gender_map.get(int(sex), "Outro")
                if sex_name == "Outro":
                    continue
                gender_data.append({
                    "month": month_key,
                    "gender": sex_name,
                    "count": len(group),
                    "percentage": round(len(group) / len(df) * 100, 1)
                })
        
        return {
            "summary": {
                "month": month_key,
                "total_records": len(df),
                "admissions": admissions,
                "dismissals": dismissals,
                "balance": balance,
                "avg_salary": round(avg_salary, 2) if pd.notna(avg_salary) else 0,
                "processed_at": datetime.now().isoformat()
            },
            "state_data": state_data,
            "gender_data": gender_data
        }


def extract_caged_data(year: int, month: int, output_dir: str = None) -> dict:
    """
    Função principal para extrair dados do CAGED
    
    Args:
        year: Ano (ex: 2026)
        month: Mês (1-12)
        output_dir: Diretório de saída (opcional)
    
    Returns:
        Dicionário com dados processados
    """
    extractor = CAGEDExtractor(output_dir)
    
    try:
        extractor.connect_ftp()
        result = extractor.process_month(year, month)
        return result
    finally:
        extractor.disconnect_ftp()


if __name__ == "__main__":
    import sys
    
    # Pega ano e mês dos argumentos ou usa atual
    year = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.now().year
    month = int(sys.argv[2]) if len(sys.argv) > 2 else datetime.now().month - 1 or 12
    
    print(f"Extraindo dados do CAGED para {month:02d}/{year}")
    
    data = extract_caged_data(year, month)
    
    if data:
        print("\n=== Resumo ===")
        print(f"Total de registros TI: {data['summary']['total_records']:,}")
        print(f"Admissões: {data['summary']['admissions']:,}")
        print(f"Demissões: {data['summary']['dismissals']:,}")
        print(f"Saldo: {data['summary']['balance']:+,}")
        print(f"Salário médio: R$ {data['summary']['avg_salary']:,.2f}")
