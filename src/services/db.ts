/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Militar, Funcao, EscalaRegistro, Aditamento, PostoGraduacao, DestinoLancamento } from '../types';

// Chaves para o LocalStorage
const KEY_MILITARES = 'escalamais_militares';
const KEY_FUNCOES = 'escalamais_funcoes';
const KEY_ESCALA = 'escalamais_escala_registros';
const KEY_ADITAMENTOS = 'escalamais_aditamentos';
const KEY_DESTINOS_CATALOG = 'escalamais_destinos_catalog';
const KEY_AFASTAMENTOS = 'escalamais_afastamentos';

// Destinos Padrão Iniciais
const DEFAULT_DESTINOS_CATALOG: string[] = ['Curso', 'Disp Cmt Pel', 'Disp Med', 'Férias'];

// Funções padrão do Aprovisionamento
const DEFAULT_FUNCOES: Funcao[] = [
  { id: 'f-1', nome: 'Sgt de Dia ao Aprov', descricao: 'Sargento de Dia ao Aprovisionamento (Supervisor Geral).' },
  { id: 'f-2', nome: 'Cozinheiro de Dia', descricao: 'Cozinheiro encarregado das refeições diárias.' },
  { id: 'f-3', nome: 'Auxiliar de Cozinheiro', descricao: 'Auxiliar do cozinheiro na cozinha militar.' },
  { id: 'f-4', nome: 'Cassineiro Of', descricao: 'Cassineiro dos Oficiais.' },
  { id: 'f-5', nome: 'Cassineiro St/Sgt', descricao: 'Cassineiro dos Subtenentes e Sargentos.' },
  { id: 'f-6', nome: 'Cassineiro de Dia', descricao: 'Cassineiro geral de serviço no dia.' },
  { id: 'f-7', nome: 'Padeiro de Dia', descricao: 'Padeiro de serviço diurno no ranho.' },
  { id: 'f-8', nome: 'Padeiro da Noite', descricao: 'Padeiro de serviço noturno no ranho.' },
  { id: 'f-9', nome: 'Lavagem dos Talheres', descricao: 'Responsável pela lavagem dos talheres (pronto às 08:00).' },
  { id: 'f-10', nome: 'Reforço da Cozinha', descricao: 'Reforço para auxílio geral na cozinha e aprovisionamento.' },
];

// Militares padrão do Aprovisionamento (Semeados inicialmente na Escala de Permanência)
const DEFAULT_MILITARES: Militar[] = [
  { id: 'm-1', nomeCompleto: 'Ricardo Cavalheiro de Souza', nomeGuerra: 'Cavalheiro', postoGraduacao: '1º Ten', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 1, ativo: true, telefone: '(21) 98888-1111', identidadeMilitar: '011223344-5' },
  { id: 'm-2', nomeCompleto: 'Carlos Alberto da Silva', nomeGuerra: 'Silva', postoGraduacao: 'Subten', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 2, ativo: true, telefone: '(21) 98888-2222', identidadeMilitar: '011223344-6' },
  { id: 'm-3', nomeCompleto: 'José Marcus de Oliveira', nomeGuerra: 'Oliveira', postoGraduacao: '1º Sgt', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 3, ativo: true, telefone: '(21) 98888-3333', identidadeMilitar: '011223344-7' },
  { id: 'm-4', nomeCompleto: 'Ana Paula Rodrigues', nomeGuerra: 'Paula', postoGraduacao: '2º Sgt', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 4, ativo: true, telefone: '(21) 98888-4444', identidadeMilitar: '011223344-8' },
  { id: 'm-5', nomeCompleto: 'Marcos de Souza Santos', nomeGuerra: 'Santos', postoGraduacao: '3º Sgt', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 5, ativo: true, telefone: '(21) 98888-5555', identidadeMilitar: '011223344-9' },
  { id: 'm-6', nomeCompleto: 'Danilo Pires da Costa', nomeGuerra: 'Danilo', postoGraduacao: '3º Sgt', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 6, ativo: true, telefone: '(21) 98888-6666', identidadeMilitar: '011223344-0' },
  { id: 'm-7', nomeCompleto: 'Roberto Lima Santos', nomeGuerra: 'Roberto', postoGraduacao: 'Cb', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 7, ativo: true, telefone: '(21) 97777-1111', identidadeMilitar: '022334455-1' },
  { id: 'm-8', nomeCompleto: 'Mário Jorge Medeiros', nomeGuerra: 'Medeiros', postoGraduacao: 'Cb', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 8, ativo: true, telefone: '(21) 97777-2222', identidadeMilitar: '022334455-2' },
  { id: 'm-9', nomeCompleto: 'Eduardo Guedes Carvalho', nomeGuerra: 'Guedes', postoGraduacao: 'Cb', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 9, ativo: true, telefone: '(21) 97777-3333', identidadeMilitar: '022334455-3' },
  { id: 'm-10', nomeCompleto: 'Alan Kardec de Souza', nomeGuerra: 'Kardec', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 10, ativo: true, telefone: '(21) 96666-1111', identidadeMilitar: '033445566-1' },
  { id: 'm-11', nomeCompleto: 'Rodrigo Antunes Neto', nomeGuerra: 'Antunes', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 11, ativo: true, telefone: '(21) 96666-2222', identidadeMilitar: '033445566-2' },
  { id: 'm-12', nomeCompleto: 'Felipe Albuquerque de Melo', nomeGuerra: 'Melo', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 12, ativo: true, telefone: '(21) 96666-3333', identidadeMilitar: '033445566-3' },
  { id: 'm-13', nomeCompleto: 'Jefferson Barbosa Lima', nomeGuerra: 'Barbosa', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 13, ativo: true, telefone: '(21) 96666-4444', identidadeMilitar: '033445566-4' },
  { id: 'm-14', nomeCompleto: 'William Silva Costa', nomeGuerra: 'William', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-1', antiguidade: 14, ativo: true, telefone: '(21) 96666-5555', identidadeMilitar: '033445566-5' },
  { id: 'm-15', nomeCompleto: 'Erick Teixeira da Silva', nomeGuerra: 'Erick Teixeira', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-7', antiguidade: 15, ativo: true, telefone: '(21) 96666-6666', identidadeMilitar: '033445566-6' },
  { id: 'm-16', nomeCompleto: 'Matheus Teodoro Santos', nomeGuerra: 'Teodoro', postoGraduacao: 'Sd', situacaoAtual: 'Apto', funcaoId: 'f-7', antiguidade: 16, ativo: true, telefone: '(21) 96666-7777', identidadeMilitar: '033445566-7' },
];

// Gerador de escala inicial totalmente limpa
const generateMockEscala = (): EscalaRegistro[] => {
  return [];
};

// Carregar e persistir dados no LocalStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar dados do localStorage para chave ${key}`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar dados no localStorage para chave ${key}`, error);
  }
};

