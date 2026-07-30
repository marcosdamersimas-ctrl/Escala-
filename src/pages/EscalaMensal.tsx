/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Militar, EscalaRegistro, SituacaoEscala, Funcao } from '../types';
import { 
  getDiasDoMes, 
  formatarDataISO, 
  getDiaSemanaAbrev, 
  isFimDeSemana, 
  getHierarquiaOrdenada,
  calcularEstatisticasServico,
  verificarConflitoEscala,
  validarTodaEscalaDoMes,
  RegraViolacao
} from '../utils/helpers';
import { 
  Calendar, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X,
  HelpCircle,
  Sparkles,
  Info,
  ShieldAlert,
  Award,
  ThumbsUp,
  Sliders,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface EscalaMensalProps {
  anoMes: string;
  setAnoMes: (val: string) => void;
  userRole?: 'admin' | 'guest';
}

export const EscalaMensal: React.FC<EscalaMensalProps> = ({ anoMes, setAnoMes, userRole = 'admin' }) => {
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [registros, setRegistros] = useState<EscalaRegistro[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPosto, setFiltroPosto] = useState('Todos');
  const [showActiveAlertsPanel, setShowActiveAlertsPanel] = useState(true);

  // Menu de Célula Ativo
  const [activeMenu, setActiveMenu] = useState<{
    militarId: string;
    dataStr: string;
    x: number;
    y: number;
  } | null>(null);

  // Alerta de Conflito Ativo
  const [conflitoAlerta, setConflitoAlerta] = useState<{
    mensagem: string;
    tipo: 'erro' | 'aviso';
  } | null>(null);

  // Carregar dados
  const carregarDados = () => {
    const activeMilitares = getHierarquiaOrdenada(db.militares.getAll().filter(m => m.ativo));
    setMilitares(activeMilitares);
    (window as any)._cachedMilitares = db.militares.getAll();
    setFuncoes(db.funcoes.getAll());
    setRegistros(db.escala.getAll());
  };

  useEffect(() => {
    carregarDados();
  }, [anoMes]);

  // Cálculos de Dias do Mês
  const [ano, mes] = anoMes.split('-').map(Number);
  const dias = getDiasDoMes(ano, mes);

  // Mês legível
  const mesesNome = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Navegar Mês
  const mudarMes = (direcao: 'prev' | 'next') => {
    let novoAno = ano;
    let novoMes = mes;
    if (direcao === 'prev') {
      novoMes = mes - 1;
      if (novoMes === 0) {
        novoMes = 12;
        novoAno = ano - 1;
      }
    } else {
      novoMes = mes + 1;
      if (novoMes === 13) {
        novoMes = 1;
        novoAno = ano + 1;
      }
    }
    const mesStr = String(novoMes).padStart(2, '0');
    setAnoMes(`${novoAno}-${mesStr}`);
  };

  // Filtrar Militares
  const militaresFiltrados = militares.filter(m => {
    const bateNome = m.nomeGuerra.toLowerCase().includes(filtroNome.toLowerCase()) || 
                     m.nomeCompleto.toLowerCase().includes(filtroNome.toLowerCase());
    const batePosto = filtroPosto === 'Todos' || m.postoGraduacao === filtroPosto;
    return bateNome && batePosto;
  });

  // Estatísticas de Serviços
  const stats = calcularEstatisticasServico(militares, registros.filter(r => r.data.startsWith(anoMes)), anoMes);

  // Ao clicar em uma célula, abre o menu suspenso
  const handleCellClick = (militarId: string, dataStr: string, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Posicionar popover
    setActiveMenu({
      militarId,
      dataStr,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 5
    });
    setConflitoAlerta(null);
  };

  // Salvar Situação Selecionada
  const handleSelecionarSituacao = (situacao: SituacaoEscala, funcaoId?: string) => {
    if (!activeMenu) return;
    
    const { militarId, dataStr } = activeMenu;

    // Verificar se há conflitos com a nova situação se for 'SV'
    if (situacao === 'SV') {
      const conflito = verificarConflitoEscala(militarId, dataStr, registros, 3);
      if (conflito) {
        setConflitoAlerta({
          tipo: conflito.tipo,
          mensagem: conflito.mensagem
        });
        
        // Se for um ERRO bloqueante (impedimento permanente), não salva
        if (conflito.tipo === 'erro') {
          return;
        }
      }
    }

    // Gerar novo registro ou atualizar
    const novoRegistro: EscalaRegistro = {
      id: `e-${militarId}-${dataStr}`,
      militarId,
      data: dataStr,
      situacao,
      funcaoId
    };

    db.escala.saveRegistro(novoRegistro);
    carregarDados();
    setActiveMenu(null);
    setConflitoAlerta(null);
  };

  // Limpar registro da célula (volta a ser Folga/Padrão)
  const handleLimparCel = () => {
    if (!activeMenu) return;
    const { militarId, dataStr } = activeMenu;
    db.escala.deleteRegistro(militarId, dataStr);
    carregarDados();
    setActiveMenu(null);
    setConflitoAlerta(null);
  };

  // Classes de Cores para as Células
  const getCellStyles = (situacao: string) => {
    switch (situacao) {
      case 'SV':
        return 'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold border-emerald-300 dark:border-emerald-800';
      case 'Curso':
        return 'bg-blue-500/15 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-semibold border-blue-300 dark:border-blue-800';
      case 'Licença':
        return 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold border-amber-300 dark:border-amber-800';
      case 'Férias':
        return 'bg-purple-500/15 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-semibold border-purple-300 dark:border-purple-800';
      case 'Dispensa':
        return 'bg-red-500/15 text-red-800 dark:bg-red-500/20 dark:text-red-300 font-semibold border-red-300 dark:border-red-800';
      default:
        return 'text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30';
    }
  };

  return (
    <div id="escala-page-wrapper" className="p-6 space-y-6">
      
      {/* Controles do Cabeçalho da Escala */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Matriz de Escala Diária</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aprovação visual dinâmica e livre de digitação.</p>
          </div>
        </div>

        {/* Seletor de Mês Moderno */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <button 
            id="btn-prev-month"
            onClick={() => mudarMes('prev')}
            className="p-1 rounded-md hover:bg-white hover:shadow-xs dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-xs font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {mesesNome[mes - 1]} / {ano}
          </span>
          <button 
            id="btn-next-month"
            onClick={() => mudarMes('next')}
            className="p-1 rounded-md hover:bg-white hover:shadow-xs dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
          <Filter className="w-3.5 h-3.5" />
          Filtros:
        </div>
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input 
            id="filter-name"
            type="text"
            placeholder="Pesquisar por nome de guerra..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
          <select
            id="filter-posto"
            value={filtroPosto}
            onChange={(e) => setFiltroPosto(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="Todos">Todos os Postos/Graduações</option>
            <option value="1º Ten">Oficiais (1º Ten)</option>
            <option value="Subten">Subtenentes</option>
            <option value="1º Sgt">Sargentos (1º / 2º / 3º Sgt)</option>
            <option value="Cb">Cabos</option>
            <option value="Sd">Soldados</option>
          </select>
        </div>
      </div>

      {/* MOTOR DE REGRAS - ALERT CENTER (EXPANSÍVEL) */}
      {(() => {
        const violacoes = validarTodaEscalaDoMes(militares, registros, anoMes);
        const erros = violacoes.filter(v => v.tipo === 'erro');
        const avisos = violacoes.filter(v => v.tipo === 'aviso');

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div 
              onClick={() => setShowActiveAlertsPanel(!showActiveAlertsPanel)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${
                  erros.length > 0 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                    : avisos.length > 0 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}>
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Motor de Validação de Escala (Real-time)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-none">
                    {violacoes.length === 0 
                      ? 'Nenhuma inconsistência operacional encontrada. Escala 100% regulamentar!' 
                      : `Detectamos ${erros.length} impeditivos críticos e ${avisos.length} observações de escala.`}
                  </p>
                </div>
              </div>
              <button className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                {showActiveAlertsPanel ? 'Recolher Painel' : 'Expandir Alertas'}
              </button>
            </div>

            {showActiveAlertsPanel && (
              <div className="border-t border-slate-100 dark:border-slate-800/60 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                {violacoes.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-extrabold uppercase tracking-wide">Escala em conformidade total!</p>
                      <p className="text-[11px] opacity-85 mt-0.5">Nenhum conflito de interstício, duplicidade, incompatibilidade de graduação ou indisponibilidade por licença detectado.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {violacoes.map((v) => (
                      <div 
                        key={v.id} 
                        className={`p-3 rounded-xl border text-xs flex gap-2.5 items-start transition-all ${
                          v.tipo === 'erro'
                            ? 'bg-red-500/5 border-red-500/15 text-red-800 dark:text-red-300'
                            : 'bg-amber-500/5 border-amber-500/15 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        <div className={`p-1 rounded-lg shrink-0 ${
                          v.tipo === 'erro' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                            <span className="font-mono">{v.data.split('-').reverse().join('/')}</span>
                            <span>•</span>
                            <span className="underline">{v.militarNome}</span>
                          </p>
                          <p className="text-[11px] leading-relaxed opacity-90">{v.mensagem}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase font-semibold border-t border-slate-100 dark:border-slate-800/40 pt-2.5">
                  <span>Regras Ativas: Interstício 72h • Duplicidade Diária • Licenças/Dispensa • Compatibilidade de Posto • FDS Consecutivo</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Motor Expansivo v1.2</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Matriz Grid (Tabela Horizontal Infinita) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table id="escala-matrix-table" className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                {/* Frozen Columns on Left */}
                <th className="p-3 font-semibold text-center w-10 border-r border-slate-200 dark:border-slate-800">#</th>
                <th className="p-3 font-semibold w-24 border-r border-slate-200 dark:border-slate-800">Pst/Grad</th>
                <th className="p-3 font-semibold w-40 border-r border-slate-200 dark:border-slate-800">Nome de Guerra</th>
                
                {/* Columns for Days of Month */}
                {dias.map(d => {
                  const fds = isFimDeSemana(d);
                  return (
                    <th 
                      key={d.getDate()} 
                      className={`text-center font-mono w-10 border-r border-slate-200/80 dark:border-slate-800/60 p-1.5 ${fds ? 'bg-red-500/5 text-red-500 font-bold' : ''}`}
                    >
                      <div className="leading-none font-bold text-slate-700 dark:text-slate-300">{String(d.getDate()).padStart(2, '0')}</div>
                      <div className="text-[9px] mt-0.5 uppercase tracking-tighter opacity-70">{getDiaSemanaAbrev(d)}</div>
                    </th>
                  );
                })}

                {/* Statistics Columns on Right */}
                <th className="p-3 font-semibold text-center w-16 bg-slate-50 dark:bg-slate-950/60">SV Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {militaresFiltrados.map((m, index) => {
                const totalMilitarServicos = stats[m.id]?.total || 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800/30">
                    <td className="p-3 text-center text-slate-400 font-mono border-r border-slate-200 dark:border-slate-800 bg-slate-50/20">{index + 1}</td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{m.postoGraduacao}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                      {m.nomeGuerra.toUpperCase()}
                    </td>

                    {/* Matriz de Células de Serviço */}
                    {dias.map(d => {
                      const dataStr = formatarDataISO(d);
                      const reg = registros.find(r => r.militarId === m.id && r.data === dataStr);
                      const fds = isFimDeSemana(d);
                      
                      let displayValue = '';
                      if (reg) {
                        displayValue = reg.situacao === 'SV' ? 'SV' : reg.situacao;
                      }

                      return (
                        <td 
                          key={d.getDate()}
                          onClick={(e) => handleCellClick(m.id, dataStr, e)}
                          className={`text-center border-r cursor-pointer transition-colors border-slate-200 dark:border-slate-800/40 p-1.5 h-10 ${
                            fds && !reg ? 'bg-red-500/[0.015]' : ''
                          } ${getCellStyles(displayValue)}`}
                        >
                          <span className="text-[10px] tracking-tight">{displayValue || '•'}</span>
                        </td>
                      );
                    })}

                    {/* Total acumulado */}
                    <td className="p-3 text-center font-mono font-bold bg-slate-50/50 dark:bg-slate-950/30 text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">
                      {totalMilitarServicos}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda de Cores Administrativas */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-300 dark:border-emerald-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Serviço (SV)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-blue-500/20 border border-blue-300 dark:border-blue-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Curso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-300 dark:border-amber-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Licença</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-purple-500/20 border border-purple-300 dark:border-purple-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Férias</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-500/20 border border-red-300 dark:border-red-800" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Dispensa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Folga</span>
        </div>
      </div>

      {/* Floating Interactive Scale Popover Cell Selection Menu */}
      {activeMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => { setActiveMenu(null); setConflitoAlerta(null); }}
          />

          <div 
            className="absolute z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3.5 w-60 space-y-2 animate-in fade-in zoom-in-95 duration-100"
            style={{ 
              left: Math.min(window.innerWidth - 260, activeMenu.x), 
              top: activeMenu.y 
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {userRole === 'guest' ? 'Ficha Informativa Diária' : 'Alterar Situação'}
              </span>
              <button 
                onClick={() => { setActiveMenu(null); setConflitoAlerta(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {userRole === 'guest' ? (
              <div className="space-y-3 p-1 text-xs">
                <div className="flex items-center gap-1.5 px-2 bg-amber-500/10 text-amber-800 dark:text-amber-400 font-extrabold text-[9px] py-1 rounded-md uppercase tracking-wider border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Apenas Leitura (Público)</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Militar Escalado</span>
                    <p className="font-extrabold text-slate-800 dark:text-white uppercase text-[11px] mt-0.5">
                      {(() => {
                        const m = militares.find(x => x.id === activeMenu.militarId);
                        return m ? `${m.postoGraduacao} ${m.nomeGuerra}` : 'Militar';
                      })()}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Data do Serviço</span>
                    <p className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                      {activeMenu.dataStr.split('-').reverse().join('/')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Situação Militar</span>
                    {(() => {
                      const reg = registros.find(r => r.militarId === activeMenu.militarId && r.data === activeMenu.dataStr);
                      if (!reg) return <p className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] mt-0.5">DISPONÍVEL (FOLGA)</p>;
                      
                      if (reg.situacao === 'SV') {
                        const func = funcoes.find(f => f.id === reg.funcaoId);
                        return (
                          <div className="mt-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-800 dark:text-emerald-400">
                            <p className="font-extrabold uppercase text-[9px] tracking-wider leading-none">Serviço Escalado</p>
                            <p className="font-bold text-[11px] mt-1 uppercase">{func ? func.nome : 'Aprovisionamento'}</p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="mt-1 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-800 dark:text-blue-400">
                            <p className="font-extrabold uppercase text-[9px] tracking-wider leading-none">{reg.situacao}</p>
                            <p className="text-[10px] mt-1 leading-relaxed opacity-90">Afastado temporariamente das escalas de serviço do mês.</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                <button
                  onClick={() => setActiveMenu(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold rounded-lg uppercase tracking-wider text-[10px] mt-2 transition-all border border-slate-200/50 dark:border-slate-800"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                {/* Conflito Alerta */}
                {conflitoAlerta && (
                  <div className={`p-2 rounded-lg text-[9px] leading-tight flex gap-1.5 ${
                    conflitoAlerta.tipo === 'erro' 
                      ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300' 
                      : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
                  }`}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{conflitoAlerta.mensagem}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 px-1">Serviço Militar</p>
                  
                  {/* Opções de Escalar nas Funções do Setor */}
                  {funcoes.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleSelecionarSituacao('SV', f.id)}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Escalar {f.nome}</span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold font-mono">SV</span>
                    </button>
                  ))}

                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-1">Afastamentos / Outros</p>

                  <button
                    onClick={() => handleSelecionarSituacao('Curso')}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Cadastrar Curso
                  </button>
                  <button
                    onClick={() => handleSelecionarSituacao('Licença')}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-medium"
                  >
                    Cadastrar Licença
                  </button>
                  <button
                    onClick={() => handleSelecionarSituacao('Férias')}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 font-medium"
                  >
                    Cadastrar Férias
                  </button>
                  <button
                    onClick={() => handleSelecionarSituacao('Dispensa')}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600 dark:text-red-400 font-medium"
                  >
                    Cadastrar Dispensa
                  </button>

                  <button
                    onClick={handleLimparCel}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 dark:hover:bg-red-950/10 font-bold border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-2.5"
                  >
                    Remover Situação (Folga)
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
};
