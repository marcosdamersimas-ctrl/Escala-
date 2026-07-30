/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EscalaRegistro, Militar, PostoGraduacao } from '../types';

/**
 * Retorna os dias de um determinado mês e ano
 */
export const getDiasDoMes = (ano: number, mes: number): Date[] => {
  const date = new Date(ano, mes - 1, 1);
  const dias: Date[] = [];
  while (date.getMonth() === mes - 1) {
    dias.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dias;
};

/**
 * Formata data em formato YYYY-MM-DD
 */
export const formatarDataISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Retorna o nome do dia da semana em português abreviado
 */
export const getDiaSemanaAbrev = (date: Date): string => {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dias[date.getDay()];
};

/**
 * Retorna se o dia é final de semana (sábado ou domingo)
 */
export const isFimDeSemana = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Filtra os postos e graduações na ordem hierárquica militar correta
 */
export const POSTOS_GRADUACOES: PostoGraduacao[] = [
  'Cel', 'Ten Cel', 'Maj', 'Cap', '1º Ten', '2º Ten',
  'Subten', '1º Sgt', '2º Sgt', '3º Sgt', 'Cb', 'Sd'
];

export const getHierarquiaOrdenada = (militares: Militar[]): Militar[] => {
  return [...militares].sort((a, b) => {
    const idxA = POSTOS_GRADUACOES.indexOf(a.postoGraduacao);
    const idxB = POSTOS_GRADUACOES.indexOf(b.postoGraduacao);
    if (idxA !== idxB) return idxA - idxB;
    return a.antiguidade - b.antiguidade;
  });
};

/**
 * Conta a quantidade de serviços realizados por cada militar no mês selecionado
 */
export const calcularEstatisticasServico = (
  militares: Militar[],
  registros: EscalaRegistro[],
  anoMes: string // YYYY-MM
) => {
  const stats: { [militarId: string]: { total: number; diasUteis: number; fimDeSemana: number } } = {};
  
  militares.forEach(m => {
    stats[m.id] = { total: 0, diasUteis: 0, fimDeSemana: 0 };
  });

  registros.forEach(r => {
    if (r.situacao === 'SV' && stats[r.militarId]) {
      stats[r.militarId].total += 1;
      
      const dataObj = new Date(r.data + 'T12:00:00'); // Evita timezone offset
      if (isFimDeSemana(dataObj)) {
        stats[r.militarId].fimDeSemana += 1;
      } else {
        stats[r.militarId].diasUteis += 1;
      }
    }
  });

  return stats;
};

export interface RegraViolacao {
  id: string;
  tipo: 'erro' | 'aviso';
  militarId: string;
  militarNome: string;
  data: string;
  regra: string;
  mensagem: string;
}

/**
 * Motor de Regras Expansível para Validação de Escalas Militares.
 * Pode ser facilmente estendido para outras funções ou novos serviços.
 */
export const REGRAS_VALIDACAO = {
  // 1. REGRA DE DUPLICIDADE: Militar escalado duas vezes no mesmo dia
  DUPLICIDADE: {
    id: 'duplicidade',
    nome: 'Impedimento de Duplicidade',
    validar: (militarId: string, dataAlvo: string, todosRegistros: EscalaRegistro[], militar: Militar): RegraViolacao | null => {
      const svNoDia = todosRegistros.filter(r => r.militarId === militarId && r.data === dataAlvo && r.situacao === 'SV');
      if (svNoDia.length > 1) {
        return {
          id: `dup-${militarId}-${dataAlvo}`,
          tipo: 'erro',
          militarId,
          militarNome: `${militar.postoGraduacao} ${militar.nomeGuerra}`,
          data: dataAlvo,
          regra: 'DUPLICIDADE',
          mensagem: `Erro Crítico: O militar foi escalado em mais de uma função de serviço no dia ${dataAlvo.split('-').reverse().join('/')}.`
        };
      }
      return null;
    }
  },

  // 2. REGRA DE DISPONIBILIDADE: Militar escalado sob afastamentos ativos (férias, licenças, dispensa, curso)
  DISPONIBILIDADE: {
    id: 'disponibilidade',
    nome: 'Indisponibilidade de Efetivo',
    validar: (militarId: string, dataAlvo: string, todosRegistros: EscalaRegistro[], militar: Militar): RegraViolacao | null => {
      const afastamentoAtivo = todosRegistros.find(
        r => r.militarId === militarId && r.data === dataAlvo && r.situacao !== 'SV' && r.situacao !== 'Folga'
      );
      if (afastamentoAtivo) {
        return {
          id: `disp-${militarId}-${dataAlvo}`,
          tipo: 'erro',
          militarId,
          militarNome: `${militar.postoGraduacao} ${militar.nomeGuerra}`,
          data: dataAlvo,
          regra: 'DISPONIBILIDADE',
          mensagem: `Impossível escalar: Militar indisponível nesta data devido ao registro administrativo de [${afastamentoAtivo.situacao}].`
        };
      }
      return null;
    }
  },

  // 3. REGRA DE INTERSTÍCIO (INTERVALO DE RESTO): Folga mínima entre serviços
  INTERSTICIO: {
    id: 'intersticio',
    nome: 'Intervalo Mínimo de Descanso',
    validar: (militarId: string, dataAlvo: string, todosRegistros: EscalaRegistro[], militar: Militar, diasIntervaloMinimo: number = 3): RegraViolacao | null => {
      const dataAlvoObj = new Date(dataAlvo + 'T12:00:00');
      const outrosServicos = todosRegistros.filter(
        r => r.militarId === militarId && r.situacao === 'SV' && r.data !== dataAlvo
      );

      for (const sv of outrosServicos) {
        const svDataObj = new Date(sv.data + 'T12:00:00');
        const diffTime = Math.abs(dataAlvoObj.getTime() - svDataObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= diasIntervaloMinimo) {
          return {
            id: `int-${militarId}-${dataAlvo}-${sv.data}`,
            tipo: 'aviso',
            militarId,
            militarNome: `${militar.postoGraduacao} ${militar.nomeGuerra}`,
            data: dataAlvo,
            regra: 'INTERSTICIO',
            mensagem: `Aviso de Descanso: Intervalo muito curto de apenas ${diffDays} dias em relação ao serviço realizado em ${sv.data.split('-').reverse().join('/')}.`
          };
        }
      }
      return null;
    }
  },

  // 4. COMPATIBILIDADE DE POSTO/GRADUAÇÃO COM A FUNÇÃO (Evitar Tenente lavando talheres, ou Soldado de Supervisor Geral)
  COMPATIBILIDADE_POSTO: {
    id: 'compatibilidade_posto',
    nome: 'Compatibilidade de Posto/Função',
    validar: (militarId: string, dataAlvo: string, todosRegistros: EscalaRegistro[], militar: Militar): RegraViolacao | null => {
      const svAtivo = todosRegistros.find(r => r.militarId === militarId && r.data === dataAlvo && r.situacao === 'SV');
      if (!svAtivo || !svAtivo.funcaoId) return null;

      const posto = militar.postoGraduacao;
      const fId = svAtivo.funcaoId;

      // Sgt de Dia ao Aprov (f-1) -> Deve ser Ten, Subten ou Sgt
      if (fId === 'f-1' && !['Cel', 'Ten Cel', 'Maj', 'Cap', '1º Ten', '2º Ten', 'Subten', '1º Sgt', '2º Sgt', '3º Sgt'].includes(posto)) {
        return {
          id: `comp-${militarId}-${dataAlvo}`,
          tipo: 'erro',
          militarId,
          militarNome: `${posto} ${militar.nomeGuerra}`,
          data: dataAlvo,
          regra: 'COMPATIBILIDADE_POSTO',
          mensagem: `Incompatibilidade de Função: O posto de ${posto} é inadequado para concorrer à função de Sgt de Dia ao Aprov.`
        };
      }

      // Aux do Cozinheiro ou Lavagem (f-3, f-9) -> Deve ser Cabo ou Soldado
      if (['f-3', 'f-9'].includes(fId) && !['Cb', 'Sd'].includes(posto)) {
        return {
          id: `comp-${militarId}-${dataAlvo}`,
          tipo: 'aviso',
          militarId,
          militarNome: `${posto} ${militar.nomeGuerra}`,
          data: dataAlvo,
          regra: 'COMPATIBILIDADE_POSTO',
          mensagem: `Aviso de Posto: Militar graduado (${posto}) escalado em serviço tipicamente executado por Cb/Sd (${fId === 'f-3' ? 'Aux do Cozinheiro' : 'Lavagem de Talheres'}).`
        };
      }

      return null;
    }
  },

  // 5. EQUIDADE EM FINAIS DE SEMANA CONSECUTIVOS (Evitar militar trabalhando sáb/dom duas semanas seguidas)
  FIM_DE_SEMANA_CONSECUTIVO: {
    id: 'fim_de_semana_consecutivo',
    nome: 'Fim de Semana Consecutivo',
    validar: (militarId: string, dataAlvo: string, todosRegistros: EscalaRegistro[], militar: Militar): RegraViolacao | null => {
      const dataAlvoObj = new Date(dataAlvo + 'T12:00:00');
      if (!isFimDeSemana(dataAlvoObj)) return null;

      const outrosServicosFds = todosRegistros.filter(
        r => r.militarId === militarId && r.situacao === 'SV' && r.data !== dataAlvo && isFimDeSemana(new Date(r.data + 'T12:00:00'))
      );

      for (const sv of outrosServicosFds) {
        const svDataObj = new Date(sv.data + 'T12:00:00');
        const diffTime = Math.abs(dataAlvoObj.getTime() - svDataObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Se o intervalo entre fins de semana for menor ou igual a 8 dias (finais de semana consecutivos)
        if (diffDays <= 8) {
          return {
            id: `fds-${militarId}-${dataAlvo}`,
            tipo: 'aviso',
            militarId,
            militarNome: `${militar.postoGraduacao} ${militar.nomeGuerra}`,
            data: dataAlvo,
            regra: 'FIM_DE_SEMANA_CONSECUTIVO',
            mensagem: `Aviso de Equidade: Militar escalado em finais de semana consecutivos (este dia e em ${sv.data.split('-').reverse().join('/')}).`
          };
        }
      }
      return null;
    }
  }
};

/**
 * Valida um único registro de escala contra todo o conjunto de regras do motor expansível.
 */
export const verificarConflitoEscala = (
  militarId: string,
  dataAlvo: string,
  todosRegistros: EscalaRegistro[],
  diasIntervaloMinimo: number = 3
): { tipo: 'erro' | 'aviso'; mensagem: string } | null => {
  const militar = todosRegistros.find(r => r.militarId === militarId)?.militarId 
    ? { id: militarId, nomeGuerra: 'Militar', postoGraduacao: 'Subten' as PostoGraduacao } // Fallback se não achado
    : null;

  // Carrega militar real do banco local
  const realMilitar = todosRegistros.find(r => r.militarId === militarId) 
    ? (window as any)._cachedMilitares?.find((m: any) => m.id === militarId)
    : null;

  const mockMilitar: Militar = realMilitar || {
    id: militarId,
    nomeCompleto: 'Militar do Corpo',
    nomeGuerra: 'Militar',
    postoGraduacao: 'Cb',
    situacaoAtual: 'Apto',
    funcaoId: 'f-3',
    antiguidade: 10,
    ativo: true
  };

  // Executar validadores
  const vDup = REGRAS_VALIDACAO.DUPLICIDADE.validar(militarId, dataAlvo, todosRegistros, mockMilitar);
  if (vDup) return { tipo: vDup.tipo, mensagem: vDup.mensagem };

  const vDisp = REGRAS_VALIDACAO.DISPONIBILIDADE.validar(militarId, dataAlvo, todosRegistros, mockMilitar);
  if (vDisp) return { tipo: vDisp.tipo, mensagem: vDisp.mensagem };

  const vInt = REGRAS_VALIDACAO.INTERSTICIO.validar(militarId, dataAlvo, todosRegistros, mockMilitar, diasIntervaloMinimo);
  if (vInt) return { tipo: vInt.tipo, mensagem: vInt.mensagem };

  const vComp = REGRAS_VALIDACAO.COMPATIBILIDADE_POSTO.validar(militarId, dataAlvo, todosRegistros, mockMilitar);
  if (vComp) return { tipo: vComp.tipo, mensagem: vComp.mensagem };

  const vFds = REGRAS_VALIDACAO.FIM_DE_SEMANA_CONSECUTIVO.validar(militarId, dataAlvo, todosRegistros, mockMilitar);
  if (vFds) return { tipo: vFds.tipo, mensagem: vFds.mensagem };

  return null;
};

/**
 * Valida a escala de um mês inteiro de forma abrangente, retornando todas as violações encontradas.
 */
export const validarTodaEscalaDoMes = (
  militares: Militar[],
  registros: EscalaRegistro[],
  anoMes: string
): RegraViolacao[] => {
  const violacoes: RegraViolacao[] = [];
  const diasDoMes = getDiasDoMes(parseInt(anoMes.split('-')[0]), parseInt(anoMes.split('-')[1]));

  militares.forEach(militar => {
    diasDoMes.forEach(date => {
      const dataStr = formatarDataISO(date);
      
      // Rodar os validadores ativos para cada dia do militar
      const vDup = REGRAS_VALIDACAO.DUPLICIDADE.validar(militar.id, dataStr, registros, militar);
      if (vDup) violacoes.push(vDup);

      const vDisp = REGRAS_VALIDACAO.DISPONIBILIDADE.validar(militar.id, dataStr, registros, militar);
      if (vDisp) violacoes.push(vDisp);

      const vInt = REGRAS_VALIDACAO.INTERSTICIO.validar(militar.id, dataStr, registros, militar, 3);
      if (vInt) violacoes.push(vInt);

      const vComp = REGRAS_VALIDACAO.COMPATIBILIDADE_POSTO.validar(militar.id, dataStr, registros, militar);
      if (vComp) violacoes.push(vComp);

      const vFds = REGRAS_VALIDACAO.FIM_DE_SEMANA_CONSECUTIVO.validar(militar.id, dataStr, registros, militar);
      if (vFds) violacoes.push(vFds);
    });
  });

  // Remover duplicatas de violacoes por ID
  const uniqueViolacoes: RegraViolacao[] = [];
  const seenIds = new Set<string>();
  violacoes.forEach(v => {
    if (!seenIds.has(v.id)) {
      seenIds.add(v.id);
      uniqueViolacoes.push(v);
    }
  });

  return uniqueViolacoes;
};

/**
 * Gera o texto do Aditamento padrão militar para o Aprovisionamento
 */
export const gerarTextoAditamentoDefault = (
  anoMes: string, // YYYY-MM
  militares: Militar[],
  registros: EscalaRegistro[],
  boletimNum: string = '045',
  tipoFiltro: 'todos' | 'semana' | 'fds' = 'todos'
): string => {
  const [ano, mes] = anoMes.split('-');
  const mesesNome = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesNome = mesesNome[parseInt(mes) - 1];

  const dias = getDiasDoMes(parseInt(ano), parseInt(mes));
  let servicos = registros.filter(r => r.situacao === 'SV').sort((a, b) => a.data.localeCompare(b.data));

  // Aplicar filtros de Segunda a Sexta ou Fim de Semana se solicitado
  if (tipoFiltro === 'semana') {
    servicos = servicos.filter(s => !isFimDeSemana(new Date(s.data + 'T12:00:00')));
  } else if (tipoFiltro === 'fds') {
    servicos = servicos.filter(s => isFimDeSemana(new Date(s.data + 'T12:00:00')));
  }

  let tituloAditamento = tipoFiltro === 'semana' ? 'ADITAMENTO DE DIAS ÚTEIS (SEGUNDA A SEXTA)' :
                         tipoFiltro === 'fds' ? 'ADITAMENTO DE FINS DE SEMANA (SÁBADO E DOMINGO)' :
                         'ADITAMENTO GERAL';

  let corpo = `MINISTÉRIO DE DEFESA\nEXÉRCITO BRASILEIRO\nORGANIZAÇÃO MILITAR REGIONAL\n\nADITAMENTO DO SETOR DE APROVISIONAMENTO AO BI Nº ${boletimNum}, DE 19 DE JULHO DE 2026\n\n`;
  corpo += `Para conhecimento deste Setor e devida execução, publico o seguinte:\n\n`;
  corpo += `1ª PARTE - SERVIÇOS DIÁRIOS (${tituloAditamento})\n\n`;
  corpo += `Escala de Serviço de Aprovisionamento para o mês de ${mesNome.toUpperCase()} de ${ano}.\n\n`;

  // Agrupar serviços por dia
  const servicosPorDia: { [data: string]: EscalaRegistro[] } = {};
  servicos.forEach(s => {
    if (!servicosPorDia[s.data]) {
      servicosPorDia[s.data] = [];
    }
    servicosPorDia[s.data].push(s);
  });

  // Ordenar datas
  const datasOrdenadas = Object.keys(servicosPorDia).sort();

  datasOrdenadas.forEach(dataStr => {
    const dataObj = new Date(dataStr + 'T12:00:00');
    const diaNum = dataObj.getDate().toString().padStart(2, '0');
    const diaSem = getDiaSemanaAbrev(dataObj).toUpperCase();
    
    corpo += `Dia ${diaNum} (${diaSem}) - Refeições e Fiscalização:\n`;
    
    const regs = servicosPorDia[dataStr];
    regs.forEach(r => {
      const mil = militares.find(m => m.id === r.militarId);
      if (mil) {
        const funcaoNome = r.funcaoId === 'f-1' ? 'SUPERVISOR DE APROVISIONAMENTO' :
                           r.funcaoId === 'f-2' ? 'FISCAL DE RANHO' :
                           r.funcaoId === 'f-3' ? 'COZINHEIRO DE SERVIÇO' :
                           r.funcaoId === 'f-4' ? 'AUXILIAR DE COZINHA' : 'AUXILIAR DE SERVIÇO';
        corpo += `  - ${funcaoNome}: ${mil.postoGraduacao} ${mil.nomeGuerra.toUpperCase()}\n`;
      }
    });
    corpo += `\n`;
  });

  if (datasOrdenadas.length === 0) {
    corpo += `Nenhum serviço escalado para este período/filtro selecionado.\n\n`;
  }

  corpo += `\n2ª PARTE - INSTRUÇÃO e ADMINISTRAÇÃO\n\n`;
  corpo += `Sem alteração.\n\n`;
  corpo += `3ª PARTE - ASSUNTOS GERAIS E ADMINISTRATIVOS\n\n`;
  corpo += `Apto para serviço todos os militares constantes na escala atual, exceto aqueles sob licença, férias ou dispensa médica médica devidamente regulamentadas.\n\n`;
  corpo += `Quartel Geral de Organização Militar, 19 de Julho de 2026.\n\n\n`;
  corpo += `_____________________________________\n`;
  corpo += `Encarregado do Setor de Aprovisionamento`;

  return corpo;
};
