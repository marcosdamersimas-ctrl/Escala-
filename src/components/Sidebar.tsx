/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  Database,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  systemMode: 'prototype' | 'architecture';
  setSystemMode: (mode: 'prototype' | 'architecture') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  userRole?: 'admin' | 'guest';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  systemMode,
  setSystemMode,
  isDarkMode,
  setIsDarkMode,
  userRole = 'admin'
}) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'escala', label: 'Escala Mensal', icon: CalendarDays },
    { id: 'militares', label: 'Militares', icon: Users },
    { id: 'funcoes', label: 'Funções de Serviço', icon: Briefcase },
    { id: 'aditamento', label: 'Gerador de Aditamento', icon: FileText },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Se for convidado, esconde abas de cadastro/gerência administrativa
  const menuItems = userRole === 'guest' 
    ? allMenuItems.filter(item => ['dashboard', 'escala', 'aditamento'].includes(item.id))
    : allMenuItems;

  return (
    <div id="sidebar-container" className="w-64 h-screen flex flex-col justify-between select-none bg-slate-900 border-r border-slate-800 text-slate-300 transition-colors duration-200">
      
      {/* Top Brand */}
      <div className="p-6 border-b border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-black text-lg tracking-tighter shadow-sm">
            E+
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none text-white">ESCALA+</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Aprovação OM</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Banner */}
      <div className="p-4 mx-3 my-2 rounded-xl bg-slate-950/45 border border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          Nível de Visualização
        </div>
        <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-lg text-[11px] border border-slate-800">
          <button 
            id="mode-btn-proto"
            onClick={() => setSystemMode('prototype')}
            className={`py-1.5 px-1.5 rounded-md font-bold transition-all ${
              systemMode === 'prototype' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Protótipo
          </button>
          <button 
            id="mode-btn-arch"
            onClick={() => setSystemMode('architecture')}
            className={`py-1.5 px-1.5 rounded-md font-bold transition-all ${
              systemMode === 'architecture' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Arquitetura
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 tracking-wider px-3 uppercase mb-2">
          {systemMode === 'prototype' ? 'Módulos do Sistema' : 'Análise & Planta'}
        </p>

        {systemMode === 'prototype' ? (
          menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`sidebar-item-${item.id}`}
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 opacity-80'}`} />
                {item.label}
              </button>
            );
          })
        ) : (
          <div className="space-y-1">
            <button
              id="sidebar-item-arch-diagram"
              onClick={() => setCurrentTab('arch-diagram')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'arch-diagram' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-slate-400" />
              Arquitetura de Software
            </button>
            <button
              id="sidebar-item-arch-db"
              onClick={() => setCurrentTab('arch-db')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'arch-db' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 text-slate-400" />
              Esquema Relacional (SQL)
            </button>
            <button
              id="sidebar-item-arch-plan"
              onClick={() => setCurrentTab('arch-plan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'arch-plan' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Cronograma & IA
            </button>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-mono text-[11px]">Modo Escuro</span>
          <button
            id="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-5 rounded-full bg-slate-800 relative transition-colors duration-200 focus:outline-hidden border border-slate-700"
          >
            <span className={`absolute top-0.5 left-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full transition-transform duration-200 shadow-xs ${isDarkMode ? 'translate-x-5 bg-emerald-400' : ''}`} />
          </button>
        </div>
        <div className="mt-4 text-slate-600 text-center text-[10px] font-semibold tracking-wide uppercase">
          v1.0.0 • PROTÓTIPO PREMIUM
        </div>
      </div>
    </div>
  );
};
