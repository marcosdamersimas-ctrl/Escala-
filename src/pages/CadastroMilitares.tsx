/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Militar, Funcao, PostoGraduacao, SituacaoMilitar } from '../types';
import { POSTOS_GRADUACOES } from '../utils/helpers';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  UserCheck, 
  UserMinus,
  AlertCircle 
} from 'lucide-react';

export const CadastroMilitares: React.FC = () => {
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  
  // Controle de Form/Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Campos do Form
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [postoGraduacao, setPostoGraduacao] = useState<PostoGraduacao>('Sd');
  const [situacaoAtual, setSituacaoAtual] = useState<SituacaoMilitar>('Apto');
  const [funcaoId, setFuncaoId] = useState('');
  const [antiguidade, setAntiguidade] = useState(10);
  const [telefone, setTelefone] = useState('');
  const [identidadeMilitar, setIdentidadeMilitar] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Carregar dados
  const carregarDados = () => {
    const listM = db.militares.getAll();
    const listF = db.funcoes.getAll();
    setMilitares(listM);
    setFuncoes(listF);
    if (listF.length > 0 && !funcaoId) {
      setFuncaoId(listF[0].id);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Abrir Form para Criar
  const handleAbrirCriar = () => {
    setEditId(null);
    setNomeCompleto('');
    setNomeGuerra('');
    setPostoGraduacao('Sd');
    setSituacaoAtual('Apto');
    if (funcoes.length > 0) setFuncaoId(funcoes[0].id);
    setAntiguidade(militares.length + 1);
    setTelefone('');
    setIdentidadeMilitar('');
    setAtivo(true);
    setIsFormOpen(true);
  };

  // Abrir Form para Editar
  const handleAbrirEditar = (m: Militar) => {
    setEditId(m.id);
    setNomeCompleto(m.nomeCompleto);
    setNomeGuerra(m.nomeGuerra);
    setPostoGraduacao(m.postoGraduacao);
    setSituacaoAtual(m.situacaoAtual);
    setFuncaoId(m.funcaoId);
    setAntiguidade(m.antiguidade);
    setTelefone(m.telefone || '');
    setIdentidadeMilitar(m.identidadeMilitar || '');
    setAtivo(m.ativo);
    setIsFormOpen(true);
  };

  // Deletar militar
  const handleDeletar = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este militar? Todos os registros de escala dele serão apagados.')) {
      db.militares.delete(id);
      carregarDados();
    }
  };

  // Salvar Militar
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !nomeGuerra || !funcaoId) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const novoMilitar: Militar = {
      id: editId || `m-${Date.now()}`,
      nomeCompleto,
      nomeGuerra,
      postoGraduacao,
      situacaoAtual,
      funcaoId,
      antiguidade: Number(antiguidade),
      ativo,
      telefone,
      identidadeMilitar
    };

    db.militares.save(novoMilitar);
    carregarDados();
    setIsFormOpen(false);
  };

  // Filtragem rápida
  const militaresFiltrados = militares.filter(m => 
    m.nomeCompleto.toLowerCase().includes(pesquisa.toLowerCase()) ||
    m.nomeGuerra.toLowerCase().includes(pesquisa.toLowerCase()) ||
    m.postoGraduacao.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div id="cadastro-militares-page" className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Efetivo do Setor</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gerenciamento de militares, postos, antiguidades e prontidão.</p>
          </div>
        </div>

        <button
          id="btn-add-militar"
          onClick={handleAbrirCriar}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Militar
        </button>
      </div>

      {/* Caixa de Busca */}
      <div className="flex items-center bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          id="militar-search"
          type="text"
          placeholder="Pesquisar militar por nome, posto..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="flex-1 text-xs bg-transparent border-0 text-slate-800 dark:text-slate-200 focus:outline-hidden"
        />
      </div>

      {/* Tabela de Militares */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table id="militares-table" className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <th className="p-4 text-center w-12">Antiguidade</th>
                <th className="p-4">Posto/Grad</th>
                <th className="p-4">Nome de Guerra</th>
                <th className="p-4">Nome Completo</th>
                <th className="p-4">Função Padrão</th>
                <th className="p-4 text-center">Situação Geral</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {militaresFiltrados.map((m) => {
                const func = funcoes.find(f => f.id === m.funcaoId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-center text-xs font-mono text-slate-400">{m.antiguidade}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{m.postoGraduacao}</td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white uppercase">{m.nomeGuerra}</td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{m.nomeCompleto}</td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                      {func ? func.nome : 'Sem função'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        m.situacaoAtual === 'Apto' 
                          ? 'bg-emerald-100/65 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : m.situacaoAtual === 'Férias'
                          ? 'bg-purple-100/65 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
                          : m.situacaoAtual === 'Licença'
                          ? 'bg-amber-100/65 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-blue-100/65 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                      }`}>
                        {m.situacaoAtual}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {m.ativo ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-600">
                          <UserMinus className="w-3.5 h-3.5" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          id={`btn-edit-miliar-${m.id}`}
                          onClick={() => handleAbrirEditar(m)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
                          title="Editar militar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-miliar-${m.id}`}
                          onClick={() => handleDeletar(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-md transition-all"
                          title="Excluir militar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {militaresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-600 font-mono text-xs">
                    Nenhum militar cadastrado para a pesquisa efetuada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal/Form de Cadastro / Edição */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Form */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editId ? 'Editar Registro de Militar' : 'Cadastrar Novo Militar'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo do Form */}
            <form id="militar-form" onSubmit={handleSalvar} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Posto e Graduação */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Posto / Graduação *</label>
                  <select
                    id="form-militar-posto"
                    value={postoGraduacao}
                    onChange={(e) => setPostoGraduacao(e.target.value as PostoGraduacao)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 font-semibold"
                  >
                    {POSTOS_GRADUACOES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Nome de Guerra */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Nome de Guerra *</label>
                  <input
                    id="form-militar-nomeguerra"
                    type="text"
                    required
                    placeholder="Ex: SILVA"
                    value={nomeGuerra}
                    onChange={(e) => setNomeGuerra(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 uppercase font-extrabold"
                  />
                </div>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Nome Completo *</label>
                <input
                  id="form-militar-nomecompleto"
                  type="text"
                  required
                  placeholder="Nome completo do militar"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Função Padrão */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Função Principal *</label>
                  <select
                    id="form-militar-funcao"
                    value={funcaoId}
                    onChange={(e) => setFuncaoId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  >
                    {funcoes.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Situação Cadastral Inicial */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Situação de Pronto *</label>
                  <select
                    id="form-militar-situacao"
                    value={situacaoAtual}
                    onChange={(e) => setSituacaoAtual(e.target.value as SituacaoMilitar)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Apto">Apto (Pronto)</option>
                    <option value="Curso">Em Curso</option>
                    <option value="Licença">Em Licença</option>
                    <option value="Férias">Em Férias</option>
                    <option value="Dispensa">Dispensa Médica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Antiguidade */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Antiguidade (Ordenação)</label>
                  <input
                    id="form-militar-antiguidade"
                    type="number"
                    value={antiguidade}
                    onChange={(e) => setAntiguidade(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Identidade Militar */}
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Identidade Militar</label>
                  <input
                    id="form-militar-identidade"
                    type="text"
                    placeholder="Registro militar / ID"
                    value={identidadeMilitar}
                    onChange={(e) => setIdentidadeMilitar(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Telefone / Contato</label>
                <input
                  id="form-militar-telefone"
                  type="text"
                  placeholder="(00) 90000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Ativo Checkbox */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 mt-2">
                <input
                  id="form-militar-ativo"
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-opacity-25 accent-emerald-600"
                />
                <div>
                  <label htmlFor="form-militar-ativo" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Militar Ativo no Setor</label>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500">Militares inativos não aparecem na matriz de escala de serviço ativa.</p>
                </div>
              </div>

              {/* Ações do Form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950/20 p-5 -mx-5 -mb-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-militar"
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg shadow-sm"
                >
                  Salvar Militar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
