/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PostoGraduacao = 'Cel' | 'Ten Cel' | 'Maj' | 'Cap' | '1º Ten' | '2º Ten' | 'Asp' | 'Subten' | '1º Sgt' | '2º Sgt' | '3º Sgt' | 'Cb' | 'Sd' | 'Sd EV';

export type SituacaoMilitar = 'Apto' | 'Curso' | 'Licença' | 'Férias' | 'Dispensa' | 'Folga';

export type SituacaoEscala = 'SV' | 'Curso' | 'Licença' | 'Férias' | 'Dispensa' | 'Folga';

export interface DestinoLancamento {
  id: string;
  militarId: string;
  destino: string; // ex: 'Curso', 'Disp Cmt Pel', 'Disp Med', 'Férias', etc.
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  observacao?: string;
  criadoEm?: string;
}

export interface Funcao {
  id: string;
  nome: string;
  descricao: string;
}

export interface Militar {
  id: string;
  nomeCompleto: string;
  nomeGuerra: string;
  postoGraduacao: PostoGraduacao;
  situacaoAtual: SituacaoMilitar;
  funcaoId: string; // Função principal dele
  antiguidade: number; // Para ordenação na escala
  ativo: boolean;
  telefone?: string;
  identidadeMilitar?: string;
}

export interface EscalaRegistro {
  id: string;
  militarId: string;
  data: string; // Formato YYYY-MM-DD
  situacao: SituacaoEscala;
  funcaoId?: string; // Se for 'SV' (Serviço), qual função ele exerceu
}

export interface Aditamento {
  id: string;
  dataAditamento: string; // YYYY-MM-DD
  boletimNumero: string;
  cabecalho: string;
  corpo: string;
  escalaMês: string; // YYYY-MM
  criadoEm: string;
}
