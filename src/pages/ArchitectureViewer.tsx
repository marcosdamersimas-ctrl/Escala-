/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SQL_SCHEMA } from '../database/schema';
import { 
  GitBranch, 
  Layers, 
  Database, 
  Cpu, 
  FileCode, 
  CheckSquare, 
  Lightbulb, 
  ListOrdered
} from 'lucide-react';

interface ArchitectureViewerProps {
  subTab: 'diagram' | 'db' | 'plan';
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({ subTab }) => {
  return (
    <div id="architecture-viewer-container" className="p-8 max-w-5xl mx-auto space-y-8 text-slate-800 dark:text-slate-200">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          Proposta Arquitetural
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Arquitetura e Planejamento Técnico do ESCALA+
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Design de software desacoplado de alto desempenho para o gerenciamento inteligente das escalas do Aprovisionamento Militar.
        </p>
      </div>

      {subTab === 'diagram' && (
        <div className="space-y-6">
          {/* Architecture Concept */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Camada de UI Decotada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                As telas interativas em React 19 utilizam estados controlados reativos. Elas dependem exclusivamente de um contrato abstrato de serviço de dados, sem acoplamento a drivers específicos.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">2. Provedor de Dados (Abstract DB)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Neste protótipo de aprovação, implementamos o barramento <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 text-red-500 rounded text-xs">localStorage</code>. Toda a interface está pronta para migrar para Supabase ou SQLite sem alterar nenhuma linha de UI.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">3. Motor de Validação & IA</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Regras automáticas militares (folga mínima, impedimentos de saúde e curso) rodam em tempo real para evitar erros humanos na escala. Prontos para integração com o Gemini SDK.
              </p>
            </div>
          </div>

          {/* Folder Structure */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Estrutura de Pastas Implementada
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto shadow-inner">
                <p className="text-slate-500"># Árvore do projeto reestruturada</p>
                <p>📂 src/</p>
                <p> ┣ 📂 components/ <span className="text-slate-500">// Componentes modulares</span></p>
                <p> ┃ ┣ 📜 Sidebar.tsx</p>
                <p> ┃ ┗ 📜 ScaleCell.tsx</p>
                <p> ┣ 📂 database/ <span className="text-slate-500">// Schema SQL planejado</span></p>
                <p> ┃ ┗ 📜 schema.ts</p>
                <p> ┣ 📂 pages/ <span className="text-slate-500">// Telas do sistema (Protótipo & Planta)</span></p>
                <p> ┃ ┣ 📜 Dashboard.tsx</p>
                <p> ┃ ┣ 📜 EscalaMensal.tsx</p>
                <p> ┃ ┣ 📜 CadastroMilitares.tsx</p>
                <p> ┃ ┣ 📜 CadastroFuncoes.tsx</p>
                <p> ┃ ┣ 📜 GeradorAditamento.tsx</p>
                <p> ┃ ┣ 📜 Configuracoes.tsx</p>
                <p> ┃ ┗ 📜 ArchitectureViewer.tsx</p>
                <p> ┣ 📂 services/ <span className="text-slate-500">// Abstração de Banco de Dados</span></p>
                <p> ┃ ┗ 📜 db.ts</p>
                <p> ┣ 📂 utils/ <span className="text-slate-500">// Utilitários e regras militares</span></p>
                <p> ┃ ┗ 📜 helpers.ts</p>
                <p> ┣ 📜 App.tsx <span className="text-slate-500">// Ponto de entrada / Controlador principal</span></p>
                <p> ┣ 📜 types.ts <span className="text-slate-500">// Tipagem estática robusta</span></p>
                <p> ┗ 📜 index.css <span className="text-slate-500">// Estilo global Tailwind v4</span></p>
              </div>

              <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed font-sans text-sm">
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Por que essa estrutura?</strong><br />
                  Evita o acúmulo de lógica pesada em um único arquivo, prevenindo estouros de token no desenvolvimento e promovendo modularidade impecável.
                </p>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Separação de Responsabilidades:</strong><br />
                  Se amanhã você optar pelo Supabase, você apenas precisará substituir as funções internas do arquivo <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-red-600 dark:text-red-400">src/services/db.ts</code>. Nenhuma tela do sistema precisará ser reescrita!
                </p>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Regras de Negócio Isoladas:</strong><br />
                  O cálculo de descanso regulamentar, busca hierárquica e agrupamentos de aditamento estão isolados em <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-red-600 dark:text-red-400">src/utils/helpers.ts</code> para fácil cobertura de testes e manutenção futura.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'db' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Esquema de Banco de Dados Planejado (DDL)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Este script SQL DDL representa exatamente o modelo relacional mapeado na lógica do sistema. Ele está pronto para ser executado no PostgreSQL (Supabase) ou convertido para SQLite.
            </p>

            <div className="bg-slate-950 text-emerald-400 p-5 rounded-lg font-mono text-xs overflow-x-auto max-h-96 shadow-inner border border-slate-800">
              <pre>{SQL_SCHEMA.trim()}</pre>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/10">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Garantia de Integridade de Dados
            </h4>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Chaves Estrangeiras:</strong> Impede que um registro de escala aponte para um militar inexistente (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">ON DELETE CASCADE</code>).</li>
              <li><strong>Índices de Performance:</strong> <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">idx_escala_militar_data</code> garante buscas instantâneas na matriz mensal mesmo com milhares de registros.</li>
              <li><strong>Restrição de Unicidade:</strong> <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">UNIQUE (militar_id, data)</code> evita que o mesmo militar receba duas escalas no mesmo dia.</li>
            </ul>
          </div>
        </div>
      )}

      {subTab === 'plan' && (
        <div className="space-y-6">
          {/* AI Roadmap */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Integração de Inteligência Artificial (Objetivo Futuro)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              O sistema foi estruturado para receber o módulo de IA de forma totalmente nativa através do SDK oficial da Google (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 text-red-500 rounded text-xs">@google/genai</code>).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Alimentação de Contexto (Prompt Engineering)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      A IA receberá a lista de militares disponíveis, suas restrições (cursos, licenças, afastamentos) e o histórico recente de dias trabalhados de cada um.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Geração Sugerida (Gemini Flash/Pro)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Utilizando chamadas de função estruturadas (Structured Outputs), o modelo retornará um JSON contendo a matriz de escala sugerida perfeitamente equilibrada e sem conflitos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Substituições Inteligentes</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Caso um militar adoeça ou precise de dispensa urgente, a IA analisará em segundos quem é o substituto ideal com menor contagem de serviço e maior folga regulamentar acumulada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Exemplo de Prompt Contextual de IA
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                    "Dado o histórico de escalas do Aprovisionamento Militar e a restrição de folga mínima de 48 horas, sugira a escala para o próximo final de semana. Priorize os militares com menor acúmulo de escalas de serviço e verifique se há cursos ativos que impeçam a escalação."
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Estrutura preparada para integração da IA!
                </div>
              </div>
            </div>
          </div>

          {/* Development Checklist */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Cronograma de Desenvolvimento Proposto
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30">
                <input type="checkbox" checked readOnly className="mt-1 accent-emerald-600 rounded" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">Fase 1: Proposta Arquitetural & Layouts Interativos (ATUAL)</h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1">
                    Apresentação completa das tecnologias, estruturas, simulação de dados e wireframes funcionais navegáveis para validação de experiência pelo cliente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                <input type="checkbox" disabled className="mt-1 rounded" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-300">Fase 2: Consolidação dos Cadastros & CRUD no LocalStorage</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ativação da manipulação real de Militares e Funções, permitindo adicionar, atualizar e remover dados com persistência contínua na máquina local.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                <input type="checkbox" disabled className="mt-1 rounded" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-300">Fase 3: Motor de Regras Ativo de Escala Mensal</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Bloqueio ativo de indisponibilidades na escala (Férias, Licenças) e avisos inteligentes instantâneos na interface no momento em que um militar for escalado sem descanso adequado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                <input type="checkbox" disabled className="mt-1 rounded" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-300">Fase 4: Motor de Geração do Aditamento Militar e Exportação em PDF</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Geração do documento formal idêntico ao modelo oficial, com layouts otimizados para impressão limpa diretamente pelo navegador e exportação em formato PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                <input type="checkbox" disabled className="mt-1 rounded" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-300">Fase 5: Conectores Remotos de Banco de Dados (SQLite/Supabase) & IA</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ativação opcional de conectores de nuvem e inteligência artificial para o autopreenchimento de escalas equilibradas do Aprovisionamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
