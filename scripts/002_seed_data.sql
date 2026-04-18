-- Seed data para o dashboard funcionar antes de executar a pipeline
-- Dados de exemplo baseados no CAGED

-- Limpa dados existentes
DELETE FROM gender_data;
DELETE FROM state_data;
DELETE FROM timeline_data;
DELETE FROM monthly_summary;

-- Insert Monthly Summaries
INSERT INTO monthly_summary (month, month_label, total_records, total_admissions, total_dismissals, net_balance, avg_salary, processed_at) VALUES
('2026-02', 'Fevereiro/2026', 4500000, 38149, 36768, 1381, 4145.00, NOW()),
('2026-01', 'Janeiro/2026', 4200000, 35289, 34100, 1189, 4020.00, NOW()),
('2025-12', 'Dezembro/2025', 3800000, 32500, 33200, -700, 3980.00, NOW()),
('2025-11', 'Novembro/2025', 4100000, 34800, 33500, 1300, 3950.00, NOW()),
('2025-10', 'Outubro/2025', 4000000, 33900, 32800, 1100, 3920.00, NOW()),
('2025-09', 'Setembro/2025', 3900000, 33100, 32200, 900, 3890.00, NOW());

-- Insert State Data for February 2026
INSERT INTO state_data (month, state_code, state_name, admissions, dismissals, net_balance, avg_salary) VALUES
('2026-02', 'SP', 'São Paulo', 15234, 14432, 802, 5250.00),
('2026-02', 'RJ', 'Rio de Janeiro', 5890, 5512, 378, 4820.00),
('2026-02', 'MG', 'Minas Gerais', 3456, 3234, 222, 3950.00),
('2026-02', 'PR', 'Paraná', 2890, 2712, 178, 3780.00),
('2026-02', 'RS', 'Rio Grande do Sul', 2456, 2334, 122, 3650.00),
('2026-02', 'SC', 'Santa Catarina', 2234, 2100, 134, 3720.00),
('2026-02', 'BA', 'Bahia', 1678, 1612, 66, 3200.00),
('2026-02', 'DF', 'Distrito Federal', 1456, 1380, 76, 4500.00),
('2026-02', 'GO', 'Goiás', 1234, 1180, 54, 3150.00),
('2026-02', 'PE', 'Pernambuco', 1123, 1090, 33, 3100.00),
('2026-02', 'CE', 'Ceará', 987, 945, 42, 2980.00),
('2026-02', 'ES', 'Espírito Santo', 856, 812, 44, 3350.00),
('2026-02', 'PA', 'Pará', 567, 590, -23, 2850.00),
('2026-02', 'MT', 'Mato Grosso', 534, 512, 22, 3050.00),
('2026-02', 'MS', 'Mato Grosso do Sul', 489, 467, 22, 3000.00),
('2026-02', 'AM', 'Amazonas', 456, 478, -22, 3200.00),
('2026-02', 'RN', 'Rio Grande do Norte', 378, 356, 22, 2750.00),
('2026-02', 'PB', 'Paraíba', 345, 334, 11, 2680.00),
('2026-02', 'MA', 'Maranhão', 312, 334, -22, 2550.00),
('2026-02', 'AL', 'Alagoas', 267, 256, 11, 2620.00),
('2026-02', 'PI', 'Piauí', 234, 223, 11, 2480.00),
('2026-02', 'SE', 'Sergipe', 212, 201, 11, 2580.00),
('2026-02', 'TO', 'Tocantins', 178, 167, 11, 2650.00),
('2026-02', 'RO', 'Rondônia', 156, 145, 11, 2720.00),
('2026-02', 'AC', 'Acre', 89, 84, 5, 2550.00),
('2026-02', 'AP', 'Amapá', 78, 73, 5, 2600.00),
('2026-02', 'RR', 'Roraima', 67, 62, 5, 2580.00);

-- Insert State Data for January 2026
INSERT INTO state_data (month, state_code, state_name, admissions, dismissals, net_balance, avg_salary) VALUES
('2026-01', 'SP', 'São Paulo', 14100, 13500, 600, 5100.00),
('2026-01', 'RJ', 'Rio de Janeiro', 5200, 4900, 300, 4700.00),
('2026-01', 'MG', 'Minas Gerais', 3200, 3050, 150, 3850.00),
('2026-01', 'PR', 'Paraná', 2650, 2520, 130, 3680.00),
('2026-01', 'RS', 'Rio Grande do Sul', 2300, 2200, 100, 3550.00),
('2026-01', 'SC', 'Santa Catarina', 2100, 1980, 120, 3620.00),
('2026-01', 'BA', 'Bahia', 1550, 1500, 50, 3100.00),
('2026-01', 'DF', 'Distrito Federal', 1350, 1280, 70, 4400.00),
('2026-01', 'GO', 'Goiás', 1150, 1100, 50, 3050.00),
('2026-01', 'PE', 'Pernambuco', 1050, 1020, 30, 3000.00);

-- Insert State Data for December 2025
INSERT INTO state_data (month, state_code, state_name, admissions, dismissals, net_balance, avg_salary) VALUES
('2025-12', 'SP', 'São Paulo', 12500, 13200, -700, 5000.00),
('2025-12', 'RJ', 'Rio de Janeiro', 4800, 5100, -300, 4600.00),
('2025-12', 'MG', 'Minas Gerais', 2900, 3100, -200, 3750.00),
('2025-12', 'PR', 'Paraná', 2400, 2500, -100, 3580.00),
('2025-12', 'RS', 'Rio Grande do Sul', 2100, 2200, -100, 3450.00),
('2025-12', 'SC', 'Santa Catarina', 1900, 2000, -100, 3520.00),
('2025-12', 'BA', 'Bahia', 1400, 1500, -100, 3000.00),
('2025-12', 'DF', 'Distrito Federal', 1200, 1250, -50, 4300.00),
('2025-12', 'GO', 'Goiás', 1050, 1100, -50, 2950.00),
('2025-12', 'PE', 'Pernambuco', 950, 1000, -50, 2900.00);

-- Insert Timeline Data
INSERT INTO timeline_data (month, month_label, admissions, dismissals, net_balance) VALUES
('2025-09', 'Set/25', 33100, 32200, 900),
('2025-10', 'Out/25', 33900, 32800, 1100),
('2025-11', 'Nov/25', 34800, 33500, 1300),
('2025-12', 'Dez/25', 32500, 33200, -700),
('2026-01', 'Jan/26', 35289, 34100, 1189),
('2026-02', 'Fev/26', 38149, 36768, 1381);

-- Insert Gender Data for February 2026
INSERT INTO gender_data (month, gender, count, percentage) VALUES
('2026-02', 'Masculino', 28500, 74.7),
('2026-02', 'Feminino', 9649, 25.3);

-- Insert Gender Data for January 2026
INSERT INTO gender_data (month, gender, count, percentage) VALUES
('2026-01', 'Masculino', 26300, 74.5),
('2026-01', 'Feminino', 8989, 25.5);

-- Insert Gender Data for December 2025
INSERT INTO gender_data (month, gender, count, percentage) VALUES
('2025-12', 'Masculino', 24200, 74.5),
('2025-12', 'Feminino', 8300, 25.5);
