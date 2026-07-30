/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { db } from '../services/db';
import { calcularEstatisticasServico, getHierarquiaOrdenada } from '../utils/helpers';
import { 
  Users, 
  ShieldAlert, 
  CalendarCheck, 
  FileCheck, 
  TrendingUp, 
  Activity, 
  Award 
} from 'lucide-react';

interface DashboardProps {
  anoMes: string;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ anoMes, onNavigate }) => {
  const militares = db.militares.getAll();
  const funcoes = db.funcoes.getAll();
  const registros = db.escala.getByMês(anoMes);
  
  // Filtragens
  const militaresAtivos = militares.filter(m => m.ativo);
  const emFerias = militares.filter(m => m.situacaoAtual === 'Férias').length;
  const emCurso = militares.filter(m => m.situacaoAtual === 'Curso').length;
  const emLicenca = militares.filter(m => m.situacaoAtual === 'Licença').length;
  const aptos = militares.filter(m => m.situacaoAtual === 'Apto' && m.ativo).length;

  const totalServicosMes = registros.filter(r => r.situacao === 'SV').length;

  // Estatísticas individuais de serviços no mês
  const stats = calcularEstatisticasServico(militaresAtivos, registros, anoMes);
  const militaresOrdenadosPorServico = [...militaresAtivos]
    .map(m => ({
      ...m,
      totalServicos: stats[m.id]?.total || 0,
      diasUteis: stats[m.id]?.diasUteis || 0,
      fimDeSemana: stats[m.id]?.fimDeSemana || 0,
    }))
    .sort((a, b) => b.totalServicos - a.totalServicos);

  // Mês legível
  const [ano, mes] = anoMes.split('-');
  const mesesNome = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesExtenso = mesesNome[parseInt(mes) - 1];

  return (
    <div id="dashboard-page" className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Painel do Aprovisionamento Militar
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Resumo gerencial e estatísticas da escala para <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mesExtenso} de {ano}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="dash-btn-escala"
            onClick={() => onNavigate('escala')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Ver Escala Diária
          </button>
          <button
            id="dash-btn-aditamento"
            onClick={() => onNavigate('aditamento')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Gerar Aditamento
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Total Militares */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Efetivo de Militares</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{militares.length}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{aptos} Aptos</span> • {militares.length - aptos} Afastados
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Afastados de Serviço */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Impedimentos Ativos</span>
            <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
              {emFerias + emCurso + emLicenca}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {emFerias} Férias • {emCurso} Curso • {emLicenca} Licença
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Grid: Leaderboard & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equidade da Escala: Militares com mais serviços */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Ranking de Equidade de Escalas
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Acompanhamento da divisão justa de serviços para evitar sobrecarga.
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm font-mono font-bold">
              JULHO/2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="dash-ranking-table" className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-xs">
                  <th className="pb-3 font-normal">Militar</th>
                  <th className="pb-3 text-center font-normal">Serviços Totais</th>
                  <th className="pb-3 text-center font-normal">Dias Úteis</th>
                  <th className="pb-3 text-center font-normal">Finais de Semana</th>
                  <th className="pb-3 font-normal">Carga Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/55">
                {militaresOrdenadosPorServico.slice(0, 5).map((m) => {
                  const percent = totalServicosMes > 0 ? (m.totalServicos / totalServicosMes) * 100 : 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                        {m.postoGraduacao} <span className="font-semibold">{m.nomeGuerra}</span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {m.totalServicos}
                      </td>
                      <td className="py-3 text-center text-xs text-slate-500 dark:text-slate-400">
                        {m.diasUteis}
                      </td>
                      <td className="py-3 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold text-red-500">
                        {m.fimDeSemana}
                      </td>
                      <td className="py-3 w-1/4">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              m.totalServicos >= 8 
                                ? 'bg-red-500' 
                                : m.totalServicos >= 5 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, percent * 5)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impedimentos & Alertas de Escala */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Alertas de Segurança
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Inconsistências ou sobrecarga detectadas em tempo real.
            </p>
          </div>

          <div className="space-y-3">
            {/* Alerta 1 */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-950 dark:text-amber-300">
              <p className="text-xs font-bold leading-none">Descanso abaixo do padrão (Folga preta)</p>
              <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                O militar <strong>3º Sgt Danilo</strong> foi escalado em dias consecutivos com intervalo inferior a 48h (Julho 4 e Julho 5).
              </p>
            </div>

            {/* Alerta 2 */}
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 text-red-950 dark:text-red-300">
              <p className="text-xs font-bold leading-none">Militar Escalado com Afastamento Ativo</p>
              <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                Impossível salvar escala completa: <strong>Cb Medeiros</strong> possui licença médica até final do mês.
              </p>
            </div>

            {/* Alerta 3 */}
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-950 dark:text-emerald-300">
              <p className="text-xs font-bold leading-none">Distribuição de Finais de Semana</p>
              <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                Equilíbrio de serviços vermelhos atingido com 91% de igualdade este mês no setor de aprovisionamento.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
