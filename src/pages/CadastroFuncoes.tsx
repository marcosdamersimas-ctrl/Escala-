/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Funcao } from '../types';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  FileText 
} from 'lucide-react';

export const CadastroFuncoes: React.FC = () => {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  
  // Controle Form/Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Campos do Form
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  // Carregar dados
  const carregarDados = () => {
    setFuncoes(db.funcoes.getAll());
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Abrir Criar
  const handleAbrirCriar = () => {
    setEditId(null);
    setNome('');
    setDescricao('');
    setIsFormOpen(true);
  };

  // Abrir Editar
  const handleAbrirEditar = (f: Funcao) => {
    setEditId(f.id);
    setNome(f.nome);
    setDescricao(f.descricao);
    setIsFormOpen(true);
  };

  // Deletar
  const handleDeletar = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta função? Militares escalados nesta função perderão a associação.')) {
      db.funcoes.delete(id);
      carregarDados();
    }
  };

  // Salvar
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      alert('Preencha o nome da função de serviço!');
      return;
    }

    const novaFuncao: Funcao = {
      id: editId || `f-${Date.now()}`,
      nome,
      descricao
    };

    db.funcoes.save(novaFuncao);
    carregarDados();
    setIsFormOpen(false);
  };

  return (
    <div id="cadastro-funcoes-page" className="p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Funções do Aprovisionamento</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Definição dos postos de trabalho e escalas de refeições diárias.</p>
          </div>
        </div>

        <button
          id="btn-add-funcao"
          onClick={handleAbrirCriar}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Criar Posto de Trabalho
        </button>
      </div>

      {/* Grid de Funções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {funcoes.map((f) => (
          <div 
            key={f.id} 
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                  Ativo no Setor
                </span>
                <div className="flex gap-1">
                  <button
                    id={`btn-edit-funcao-${f.id}`}
                    onClick={() => handleAbrirEditar(f)}
                    className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-delete-funcao-${f.id}`}
                    onClick={() => handleDeletar(f.id)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                {f.nome}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {f.descricao || 'Nenhuma descrição detalhada informada.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Mapeado em Escala_Registros.funcao_id
            </div>
          </div>
        ))}
      </div>

      {/* Form de Criação/Edição */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {editId ? 'Editar Posto de Serviço' : 'Novo Posto de Serviço'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="funcoes-form" onSubmit={handleSalvar} className="p-5 space-y-4 text-xs">
              
              {/* Nome da Função */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Nome do Posto *</label>
                <input
                  id="form-funcao-nome"
                  type="text"
                  required
                  placeholder="Ex: Supervisor de Aprovisionamento, Cozinheiro..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Atribuições e Descrição</label>
                <textarea
                  id="form-funcao-descricao"
                  rows={4}
                  placeholder="Descreva as responsabilidades deste posto de serviço..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Ações */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-funcao"
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg shadow-sm"
                >
                  Salvar Posto
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