// Inicialização da persistência de dados
export const initDB = () => {
  if (!localStorage.getItem(KEY_FUNCOES)) {
    setStorageItem(KEY_FUNCOES, DEFAULT_FUNCOES);
  }
  if (!localStorage.getItem(KEY_MILITARES)) {
    setStorageItem(KEY_MILITARES, DEFAULT_MILITARES);
  }
  if (!localStorage.getItem(KEY_ESCALA)) {
    setStorageItem(KEY_ESCALA, generateMockEscala());
  }
  if (!localStorage.getItem(KEY_ADITAMENTOS)) {
    setStorageItem(KEY_ADITAMENTOS, []);
  }
  if (!localStorage.getItem(KEY_DESTINOS_CATALOG)) {
    setStorageItem(KEY_DESTINOS_CATALOG, DEFAULT_DESTINOS_CATALOG);
  }
  if (!localStorage.getItem(KEY_AFASTAMENTOS)) {
    setStorageItem(KEY_AFASTAMENTOS, []);
  }
};

// Serviço do "Banco de Dados" Local
export const db = {
  destinosCatalog: {
    getAll: (): string[] => {
      initDB();
      return getStorageItem<string[]>(KEY_DESTINOS_CATALOG, DEFAULT_DESTINOS_CATALOG);
    },
    add: (novoDestino: string): void => {
      const list = db.destinosCatalog.getAll();
      const trimmed = novoDestino.trim();
      if (trimmed && !list.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
        list.push(trimmed);
        setStorageItem(KEY_DESTINOS_CATALOG, list);
      }
    },
    delete: (destino: string): void => {
      const list = db.destinosCatalog.getAll().filter(d => d !== destino);
      setStorageItem(KEY_DESTINOS_CATALOG, list);
    }
  },

  afastamentos: {
    getAll: (): DestinoLancamento[] => {
      initDB();
      return getStorageItem<DestinoLancamento[]>(KEY_AFASTAMENTOS, []);
    },
    save: (afastamento: DestinoLancamento): void => {
      const list = db.afastamentos.getAll();
      const index = list.findIndex(a => a.id === afastamento.id);
      if (index >= 0) {
        list[index] = afastamento;
      } else {
        list.push(afastamento);
      }
      setStorageItem(KEY_AFASTAMENTOS, list);
    },
    delete: (id: string): void => {
      const list = db.afastamentos.getAll().filter(a => a.id !== id);
      setStorageItem(KEY_AFASTAMENTOS, list);
    },
    getByMilitarAndDate: (militarId: string, data: string): DestinoLancamento | undefined => {
      const list = db.afastamentos.getAll();
      return list.find(a => a.militarId === militarId && data >= a.dataInicio && data <= a.dataFim);
    }
  },
  funcoes: {
    getAll: (): Funcao[] => {
      initDB();
      return getStorageItem<Funcao[]>(KEY_FUNCOES, []);
    },
    getById: (id: string): Funcao | undefined => {
      return db.funcoes.getAll().find(f => f.id === id);
    },
    save: (funcao: Funcao): void => {
      const list = db.funcoes.getAll();
      const index = list.findIndex(f => f.id === funcao.id);
      if (index >= 0) {
        list[index] = funcao;
      } else {
        list.push(funcao);
      }
      setStorageItem(KEY_FUNCOES, list);
    },
    delete: (id: string): void => {
      const list = db.funcoes.getAll().filter(f => f.id !== id);
      setStorageItem(KEY_FUNCOES, list);
    }
  },

  militares: {
    getAll: (): Militar[] => {
      initDB();
      return getStorageItem<Militar[]>(KEY_MILITARES, []).sort((a, b) => a.antiguidade - b.antiguidade);
    },
    getById: (id: string): Militar | undefined => {
      return db.militares.getAll().find(m => m.id === id);
    },
    save: (militar: Militar): void => {
      const list = db.militares.getAll();
      const index = list.findIndex(m => m.id === militar.id);
      if (index >= 0) {
        list[index] = militar;
      } else {
        list.push(militar);
      }
      setStorageItem(KEY_MILITARES, list);
    },
    delete: (id: string): void => {
      const list = db.militares.getAll().filter(m => m.id !== id);
      setStorageItem(KEY_MILITARES, list);
      
      // Remover escala associada se o militar for deletado
      const escala = db.escala.getAll().filter(e => e.militarId !== id);
      setStorageItem(KEY_ESCALA, escala);

      // Remover afastamentos associados
      const afastamentos = db.afastamentos.getAll().filter(a => a.militarId !== id);
      setStorageItem(KEY_AFASTAMENTOS, afastamentos);
    }
  },

  escala: {
    getAll: (): EscalaRegistro[] => {
      initDB();
      return getStorageItem<EscalaRegistro[]>(KEY_ESCALA, []);
    },
    getByMês: (anoMes: string): EscalaRegistro[] => {
      // anoMes: "YYYY-MM"
      return db.escala.getAll().filter(e => e.data.startsWith(anoMes));
    },
    saveRegistro: (registro: EscalaRegistro): void => {
      const list = db.escala.getAll();
      // Procurar se já existe registro para esse militar nesse dia
      const index = list.findIndex(e => e.militarId === registro.militarId && e.data === registro.data);
      if (index >= 0) {
        // Se a situação for Folga e não houver funcaoId, ou se for deletado, atualiza
        list[index] = registro;
      } else {
        list.push(registro);
      }
      setStorageItem(KEY_ESCALA, list);
    },
    bulkSave: (registros: EscalaRegistro[]): void => {
      const list = db.escala.getAll();
      registros.forEach(newReg => {
        const index = list.findIndex(e => e.militarId === newReg.militarId && e.data === newReg.data);
        if (index >= 0) {
          list[index] = newReg;
        } else {
          list.push(newReg);
        }
      });
      setStorageItem(KEY_ESCALA, list);
    },
    deleteRegistro: (militarId: string, data: string): void => {
      const list = db.escala.getAll().filter(e => !(e.militarId === militarId && e.data === data));
      setStorageItem(KEY_ESCALA, list);
    },
    // Retorna histórico de serviços de um militar
    getServicosHistorico: (militarId: string): EscalaRegistro[] => {
      return db.escala.getAll().filter(e => e.militarId === militarId && e.situacao === 'SV');
    },
    // Limpar todos os registros e serviços agendados da tabela
    clearAllServices: (): void => {
      setStorageItem(KEY_ESCALA, []);
    }
  },

  aditamentos: {
    getAll: (): Aditamento[] => {
      initDB();
      return getStorageItem<Aditamento[]>(KEY_ADITAMENTOS, []);
    },
    getById: (id: string): Aditamento | undefined => {
      return db.aditamentos.getAll().find(a => a.id === id);
    },
    save: (aditamento: Aditamento): void => {
      const list = db.aditamentos.getAll();
      const index = list.findIndex(a => a.id === aditamento.id);
      if (index >= 0) {
        list[index] = aditamento;
      } else {
        list.push(aditamento);
      }
      setStorageItem(KEY_ADITAMENTOS, list);
    },
    delete: (id: string): void => {
      const list = db.aditamentos.getAll().filter(a => a.id !== id);
      setStorageItem(KEY_ADITAMENTOS, list);
    }
  },
  
  // Limpar banco de dados e restaurar para padrão de fábrica
  resetDB: (): void => {
    localStorage.removeItem(KEY_FUNCOES);
    localStorage.removeItem(KEY_MILITARES);
    localStorage.removeItem(KEY_ESCALA);
    localStorage.removeItem(KEY_ADITAMENTOS);
    localStorage.removeItem(KEY_DESTINOS_CATALOG);
    localStorage.removeItem(KEY_AFASTAMENTOS);
    initDB();
  }
};
