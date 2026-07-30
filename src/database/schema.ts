/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Este arquivo documenta a estrutura do Banco de Dados para futura migração para SQLite ou Supabase.
// Toda a lógica atual do frontend é mapeada de acordo com esta especificação SQL.

export const SQL_SCHEMA = `
-- Tabela de Funções
CREATE TABLE funcoes (
    id TEXT PRIMARY KEY DEFAULT (uuid_generate_v4()),
    nome TEXT NOT NULL,
    descricao TEXT
);

-- Tabela de Militares
CREATE TABLE militares (
    id TEXT PRIMARY KEY DEFAULT (uuid_generate_v4()),
    nome_completo TEXT NOT NULL,
    nome_guerra TEXT NOT NULL,
    posto_graduacao TEXT NOT NULL CHECK (posto_graduacao IN ('Cel', 'Ten Cel', 'Maj', 'Cap', '1º Ten', '2º Ten', 'Subten', '1º Sgt', '2º Sgt', '3º Sgt', 'Cb', 'Sd')),
    situacao_atual TEXT NOT NULL DEFAULT 'Apto' CHECK (situacao_atual IN ('Apto', 'Curso', 'Licença', 'Férias', 'Dispensa', 'Folga')),
    funcao_id TEXT REFERENCES funcoes(id) ON DELETE SET NULL,
    antiguidade INTEGER NOT NULL DEFAULT 999,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    telefone TEXT,
    identidade_militar TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registros de Escala Diária
CREATE TABLE escala_registros (
    id TEXT PRIMARY KEY DEFAULT (uuid_generate_v4()),
    militar_id TEXT NOT NULL REFERENCES militares(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    situacao TEXT NOT NULL CHECK (situacao IN ('SV', 'Curso', 'Licença', 'Férias', 'Dispensa', 'Folga')),
    funcao_id TEXT REFERENCES funcoes(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (militar_id, data)
);

-- Tabela de Aditamentos Gerados
CREATE TABLE aditamentos (
    id TEXT PRIMARY KEY DEFAULT (uuid_generate_v4()),
    data_aditamento DATE NOT NULL,
    boletim_numero TEXT NOT NULL,
    cabecalho TEXT NOT NULL,
    corpo TEXT NOT NULL,
    escala_mes TEXT NOT NULL, -- Formato YYYY-MM
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para otimização de busca e relatórios
CREATE INDEX idx_escala_data ON escala_registros(data);
CREATE INDEX idx_escala_militar_data ON escala_registros(militar_id, data);
CREATE INDEX idx_militares_antiguidade ON militares(antiguidade);
`;
