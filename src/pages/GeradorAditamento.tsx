/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Militar, EscalaRegistro, Aditamento } from '../types';
import { gerarTextoAditamentoDefault } from '../utils/helpers';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Save, 
  History, 
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface GeradorAditamentoProps {
  anoMes: string;
  userRole?: 'admin' | 'guest';
}

export const GeradorAditamento: React.FC<GeradorAditamentoProps> = ({ anoMes, userRole = 'admin' }) => {
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [registros, setRegistros] = useState<EscalaRegistro[]>([]);
  const [aditamentosSalvos, setAditamentosSalvos] = useState<Aditamento[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'semana' | 'fds'>('todos');
  
  // Inputs do Aditamento
  const [boletimNumero, setBoletimNumero] = useState('045');
  const [cabecalho, setCabecalho] = useState('MINISTÉRIO DE DEFESA\nEXÉRCITO BRASILEIRO\nORGANIZAÇÃO MILITAR REGIONAL');
  const [corpoTexto, setCorpoTexto] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Carregar dados
  const carregarDados = () => {
    const listM = db.militares.getAll();
    const listE = db.escala.getAll();
    const listA = db.aditamentos.getAll();
    
    setMilitares(listM);
    setRegistros(listE);
    setAditamentosSalvos(listA);

    // Gerar o corpo padrão baseado nos dados da escala deste mês e do filtro
    const texto = gerarTextoAditamentoDefault(anoMes, listM, listE, boletimNumero, tipoFiltro);
    setCorpoTexto(texto);
  };

  useEffect(() => {
    carregarDados();
  }, [anoMes, boletimNumero, tipoFiltro]);

  // Recalcular / Restaurar Padrão
  const handleRecalcular = () => {
    const texto = gerarTextoAditamentoDefault(anoMes, militares, registros, boletimNumero, tipoFiltro);
    setCorpoTexto(texto);
  };

  // Copiar para Área de Transferência
  const handleCopiar = () => {
    navigator.clipboard.writeText(corpoTexto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Salvar Aditamento no Histórico
  const handleSalvarAditamento = () => {
    setSalvando(true);
    const novoAditamento: Aditamento = {
      id: `a-${Date.now()}`,
      dataAditamento: new Date().toISOString().split('T')[0],
      boletimNumero,
      cabecalho,
      corpo: corpoTexto,
      escalaMês: anoMes,
      criadoEm: new Date().toLocaleString()
    };
    db.aditamentos.save(novoAditamento);
    
    setTimeout(() => {
      setAditamentosSalvos(db.aditamentos.getAll());
      setSalvando(false);
      alert('Documento de Aditamento arquivado com sucesso no histórico relacional!');
    }, 600);
  };

  // Restaurar aditamento do histórico
  const handleCarregarHistorico = (a: Aditamento) => {
    setBoletimNumero(a.boletimNumero);
    setCabecalho(a.cabecalho);
    setCorpoTexto(a.corpo);
  };

  // Imprimir
  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Aditamento Aprovisionamento OM</title>
          <style>
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 40px; 
              line-height: 1.5; 
              color: #000;
              background: #fff;
              font-size: 14px;
            }
            pre { 
              white-space: pre-wrap; 
              font-family: 'Times New Roman', Times, serif; 
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <pre>${corpoTexto}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="gerador-aditamento-page" className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Gerador Automatizado de Aditamento</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Preenchimento automático do expediente oficial baseado no mapa de serviços lançados.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-recalc-aditamento"
            onClick={handleRecalcular}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            title="Recalcular com base na escala atualizada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recalcular
          </button>
          <button
            id="btn-print-aditamento"
            onClick={handleImprimir}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
          <button
            id="btn-copy-aditamento"
            onClick={handleCopiar}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Copiado!' : 'Copiar Texto'}
          </button>
          {userRole !== 'guest' && (
            <button
              id="btn-save-aditamento"
              onClick={handleSalvarAditamento}
              disabled={salvando}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {salvando ? 'Arquivando...' : 'Arquivar Oficial'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Parâmetros do Documento */}
        <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Parâmetros do BI
          </h3>

          <div className="space-y-4 text-xs">
            {/* Boletim Numero */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 dark:text-slate-400">Boletim Interno (BI) Nº</label>
              <input
                id="param-bi-num"
                type="text"
                value={boletimNumero}
                onChange={(e) => setBoletimNumero(e.target.value)}
                placeholder="Ex: 045"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden"
              />
            </div>

            {/* Cabeçalho da Unidade */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 dark:text-slate-400">Cabeçalho Oficial da OM</label>
              <textarea
                id="param-bi-head"
                rows={3}
                value={cabecalho}
                onChange={(e) => setCabecalho(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed text-[11px] focus:outline-hidden"
              />
            </div>

            {/* MODELO PDF SELETOR (Segunda a Sexta vs Finais de Semana) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block">Modelo de Aditamento</label>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setTipoFiltro('todos')}
                  className={`w-full py-1.5 px-2.5 text-left rounded-lg font-bold transition-all text-[11px] flex items-center justify-between border ${
                    tipoFiltro === 'todos'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>Aditamento Completo</span>
                  <span className="text-[9px] opacity-70 font-mono">100%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoFiltro('semana')}
                  className={`w-full py-1.5 px-2.5 text-left rounded-lg font-bold transition-all text-[11px] flex items-center justify-between border ${
                    tipoFiltro === 'semana'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>Segunda a Sexta-Feira</span>
                  <span className="text-[9px] opacity-70 font-mono">SEG-SEX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoFiltro('fds')}
                  className={`w-full py-1.5 px-2.5 text-left rounded-lg font-bold transition-all text-[11px] flex items-center justify-between border ${
                    tipoFiltro === 'fds'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>Fins de Semana</span>
                  <span className="text-[9px] opacity-70 font-mono font-bold">SÁB-DOM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Histórico de Arquivos */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Arquivos de Aditamento
            </h4>
            
            <div className="space-y-2 overflow-y-auto max-h-48 text-[11px]">
              {aditamentosSalvos.map((a) => (
                <div 
                  key={a.id}
                  onClick={() => handleCarregarHistorico(a)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200">Adit. BI Nº {a.boletimNumero}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Escala: {a.escalaMês} • {a.criadoEm.split(' ')[0]}</p>
                </div>
              ))}
              {aditamentosSalvos.length === 0 && (
                <p className="text-[10px] text-slate-400 font-mono">Nenhum aditamento arquivado para este mês.</p>
              )}
            </div>
          </div>
        </div>

        {/* Visualizador do Papel Oficial */}
        <div className="lg:col-span-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 p-6 shadow-inner flex justify-center">
          
          {/* Folha A4 Simulação */}
          <div className="bg-white text-slate-900 border border-slate-300 dark:border-slate-850 p-12 max-w-3xl w-full min-h-[11in] shadow-lg rounded-sm font-serif select-text transition-colors duration-200">
            <textarea
              id="aditamento-sheet-textarea"
              value={corpoTexto}
              onChange={(e) => setCorpoTexto(e.target.value)}
              className="w-full h-full min-h-[9.5in] bg-transparent border-0 text-[13px] leading-relaxed resize-none focus:outline-hidden font-serif select-text text-slate-900"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
          </div>

        </div>
      </div>

    </div>
  );
};
