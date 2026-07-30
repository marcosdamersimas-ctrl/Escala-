/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  Download, 
  Upload, 
  Cpu, 
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const Configuracoes: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza de que deseja apagar todos os dados e restaurar o banco de dados local para o padrão de simulação da OM?')) {
      db.resetDB();
      showSuccess('Banco de dados de simulação restaurado com sucesso para os dados de fábrica!');
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = {
      militares: db.militares.getAll(),
      funcoes: db.funcoes.getAll(),
      escala: db.escala.getAll(),
      aditamentos: db.aditamentos.getAll()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escala_mais_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showSuccess('Backup gerado e baixado com sucesso!');
  };

  return (
    <div id="configuracoes-page" className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-zinc-100 animate-in fade-in duration-300">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 border-b border-[#1e3423]/60 pb-5">
        <div className="p-3 bg-[#16271a] border border-[#26422d] text-[#E5BA5D] rounded-2xl shadow-inner">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white leading-tight font-sans tracking-wide">CONFIGURAÇÕES DO SISTEMA</h2>
          <p className="text-xs font-semibold text-zinc-400 mt-0.5">Gerenciamento de banco de dados local, backups e parâmetros de simulação.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200 shadow-md">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Database control */}
      <div className="p-6 rounded-3xl border border-[#1e3423] bg-[#0e1710] shadow-xl space-y-5">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2 uppercase tracking-wide">
          <Database className="w-4 h-4 text-[#E5BA5D]" />
          Gerenciamento de Dados Locais
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
          O sistema salva todas as alterações diretamente no armazenamento seguro e persistente do seu navegador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            id="cfg-btn-export"
            onClick={handleExport}
            className="p-5 rounded-2xl border border-[#1e3423] bg-[#121f15] hover:bg-[#182c1d] hover:border-[#E5BA5D]/50 text-left space-y-3 flex flex-col justify-between transition-all cursor-pointer shadow-md group"
          >
            <div className="p-2.5 bg-[#1a2f20] border border-[#26422d] text-[#E5BA5D] rounded-xl w-fit group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white group-hover:text-[#FFF2BF] text-xs transition-colors">Exportar Backup Completo</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Baixe um arquivo JSON com todos os militares, funções, escalas salvas e aditamentos gerados.
              </p>
            </div>
          </button>

          <button
            id="cfg-btn-reset"
            onClick={handleReset}
            className="p-5 rounded-2xl border border-[#1e3423] bg-[#121f15] hover:bg-red-950/30 hover:border-red-800/60 text-left space-y-3 flex flex-col justify-between transition-all cursor-pointer shadow-md group"
          >
            <div className="p-2.5 bg-red-950/40 border border-red-800/40 text-red-400 rounded-xl w-fit group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-red-400 text-xs">Restaurar Banco de Dados</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Limpa todas as modificações e recarrega os militares e funções padrão do aprovisionamento.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Security Check & Technical Status */}
      <div className="p-6 rounded-3xl border border-[#1e3423] bg-[#0e1710] shadow-xl space-y-5">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2 uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-[#E5BA5D]" />
          Status Técnico & Conexões
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121f15] border border-[#1e3423]">
            <span className="font-bold text-zinc-300">Provedor de Dados Ativo:</span>
            <span className="font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
              LocalStorage_Firebase_Firestore
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121f15] border border-[#1e3423]">
            <span className="font-bold text-zinc-300">Sincronização em Tempo Real:</span>
            <span className="font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
              Ativa (Aditamentos & Escalas)
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121f15] border border-[#1e3423]">
            <span className="font-bold text-zinc-300">Auditoria & Assinatura Digital:</span>
            <span className="font-mono bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px]">
              Habilitado
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
