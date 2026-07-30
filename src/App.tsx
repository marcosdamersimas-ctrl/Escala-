/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Login } from './pages/Login';
import { db } from './services/db';
import { Militar, EscalaRegistro, Funcao, PostoGraduacao, SituacaoMilitar, DestinoLancamento } from './types';
import { Configuracoes } from './pages/Configuracoes';
import { 
  UserPlus, 
  Calendar as CalendarIcon, 
  MapPin, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  PenTool, 
  Eye, 
  LogOut,
  Sliders,
  Users,
  Briefcase,
  Shield,
  ChefHat,
  Utensils,
  Coffee,
  ZoomIn,
  ZoomOut,
  Zap,
  FileSpreadsheet,
  ArrowLeft,
  Edit3,
  ShieldCheck,
  Database,
  Save,
  FolderOpen,
  Cloud,
  Award,
  Home,
  Building2,
  ChevronDown
} from 'lucide-react';
import { 
  saveAditamentoToFirestore, 
  getAditamentosByMonthFromFirestore, 
  deleteAditamentoFromFirestore, 
  subscribeToAditamentos,
  subscribeToEscalaRegistros,
  subscribeToMilitares,
  saveEscalaRegistrosToFirestore,
  saveMilitaresToFirestore,
  AditamentoRecord 
} from './services/firebase';

// Mapeamento das 5 escalas do Aprovisionamento para as funções do banco de dados
const SCALES_CONFIG = [
  { id: 'perm', title: 'Permanência', functionId: 'f-1', color: 'from-amber-500/10 to-amber-600/20', borderColor: 'border-amber-500/30 hover:border-amber-500/80', textGradient: 'from-[#FFF2BF] to-[#E5BA5D]' },
  { id: 'coz', title: 'Cozinheiro', functionId: 'f-2', color: 'from-emerald-500/10 to-emerald-600/20', borderColor: 'border-emerald-500/30 hover:border-emerald-500/80', textGradient: 'from-[#D2FFD2] to-emerald-400' },
  { id: 'aux', title: 'Auxiliar de Cozinheiro', functionId: 'f-3', color: 'from-blue-500/10 to-blue-600/20', borderColor: 'border-blue-500/30 hover:border-blue-500/80', textGradient: 'from-[#D2F2FF] to-blue-400' },
  { id: 'cass', title: 'Cassineiro', functionId: 'f-6', color: 'from-purple-500/10 to-purple-600/20', borderColor: 'border-purple-500/30 hover:border-purple-500/80', textGradient: 'from-[#EAD2FF] to-purple-400' },
  { id: 'pad', title: 'Padeiro', functionId: 'f-7', color: 'from-orange-500/10 to-orange-600/20', borderColor: 'border-orange-500/30 hover:border-orange-500/80', textGradient: 'from-[#FFE8CD] to-orange-400' },
];

const getScaleIcon = (scaleId: string) => {
  switch (scaleId) {
    case 'perm':
      return Shield;
    case 'coz':
      return ChefHat;
    case 'aux':
      return Utensils;
    case 'cass':
      return Coffee;
    case 'pad':
      return ChefHat;
    default:
      return Coffee;
  }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guest' | 'aprovisionadora'>('admin');
  const [currentTab, setCurrentTab] = useState<'hub' | 'inserir' | 'escala' | 'destinos' | 'aditamento' | 'configuracoes'>('hub');
  
  // Data selecionada no Calendário (Padrão: 20 de Julho de 2026 para corresponder aos dados semeados)
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-20');
  
  // Lista de dados do banco local
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [registros, setRegistros] = useState<EscalaRegistro[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);

  // Escala ativa para exibição no estilo Power BI (se null, exibe os 4 blocos)
  const [activePowerBIScale, setActivePowerBIScale] = useState<string | null>(null);

  // Estado de controle de assinatura digital no Aditamento
  const [isSigned, setIsSigned] = useState(false);

  // Aditamentos sincronizados do Firestore em tempo real
  const [firestoreAditamentos, setFirestoreAditamentos] = useState<AditamentoRecord[]>([]);

  // Carregar dados iniciais e re-sincronizar
  const refreshData = () => {
    setMilitares(db.militares.getAll());
    setRegistros(db.escala.getAll());
    setFuncoes(db.funcoes.getAll());
  };

  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  // Escuta em tempo real no Firestore (sincroniza Aditamentos, Escalas e Militares entre computadores)
  useEffect(() => {
    const unsubAdit = subscribeToAditamentos((adits) => {
      setFirestoreAditamentos(adits);
    });
    const unsubRegs = subscribeToEscalaRegistros((remoteRegs) => {
      if (remoteRegs && remoteRegs.length > 0) {
        db.escala.bulkSave(remoteRegs);
        setRegistros(db.escala.getAll());
      }
    });
    const unsubMils = subscribeToMilitares((remoteMils) => {
      if (remoteMils && remoteMils.length > 0) {
        remoteMils.forEach(m => db.militares.save(m));
        setMilitares(db.militares.getAll());
      }
    });

    return () => {
      unsubAdit();
      unsubRegs();
      unsubMils();
    };
  }, []);

  // Saudação dinâmica por horário e usuário
  const getGreetingText = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Bom dia';
    if (hour >= 12 && hour < 18) {
      timeGreeting = 'Boa tarde';
    } else if (hour >= 18 || hour < 5) {
      timeGreeting = 'Boa noite';
    }

    let userTitle = '1º Sgt Simas';
    if (userRole === 'aprovisionadora') {
      userTitle = 'Asp Of Strieder';
    } else if (userRole === 'guest') {
      userTitle = 'Visitante';
    }

    return `${timeGreeting}, ${userTitle}.`;
  };

  // Formatar data atual do dispositivo em português
  const getFormattedDeviceDate = () => {
    const d = new Date();
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const day = d.getDate();
    const monthName = d.toLocaleDateString('pt-BR', { month: 'long' });
    const year = d.getFullYear();
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${day} de ${monthName} de ${year}`;
  };

  // Formatar data em português sem mensagens adicionais
  const getFormattedHeaderDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const monthName = d.toLocaleDateString('pt-BR', { month: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${day} de ${monthName} de ${year}`;
  };

  // Alterar dia (anterior / seguinte)
  const handleOffsetDay = (offset: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + offset);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={(role) => {
          setIsLoggedIn(true);
          setUserRole(role);
          setCurrentTab('hub');
        }} 
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#121f15] text-zinc-100 flex flex-col overflow-x-hidden font-sans select-none">
      
      {/* BACKGROUND GRAPHITE ACCENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <svg className="w-full h-full opacity-5" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="100" y1="0" x2="100" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" />
          <line x1="500" y1="0" x2="500" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" />
          <line x1="900" y1="0" x2="900" y2="1000" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,10" />
          <circle cx="500" cy="500" r="300" stroke="#E5BA5D" strokeWidth="0.5" strokeDasharray="5,5" />
        </svg>
      </div>

      {/* TOP NAVBAR HEADER */}
      <header className="relative z-10 shrink-0 h-16 border-b border-[#1e3423] bg-[#0c160e]/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCurrentTab('hub');
              setActivePowerBIScale(null);
            }}
            className="text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2BF] to-[#E5BA5D] uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
          >
            Escala Inteligente
          </button>
          {userRole === 'aprovisionadora' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase rounded-full shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Asp Of Strieder — Aprovisionadora
            </span>
          )}
          {userRole === 'admin' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase rounded-full shadow">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Painel Gestor (Admin)
            </span>
          )}
          {userRole === 'guest' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-black uppercase rounded-full shadow">
              <Eye className="w-3.5 h-3.5 text-zinc-400" /> Modo Visitante
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Sair do sistema / Trocar perfil"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 pb-32 flex flex-col items-center">
        
        <div className="w-full max-w-6xl">
          
          {/* TELA INICIAL (HUB) */}
          {currentTab === 'hub' && (
            <div className="w-full space-y-8 animate-in fade-in duration-300">
              
              {/* SAUDAÇÃO & DATA DINÂMICA */}
              <div className="space-y-1.5 text-left border-b border-[#1e3423]/60 pb-6">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {getGreetingText()}
                </h1>
                <p className="text-sm font-semibold text-[#E5BA5D] tracking-wide">
                  {getFormattedDeviceDate()}
                </p>
              </div>

              {/* CARTÕES GRANDES DOS MÓDULOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. ESCALAS */}
                <button
                  onClick={() => {
                    setCurrentTab('escala');
                    setActivePowerBIScale(null);
                  }}
                  className="group relative overflow-hidden bg-[#0a130c] hover:bg-[#101d13] border border-[#1e3423] hover:border-[#E5BA5D]/60 rounded-3xl p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1.5 min-h-[200px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-3.5 bg-[#142318] border border-[#243f2a] text-[#E5BA5D] rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <CalendarIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Módulo
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#FFF2BF] tracking-wide uppercase transition-colors">
                      ESCALAS
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      Controle e distribuição de escalas de serviço e acompanhamento mensal.
                    </p>
                  </div>
                </button>

                {/* 2. ADITAMENTOS */}
                <button
                  onClick={() => {
                    setCurrentTab('aditamento');
                    setActivePowerBIScale(null);
                  }}
                  className="group relative overflow-hidden bg-[#0a130c] hover:bg-[#101d13] border border-[#1e3423] hover:border-[#E5BA5D]/60 rounded-3xl p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1.5 min-h-[200px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-3.5 bg-[#142318] border border-[#243f2a] text-[#E5BA5D] rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <FileText className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E5BA5D]/90 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                      Boletins
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#FFF2BF] tracking-wide uppercase transition-colors">
                      ADITAMENTOS
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      Boletins oficiais, escalas preta e vermelha, assinatura e PDF.
                    </p>
                  </div>
                </button>

                {/* 3. MILITARES */}
                <button
                  onClick={() => {
                    setCurrentTab('inserir');
                    setActivePowerBIScale(null);
                  }}
                  className="group relative overflow-hidden bg-[#0a130c] hover:bg-[#101d13] border border-[#1e3423] hover:border-[#E5BA5D]/60 rounded-3xl p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1.5 min-h-[200px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-3.5 bg-[#142318] border border-[#243f2a] text-[#E5BA5D] rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Users className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full">
                      Efetivo
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#FFF2BF] tracking-wide uppercase transition-colors">
                      MILITARES
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      Cadastro do efetivo da OM, mapa da força e antiguidade.
                    </p>
                  </div>
                </button>

                {/* 4. DESTINOS */}
                <button
                  onClick={() => {
                    setCurrentTab('destinos');
                    setActivePowerBIScale(null);
                  }}
                  className="group relative overflow-hidden bg-[#0a130c] hover:bg-[#101d13] border border-[#1e3423] hover:border-[#E5BA5D]/60 rounded-3xl p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1.5 min-h-[200px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-3.5 bg-[#142318] border border-[#243f2a] text-[#E5BA5D] rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400/90 bg-red-950/60 border border-red-500/30 px-3 py-1 rounded-full">
                      Afastamentos
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#FFF2BF] tracking-wide uppercase transition-colors">
                      DESTINOS
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      Lançamento de dispensas médicas, missões, férias e licenças.
                    </p>
                  </div>
                </button>

                {/* 5. CONFIGURAÇÕES */}
                <button
                  onClick={() => {
                    setCurrentTab('configuracoes');
                    setActivePowerBIScale(null);
                  }}
                  className="group relative overflow-hidden bg-[#0a130c] hover:bg-[#101d13] border border-[#1e3423] hover:border-[#E5BA5D]/60 rounded-3xl p-7 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1.5 min-h-[200px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-3.5 bg-[#142318] border border-[#243f2a] text-[#E5BA5D] rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Sliders className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/90 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full">
                      Sistema
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-[#FFF2BF] tracking-wide uppercase transition-colors">
                      CONFIGURAÇÕES
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                      Gerenciamento de dados locais, backups e parâmetros do sistema.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {currentTab === 'inserir' && (
            <InserirMilitarView 
              selectedDate={selectedDate} 
              militares={militares} 
              registros={registros}
              funcoes={funcoes}
              userRole={userRole === 'aprovisionadora' ? 'guest' : userRole}
              onUpdate={refreshData} 
            />
          )}
          
          {currentTab === 'escala' && (
            <EscalaView 
              selectedDate={selectedDate} 
              militares={militares} 
              registros={registros} 
              activePowerBIScale={activePowerBIScale}
              setActivePowerBIScale={setActivePowerBIScale}
              userRole={userRole === 'aprovisionadora' ? 'guest' : userRole}
              onUpdate={refreshData}
            />
          )}
          
          {currentTab === 'destinos' && (
            <DestinosView 
              selectedDate={selectedDate} 
              militares={militares} 
              registros={registros} 
              userRole={userRole === 'aprovisionadora' ? 'guest' : userRole}
              onUpdate={refreshData}
            />
          )}
          
          {currentTab === 'aditamento' && (
            <AditamentoView 
              selectedDate={selectedDate} 
              militares={militares} 
              registros={registros} 
              isSigned={isSigned}
              setIsSigned={setIsSigned}
              userRole={userRole}
              firestoreAditamentos={firestoreAditamentos}
            />
          )}

          {currentTab === 'configuracoes' && (
            <Configuracoes />
          )}

        </div>
      </main>

      {/* MENU INFERIOR FLUTUANTE (FLOATING BOTTOM NAV BAR) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 print:hidden">
        <nav className="bg-[#0b120c]/90 backdrop-blur-2xl border border-[#E5BA5D]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-full px-3 py-2 flex items-center justify-around">
          
          {/* INÍCIO (HUB) */}
          <button
            onClick={() => {
              setCurrentTab('hub');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'hub' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'hub' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Início</span>
          </button>

          {/* INSERIR */}
          <button
            onClick={() => {
              setCurrentTab('inserir');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'inserir' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'inserir' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <UserPlus className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Inserir</span>
          </button>

          {/* ESCALAS */}
          <button
            onClick={() => {
              setCurrentTab('escala');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'escala' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'escala' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Escalas</span>
          </button>

          {/* DESTINOS */}
          <button
            onClick={() => {
              setCurrentTab('destinos');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'destinos' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'destinos' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Destinos</span>
          </button>

          {/* ADITAMENTO */}
          <button
            onClick={() => {
              setCurrentTab('aditamento');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'aditamento' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'aditamento' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Aditamento</span>
          </button>

          {/* CONFIGURAÇÕES */}
          <button
            onClick={() => {
              setCurrentTab('configuracoes');
              setActivePowerBIScale(null);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all duration-300 relative group cursor-pointer ${
              currentTab === 'configuracoes' 
                ? 'text-[#E5BA5D] scale-105' 
                : 'text-zinc-400 opacity-60 hover:opacity-100'
            }`}
          >
            {currentTab === 'configuracoes' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E5BA5D] rounded-full shadow-[0_0_8px_#E5BA5D]" />
            )}
            <Sliders className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Config</span>
          </button>

        </nav>
      </div>

    </div>
  );
}

// ==========================================
// 1. INSERIR MILITAR VIEW component
// ==========================================
interface SubViewProps {
  selectedDate: string;
  militares: Militar[];
  registros: EscalaRegistro[];
  funcoes?: Funcao[];
  userRole: 'admin' | 'guest';
  onUpdate: () => void;
}

const InserirMilitarView: React.FC<SubViewProps> = ({ 
  selectedDate, 
  militares, 
  registros, 
  funcoes = [], 
  userRole, 
  onUpdate 
}) => {
  // Navigation state inside "INSERIR": 'menu' | 'cadastrar' | 'mapa'
  const [subView, setSubView] = useState<'menu' | 'cadastrar' | 'mapa'>('menu');

  // Form states for creating/editing military member
  const [editingMilitarId, setEditingMilitarId] = useState<string | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [postoGraduacao, setPostoGraduacao] = useState<PostoGraduacao>('Sd');
  const [antiguidade, setAntiguidade] = useState<number>(militares.length + 1);
  const [selectedFuncaoId, setSelectedFuncaoId] = useState<string>('f-3');

  // Form state for creating new function
  const [isAddingFunction, setIsAddingFunction] = useState(false);
  const [newFunctionName, setNewFunctionName] = useState('');
  const [newFunctionDesc, setNewFunctionDesc] = useState('');

  // Search filter for military list / mapa da força
  const [searchTerm, setSearchTerm] = useState('');

  // Get available functions list from db if prop is empty
  const availableFuncoes = funcoes.length > 0 ? funcoes : db.funcoes.getAll();

  // Reset/Clear form
  const resetMilitarForm = () => {
    setEditingMilitarId(null);
    setNomeCompleto('');
    setNomeGuerra('');
    setPostoGraduacao('Sd');
    setAntiguidade(militares.length + 1);
    setSelectedFuncaoId(availableFuncoes[0]?.id || 'f-3');
  };

  // Populate form for editing
  const handleStartEdit = (m: Militar) => {
    setEditingMilitarId(m.id);
    setNomeCompleto(m.nomeCompleto);
    setNomeGuerra(m.nomeGuerra);
    setPostoGraduacao(m.postoGraduacao);
    setAntiguidade(m.antiguidade);
    setSelectedFuncaoId(m.funcaoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save/Update Militar
  const handleSaveMilitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem alterar cadastros.');
      return;
    }

    if (!nomeGuerra.trim()) {
      alert('Preencha o Nome de Guerra.');
      return;
    }

    const militaryData: Militar = {
      id: editingMilitarId || `m-${Date.now()}`,
      nomeCompleto: `${postoGraduacao} ${nomeGuerra.trim().toUpperCase()}`,
      nomeGuerra: nomeGuerra.trim().toUpperCase(),
      postoGraduacao: postoGraduacao,
      situacaoAtual: 'Apto',
      funcaoId: selectedFuncaoId,
      antiguidade: Number(antiguidade) || 1,
      ativo: true
    };

    db.militares.save(militaryData);
    onUpdate();
    alert(editingMilitarId ? 'Militar atualizado com sucesso!' : 'Militar cadastrado com sucesso!');
    resetMilitarForm();
  };

  // Delete Militar
  const handleDeleteMilitar = (id: string, name: string) => {
    if (userRole === 'guest') return;
    db.militares.delete(id);
    onUpdate();
    if (editingMilitarId === id) {
      resetMilitarForm();
    }
  };

  // Change Militar's scale/function directly ("trocar o camarada de escala")
  const handleChangeMilitarFuncao = (militarId: string, newFuncaoId: string) => {
    if (userRole === 'guest') return;
    const target = militares.find(m => m.id === militarId);
    if (!target) return;
    const updated: Militar = { ...target, funcaoId: newFuncaoId };
    db.militares.save(updated);
    onUpdate();
  };

  // Create new scale function ("cadastrar a função do militar")
  const handleSaveNewFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunctionName.trim()) {
      alert('Preencha o nome da função.');
      return;
    }
    const newFunc: Funcao = {
      id: `f-${Date.now()}`,
      nome: newFunctionName.trim(),
      descricao: newFunctionDesc.trim() || 'Função de serviço cadastrada no sistema.'
    };
    db.funcoes.save(newFunc);
    onUpdate();
    setSelectedFuncaoId(newFunc.id);
    setNewFunctionName('');
    setNewFunctionDesc('');
    setIsAddingFunction(false);
    alert(`Função "${newFunc.nome}" cadastrada com sucesso!`);
  };

  // Filtered military list
  const filteredMilitares = militares.filter(m => {
    const query = searchTerm.toLowerCase();
    const funcName = availableFuncoes.find(f => f.id === m.funcaoId)?.nome.toLowerCase() || '';
    return (
      m.nomeGuerra.toLowerCase().includes(query) ||
      m.nomeCompleto.toLowerCase().includes(query) ||
      m.postoGraduacao.toLowerCase().includes(query) ||
      funcName.includes(query)
    );
  });

  // ==========================================
  // MENU PRESENTATION (Same style as EscalaView)
  // ==========================================
  if (subView === 'menu') {
    return (
      <div className="flex flex-col justify-center items-center py-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl px-2">
          
          {/* OPTION 1: CADASTRAR MILITAR */}
          <button
            onClick={() => setSubView('cadastrar')}
            className="group relative overflow-hidden bg-[#070b08]/80 hover:bg-[#070b08]/95 border border-[#E5BA5D]/15 hover:border-[#E5BA5D]/40 rounded-[20px] shadow-[0_12px_30px_rgba(0,0,0,0.6)] p-6 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full gap-2.5"
          >
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#E5BA5D]/10 to-transparent group-hover:via-[#E5BA5D]/40 transition-all duration-300" />
            <UserPlus className="w-8 h-8 text-[#E5BA5D] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm sm:text-base md:text-lg font-black text-[#FFF2BF] uppercase tracking-widest transition-all duration-300 group-hover:scale-105">
              CADASTRAR MILITAR
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Inserir na escala, trocar função, definir antiguidade
            </span>
          </button>

          {/* OPTION 2: MAPA DA FORÇA */}
          <button
            onClick={() => setSubView('mapa')}
            className="group relative overflow-hidden bg-[#070b08]/80 hover:bg-[#070b08]/95 border border-[#E5BA5D]/15 hover:border-[#E5BA5D]/40 rounded-[20px] shadow-[0_12px_30px_rgba(0,0,0,0.6)] p-6 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full gap-2.5"
          >
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#E5BA5D]/10 to-transparent group-hover:via-[#E5BA5D]/40 transition-all duration-300" />
            <FileSpreadsheet className="w-8 h-8 text-[#E5BA5D] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm sm:text-base md:text-lg font-black text-[#FFF2BF] uppercase tracking-widest transition-all duration-300 group-hover:scale-105">
              MAPA DA FORÇA
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Planilha de visualização do efetivo cadastrado
            </span>
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAPA DA FORÇA (SOMENTE VISUALIZAÇÃO)
  // ==========================================
  if (subView === 'mapa') {
    return (
      <div className="space-y-6 w-full">
        {/* CABEÇALHO EXCLUSIVO PARA IMPRESSÃO DO MAPA */}
        <div className="hidden print:block mb-4 border-b-2 border-black pb-2 text-center font-serif uppercase">
          <p className="font-bold text-xs">Ministério da Defesa • Exército Brasileiro</p>
          <p className="font-extrabold text-sm">Setor de Aprovisionamento - OM Região 1</p>
          <p className="font-black text-base pt-2">Mapa da Força do Efetivo Cadastrado</p>
          <p className="text-[10px] text-slate-600 pt-1">Documento Impresso para Contagem e Conferência do Efetivo</p>
        </div>

        {/* HEADER & VOLTAR BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5BA5D]/20 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView('menu')}
              className="px-3.5 py-1.5 rounded-lg border border-[#E5BA5D]/30 bg-[#070b08] hover:bg-[#E5BA5D]/20 text-[#FFF2BF] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div>
              <h2 className="text-lg font-black text-[#FFF2BF] flex items-center gap-2 uppercase tracking-wider">
                <FileSpreadsheet className="w-5 h-5 text-[#E5BA5D]" />
                Mapa da Força do Efetivo
              </h2>
              <p className="text-[11px] text-slate-400">
                Planilha de consulta e visualização oficial de todos os militares cadastrados no sistema.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Printer className="w-4 h-4" />
            Imprimir Mapa da Força
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="bg-[#070b08]/80 border border-[#E5BA5D]/20 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total do Efetivo</span>
              <span className="text-2xl font-black text-[#FFF2BF]">{militares.length}</span>
            </div>
            <Users className="w-8 h-8 text-[#E5BA5D]/40" />
          </div>

          <div className="bg-[#070b08]/80 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Efetivo Apto</span>
              <span className="text-2xl font-black text-emerald-400">
                {militares.filter(m => m.situacaoAtual === 'Apto').length}
              </span>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
          </div>

          <div className="bg-[#070b08]/80 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Funções Cadastradas</span>
              <span className="text-2xl font-black text-amber-400">{availableFuncoes.length}</span>
            </div>
            <Briefcase className="w-8 h-8 text-amber-500/40" />
          </div>
        </div>

        {/* SEARCH FILTER */}
        <div className="flex items-center gap-2 bg-[#070b08]/90 border border-[#E5BA5D]/20 p-2.5 rounded-xl print:hidden">
          <Search className="w-4 h-4 text-[#E5BA5D]" />
          <input
            type="text"
            placeholder="Pesquisar por nome de guerra, posto/graduação, nome completo ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white text-xs px-2">
              Limpar
            </button>
          )}
        </div>

        {/* SPREADSHEET TABLE (SOMENTE VISUALIZAÇÃO E PRONTA PARA IMPRESSÃO) */}
        <div className="bg-[#070b08]/90 border border-[#E5BA5D]/20 rounded-xl overflow-hidden shadow-2xl print:bg-white print:text-black print:border-black print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse print:border print:border-black">
              <thead>
                <tr className="bg-[#0f1712] text-[#E5BA5D] border-b border-[#E5BA5D]/30 font-black uppercase text-[10px] tracking-wider print:bg-slate-200 print:text-black print:border-black">
                  <th className="p-3 text-center border-r border-[#E5BA5D]/10 print:border-black w-16">Nº Ordem</th>
                  <th className="p-3 border-r border-[#E5BA5D]/10 print:border-black w-28">Posto / Grad</th>
                  <th className="p-3 border-r border-[#E5BA5D]/10 print:border-black">Nome de Guerra</th>
                  <th className="p-3 border-r border-[#E5BA5D]/10 print:border-black">Nome Completo</th>
                  <th className="p-3 border-r border-[#E5BA5D]/10 print:border-black">Escala / Função Atribuída</th>
                  <th className="p-3 text-center border-r border-[#E5BA5D]/10 print:border-black w-24">Situação</th>
                  <th className="p-3 text-center print:border-black w-20">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5BA5D]/10 print:divide-black">
                {filteredMilitares.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                      Nenhum militar encontrado para esta pesquisa.
                    </td>
                  </tr>
                ) : (
                  filteredMilitares.map((m) => {
                    const funcObj = availableFuncoes.find(f => f.id === m.funcaoId);
                    return (
                      <tr key={m.id} className="hover:bg-[#E5BA5D]/5 transition-colors print:hover:bg-transparent">
                        <td className="p-3 text-center font-mono font-bold text-slate-400 border-r border-[#E5BA5D]/10 print:border-black print:text-black">
                          {m.antiguidade}
                        </td>
                        <td className="p-3 font-extrabold text-[#E5BA5D] border-r border-[#E5BA5D]/10 print:border-black print:text-black">
                          {m.postoGraduacao}
                        </td>
                        <td className="p-3 font-black text-slate-100 uppercase border-r border-[#E5BA5D]/10 print:border-black print:text-black">
                          {m.nomeGuerra}
                        </td>
                        <td className="p-3 text-slate-300 border-r border-[#E5BA5D]/10 print:border-black print:text-black">
                          {m.nomeCompleto}
                        </td>
                        <td className="p-3 text-amber-300 font-medium border-r border-[#E5BA5D]/10 print:border-black print:text-black">
                          {funcObj ? funcObj.nome : 'Sem Função Definida'}
                        </td>
                        <td className="p-3 text-center border-r border-[#E5BA5D]/10 print:border-black">
                          <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase print:border-black print:text-black print:bg-transparent">
                            {m.situacaoAtual}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-400 print:text-black">
                          {m.ativo ? 'Ativo' : 'Inativo'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: CADASTRAR NOVO MILITAR / MANTER EFETIVO
  // ==========================================
  return (
    <div className="space-y-6 w-full">
      {/* HEADER & VOLTAR BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5BA5D]/20 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubView('menu')}
            className="px-3.5 py-1.5 rounded-lg border border-[#E5BA5D]/30 bg-[#070b08] hover:bg-[#E5BA5D]/20 text-[#FFF2BF] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div>
            <h2 className="text-lg font-black text-[#FFF2BF] flex items-center gap-2 uppercase tracking-wider">
              <UserPlus className="w-5 h-5 text-[#E5BA5D]" />
              Cadastrar / Gerenciar Militar na Escala
            </h2>
            <p className="text-[11px] text-slate-400">
              Insira o militar na escala, defina sua posição de antiguidade e selecione sua escala de serviço.
            </p>
          </div>
        </div>
      </div>

      {/* FORM TO REGISTER / EDIT MILITARY MEMBER */}
      <div className="bg-[#070b08]/80 backdrop-blur-md border border-[#E5BA5D]/20 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5BA5D]/15 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#E5BA5D]">
            {editingMilitarId ? 'Editar Dados do Militar' : 'Cadastrar Novo Militar na Escala'}
          </h3>
          {editingMilitarId && (
            <button
              onClick={resetMilitarForm}
              className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider font-bold"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSaveMilitar} className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          
          {/* POSTO / GRADUAÇÃO */}
          <div className="md:col-span-3 space-y-1">
            <label className="font-bold text-slate-300">Posto / Graduação *</label>
            <select
              value={postoGraduacao}
              onChange={(e) => setPostoGraduacao(e.target.value as PostoGraduacao)}
              className="w-full p-2.5 rounded-lg bg-black border border-[#E5BA5D]/25 focus:border-[#E5BA5D] text-slate-100 outline-none font-bold cursor-pointer"
            >
              <option value="1º Ten">1º Tenente</option>
              <option value="2º Ten">2º Tenente</option>
              <option value="Asp">Aspirante-a-Oficial</option>
              <option value="Subten">Subtenente</option>
              <option value="1º Sgt">1º Sargento</option>
              <option value="2º Sgt">2º Sargento</option>
              <option value="3º Sgt">3º Sargento</option>
              <option value="Cb">Cabo</option>
              <option value="Sd">Soldado</option>
              <option value="Sd EV">Soldado EV</option>
            </select>
          </div>

          {/* NOME DE GUERRA */}
          <div className="md:col-span-3 space-y-1">
            <label className="font-bold text-slate-300">Nome de Guerra *</label>
            <input
              type="text"
              required
              placeholder="Ex: CAVALHEIRO"
              value={nomeGuerra}
              onChange={(e) => setNomeGuerra(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-black border border-[#E5BA5D]/25 focus:border-[#E5BA5D] text-slate-100 outline-none uppercase font-black"
            />
          </div>

          {/* ANTIGUIDADE (NÚMERO DE ORDEM PARA ORDENAR A ESCALA) */}
          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-slate-300">Antiguidade (Nº) *</label>
            <input
              type="number"
              min="1"
              required
              value={antiguidade}
              onChange={(e) => setAntiguidade(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg bg-black border border-[#E5BA5D]/25 focus:border-[#E5BA5D] text-slate-100 outline-none font-extrabold"
            />
          </div>

          {/* ESCALA (ONLY THE 4 SCALES AVAILABLE) */}
          <div className="md:col-span-4 space-y-1">
            <label className="font-bold text-slate-300">Escala *</label>
            <select
              value={selectedFuncaoId}
              onChange={(e) => setSelectedFuncaoId(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-black border border-[#E5BA5D]/25 focus:border-[#E5BA5D] text-[#FFF2BF] outline-none font-bold cursor-pointer"
            >
              {SCALES_CONFIG.map(sc => (
                <option key={sc.functionId} value={sc.functionId}>
                  {sc.title}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTON SAVE / UPDATE */}
          <div className="md:col-span-12 flex justify-end pt-1">
            <button
              type="submit"
              disabled={userRole === 'guest'}
              className={`px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                userRole === 'guest'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#E5BA5D] hover:bg-[#FFF2BF] text-black'
              }`}
            >
              <Check className="w-4 h-4" />
              {editingMilitarId ? 'Atualizar Militar' : 'Salvar Novo Militar'}
            </button>
          </div>

        </form>
      </div>

      {/* MILITARY MEMBERS LIST TABLE (GERENCIAR / SELECIONAR / TROCAR DE ESCALA / EXCLUIR) */}
      <div className="bg-[#070b08]/80 backdrop-blur-md border border-[#E5BA5D]/20 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5BA5D]/15 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#E5BA5D] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E5BA5D]" />
            Seleção & Gerenciamento de Militares Cadastrados ({militares.length})
          </h3>

          <div className="flex items-center gap-2 bg-black border border-[#E5BA5D]/25 px-3 py-1.5 rounded-lg text-xs w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar militar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-100 outline-none text-xs w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5BA5D]/15 max-h-[420px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-black/90 text-slate-400 border-b border-[#E5BA5D]/20 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3 text-center w-12">Nº</th>
                <th className="p-3 w-24">Rank</th>
                <th className="p-3">Nome de Guerra</th>
                <th className="p-3">Nome Completo</th>
                <th className="p-3 w-56">Trocar de Escala</th>
                {userRole !== 'guest' && <th className="p-3 text-right w-24">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5BA5D]/10">
              {filteredMilitares.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    Nenhum militar encontrado na busca.
                  </td>
                </tr>
              ) : (
                filteredMilitares.map((m) => {
                  const isBeingEdited = editingMilitarId === m.id;
                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-[#E5BA5D]/5 transition-colors ${
                        isBeingEdited ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono font-bold text-slate-400">
                        {m.antiguidade}
                      </td>
                      <td className="p-3 font-extrabold text-[#E5BA5D]">
                        {m.postoGraduacao}
                      </td>
                      <td className="p-3 font-black text-slate-100 uppercase">
                        {m.nomeGuerra}
                      </td>
                      <td className="p-3 text-slate-300">
                        {m.nomeCompleto}
                      </td>

                      {/* TROCAR O CAMARADA DE ESCALA DIRECTLY */}
                      <td className="p-3">
                        <select
                          value={m.funcaoId}
                          disabled={userRole === 'guest'}
                          onChange={(e) => handleChangeMilitarFuncao(m.id, e.target.value)}
                          className="w-full p-1.5 rounded bg-black border border-[#E5BA5D]/25 focus:border-[#E5BA5D] text-amber-300 font-bold text-[11px] outline-none cursor-pointer"
                          title="Trocar a escala do militar"
                        >
                          {SCALES_CONFIG.map(sc => (
                            <option key={sc.functionId} value={sc.functionId}>
                              {sc.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* EDIT AND DELETE ACTIONS */}
                      {userRole !== 'guest' && (
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 rounded transition-all cursor-pointer"
                            title="Editar Dados e Antiguidade"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilitar(m.id, `${m.postoGraduacao} ${m.nomeGuerra}`)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded transition-all cursor-pointer"
                            title="Excluir Militar da Escala"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};


// ==========================================
// 2. ESCALA (DUTY SCALES) VIEW component
// ==========================================
interface EscalaViewProps {
  selectedDate: string;
  militares: Militar[];
  registros: EscalaRegistro[];
  activePowerBIScale: string | null;
  setActivePowerBIScale: (id: string | null) => void;
  userRole: 'admin' | 'guest';
  onUpdate: () => void;
}

const EscalaView: React.FC<EscalaViewProps> = ({ 
  selectedDate, militares, registros, activePowerBIScale, setActivePowerBIScale, userRole, onUpdate 
}) => {
  
  // Power BI Scale click opens its specific month dashboard
  const handleScaleClick = (scaleId: string) => {
    setActivePowerBIScale(scaleId);
  };

  // Get current scheduled soldier for a specific functionId on the selectedDate
  const getAssignedSoldier = (functionId: string) => {
    const reg = registros.find(r => r.data === selectedDate && r.situacao === 'SV' && r.funcaoId === functionId);
    if (!reg) return null;
    return militares.find(m => m.id === reg.militarId);
  };

  if (activePowerBIScale) {
    const scaleConfig = SCALES_CONFIG.find(sc => sc.id === activePowerBIScale);
    if (!scaleConfig) return null;

    return (
      <PowerBIDashboard 
        scaleConfig={scaleConfig} 
        militares={militares} 
        registros={registros} 
        selectedDate={selectedDate}
        userRole={userRole}
        onBack={() => setActivePowerBIScale(null)}
        onUpdate={onUpdate}
      />
    );
  }

  const SCALES_DISPLAY = [
    {
      id: 'perm',
      title: 'PERMANÊNCIA',
      titleColor: 'text-[#E5BA5D]',
    },
    {
      id: 'coz',
      title: 'COZINHEIRO',
      titleColor: 'text-slate-100',
    },
    {
      id: 'aux',
      title: 'AUXILIAR DE COZINHEIRO',
      titleColor: 'text-[#E5BA5D]',
    },
    {
      id: 'cass',
      title: 'CASSINEIRO',
      titleColor: 'text-[#8ea394]',
    },
    {
      id: 'pad',
      title: 'PADEIRO',
      titleColor: 'text-amber-400',
    }
  ];

  return (
    <div className="flex flex-col justify-center items-center py-12 w-full">
      
      {/* 5 BLOCKS GRID CENTRALIZED */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl px-2">
        {SCALES_DISPLAY.map((sc) => {
          return (
            <button
              key={sc.id}
              onClick={() => handleScaleClick(sc.id)}
              className="group relative overflow-hidden bg-[#070b08]/80 hover:bg-[#070b08]/95 border border-[#E5BA5D]/15 hover:border-[#E5BA5D]/40 rounded-[20px] shadow-[0_12px_30px_rgba(0,0,0,0.6)] p-5 h-28 flex items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full"
            >
              {/* Premium top gradient border decoration */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#E5BA5D]/10 to-transparent group-hover:via-[#E5BA5D]/40 transition-all duration-300" />
              
              <span className={`text-sm sm:text-base md:text-lg font-black ${sc.titleColor} uppercase tracking-widest transition-all duration-300 group-hover:scale-105`}>
                {sc.title}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
// ==========================================
// 2A. POWER BI STYLE DASHBOARD
// ==========================================
interface PowerBIProps {
  scaleConfig: { id: string; title: string; functionId: string; textGradient: string };
  militares: Militar[];
  registros: EscalaRegistro[];
  selectedDate: string;
  userRole: 'admin' | 'guest';
  onBack: () => void;
  onUpdate: () => void;
}

const PowerBIDashboard: React.FC<PowerBIProps> = ({ 
  scaleConfig, militares, registros, selectedDate, userRole, onBack, onUpdate 
}) => {
  // Use state for month prefix (e.g. "2026-07") so user can pick any month inside the page
  const [currentMonthPrefix, setCurrentMonthPrefix] = useState(selectedDate.substring(0, 7));

  // Hovered cell state for dynamic crosshair matrix highlighting
  const [hoveredCell, setHoveredCell] = useState<{ militarId: string | null; dayNum: number | null }>({
    militarId: null,
    dayNum: null
  });

  // Table zoom factor (0.4 = 40% size to 1.2 = 120% size). Default to 1.0 (100% width) for optimum visibility!
  const [tableZoom, setTableZoom] = useState<number>(1.0);
  const touchRef = React.useRef<{ startDist: number; startZoom: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchRef.current = { startDist: dist, startZoom: tableZoom };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = dist / touchRef.current.startDist;
      // Clamp between 0.45 and 1.2
      const newZoom = Math.min(1.2, Math.max(0.45, touchRef.current.startZoom * scale));
      setTableZoom(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    touchRef.current = null;
  };

  // Calculate dynamic column sizes and sticky offsets based on the current zoom factor
  const zN = Math.round(32 * tableZoom);       // Nº order col width
  const zGrad = Math.round(55 * tableZoom);     // Graduação col width
  const zNome = Math.round(90 * tableZoom);     // Nome de Guerra col width
  const zDest = Math.round(65 * tableZoom);     // Destino col width
  const zDay = Math.round(30 * tableZoom);      // Day col width

  const offN = 0;
  const offGrad = zN;
  const offNome = zN + zGrad;
  const offDest = zN + zGrad + zNome;

  const [year, month] = currentMonthPrefix.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });

  // Generate days in month
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };
  const daysCount = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Custom weekend / holiday days state for active month (persisted in localStorage)
  const [customWeekendDays, setCustomWeekendDays] = useState<Set<number>>(() => {
    const saved = localStorage.getItem(`custom_weekends_${currentMonthPrefix}`);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        // fallback
      }
    }
    const set = new Set<number>();
    daysArray.forEach(d => {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        set.add(d);
      }
    });
    return set;
  });

  // Re-sync weekend days when active month changes
  useEffect(() => {
    const saved = localStorage.getItem(`custom_weekends_${currentMonthPrefix}`);
    if (saved) {
      try {
        setCustomWeekendDays(new Set(JSON.parse(saved)));
        return;
      } catch {
        // fallback
      }
    }
    const set = new Set<number>();
    daysArray.forEach(d => {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        set.add(d);
      }
    });
    setCustomWeekendDays(set);
  }, [currentMonthPrefix, year, month, daysCount]);

  const toggleWeekendDay = (dayNum: number) => {
    setCustomWeekendDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      localStorage.setItem(`custom_weekends_${currentMonthPrefix}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const resetWeekendDaysToDefault = () => {
    const set = new Set<number>();
    daysArray.forEach(d => {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        set.add(d);
      }
    });
    localStorage.setItem(`custom_weekends_${currentMonthPrefix}`, JSON.stringify(Array.from(set)));
    setCustomWeekendDays(set);
  };

  // Filter registrations for this specific function in the active month
  const scaleRegistros = useMemo(() => {
    return registros.filter(
      r => {
        if (!r.data.startsWith(currentMonthPrefix) || r.situacao !== 'SV') return false;
        if (scaleConfig.id === 'cass') {
          return ['f-4', 'f-5', 'f-6'].includes(r.funcaoId);
        }
        if (scaleConfig.id === 'aux') {
          return ['f-3', 'f-9'].includes(r.funcaoId);
        }
        if (scaleConfig.id === 'pad') {
          return r.funcaoId === 'f-7' || r.funcaoId === 'f-8' || r.funcaoId === 'f-7,f-8' || r.funcaoId?.includes('f-7') || r.funcaoId?.includes('f-8');
        }
        return r.funcaoId === scaleConfig.functionId;
      }
    );
  }, [registros, currentMonthPrefix, scaleConfig.id, scaleConfig.functionId]);

  // Fast O(1) lookup maps for rendering performance
  const registroMap = useMemo(() => {
    const map = new Map<string, EscalaRegistro>();
    for (const r of registros) {
      map.set(`${r.militarId}_${r.data}`, r);
    }
    return map;
  }, [registros]);

  const activeSVMap = useMemo(() => {
    const map = new Map<string, EscalaRegistro>();
    for (const r of scaleRegistros) {
      map.set(r.data, r);
    }
    return map;
  }, [scaleRegistros]);

  // Helper to get previous month YYYY-MM prefix
  const getPreviousMonthPrefix = (monthStr: string): string => {
    const [y, m] = monthStr.split('-').map(Number);
    if (m === 1) {
      return `${y - 1}-12`;
    }
    return `${y}-${String(m - 1).padStart(2, '0')}`;
  };

  // Precompute carryover from previous months ONCE per month / function change
  const carryoverMap = useMemo(() => {
    const map = new Map<string, { preta: number; vermelha: number }>();
    const carryoverCache = new Map<string, number>();

    const getCarryover = (
      militarId: string,
      monthStr: string,
      isVermelha: boolean,
      visited = new Set<string>()
    ): number => {
      const cacheKey = `${militarId}_${monthStr}_${isVermelha}_${scaleConfig.functionId}`;
      if (carryoverCache.has(cacheKey)) return carryoverCache.get(cacheKey)!;

      const prevMonthStr = getPreviousMonthPrefix(monthStr);
      if (visited.has(prevMonthStr)) return 0;
      visited.add(prevMonthStr);

      const [y, m] = prevMonthStr.split('-').map(Number);
      if (!y || !m || y < 2000 || m < 1 || m > 12) return 0;

      const daysInPrevMonth = new Date(y, m, 0).getDate();
      if (isNaN(daysInPrevMonth) || daysInPrevMonth <= 0) return 0;

      let prevWeekends: Set<number>;
      const saved = localStorage.getItem(`custom_weekends_${prevMonthStr}`);
      if (saved) {
        try {
          prevWeekends = new Set(JSON.parse(saved));
        } catch {
          prevWeekends = new Set();
          for (let d = 1; d <= daysInPrevMonth; d++) {
            const dow = new Date(y, m - 1, d).getDay();
            if (dow === 0 || dow === 6) prevWeekends.add(d);
          }
        }
      } else {
        prevWeekends = new Set();
        for (let d = 1; d <= daysInPrevMonth; d++) {
          const dow = new Date(y, m - 1, d).getDay();
          if (dow === 0 || dow === 6) prevWeekends.add(d);
        }
      }

      const matchingPrevDays: number[] = [];
      for (let d = 1; d <= daysInPrevMonth; d++) {
        if (prevWeekends.has(d) === isVermelha) {
          matchingPrevDays.push(d);
        }
      }

      if (matchingPrevDays.length === 0) {
        const val = getCarryover(militarId, prevMonthStr, isVermelha, visited);
        carryoverCache.set(cacheKey, val);
        return val;
      }

      let lastSVDay: number | null = null;
      for (const d of matchingPrevDays) {
        const dStr = String(d).padStart(2, '0');
        const fDate = `${prevMonthStr}-${dStr}`;
        const isSV = registros.some(
          r => r.militarId === militarId && r.data === fDate && r.situacao === 'SV' && (
            scaleConfig.id === 'cass' ? ['f-4', 'f-5', 'f-6'].includes(r.funcaoId) :
            scaleConfig.id === 'aux' ? ['f-3', 'f-9'].includes(r.funcaoId) :
            scaleConfig.id === 'pad' ? ['f-7', 'f-8'].includes(r.funcaoId) :
            r.funcaoId === scaleConfig.functionId
          )
        );
        if (isSV) {
          lastSVDay = d;
        }
      }

      let result = 0;
      if (lastSVDay !== null) {
        result = matchingPrevDays.filter(d => d > lastSVDay!).length;
      } else {
        const earlierCarryover = getCarryover(militarId, prevMonthStr, isVermelha, visited);
        result = earlierCarryover + matchingPrevDays.length;
      }

      carryoverCache.set(cacheKey, result);
      return result;
    };

    for (const m of militares) {
      const preta = getCarryover(m.id, currentMonthPrefix, false);
      const vermelha = getCarryover(m.id, currentMonthPrefix, true);
      map.set(m.id, { preta, vermelha });
    }

    return map;
  }, [militares, currentMonthPrefix, scaleConfig.functionId, registros]);

  // Precompute folgas for ALL (militar x day) in one single fast linear pass
  const folgasMap = useMemo(() => {
    const map = new Map<string, number>();

    const militarSVsPreta = new Map<string, Set<number>>();
    const militarSVsVermelha = new Map<string, Set<number>>();

    for (const m of militares) {
      militarSVsPreta.set(m.id, new Set());
      militarSVsVermelha.set(m.id, new Set());
    }

    // Functions that DO NOT reset folga:
    const NON_FOLGA_RESET_FUNCTIONS = new Set(['f-4', 'f-9']); // Cassineiro OF & Lavagem dos Talheres

    for (const r of registros) {
      if (r.situacao === 'SV' && r.data.startsWith(currentMonthPrefix) && !NON_FOLGA_RESET_FUNCTIONS.has(r.funcaoId)) {
        const d = Number(r.data.split('-')[2]);
        if (!isNaN(d)) {
          const isVermelha = customWeekendDays.has(d);
          if (isVermelha) {
            militarSVsVermelha.get(r.militarId)?.add(d);
          } else {
            militarSVsPreta.get(r.militarId)?.add(d);
          }
        }
      }
    }

    const pretaDays = daysArray.filter(d => !customWeekendDays.has(d));
    const vermelhaDays = daysArray.filter(d => customWeekendDays.has(d));

    for (const m of militares) {
      const carry = carryoverMap.get(m.id) || { preta: 0, vermelha: 0 };
      const svsPreta = militarSVsPreta.get(m.id) || new Set();
      const svsVermelha = militarSVsVermelha.get(m.id) || new Set();

      let lastSVPreta: number | null = null;
      let pretaCountSinceSV = 0;
      for (const d of pretaDays) {
        if (svsPreta.has(d)) {
          lastSVPreta = d;
          pretaCountSinceSV = 0;
          map.set(`${m.id}_${d}`, 0);
        } else {
          if (lastSVPreta !== null) {
            pretaCountSinceSV++;
            map.set(`${m.id}_${d}`, pretaCountSinceSV);
          } else {
            pretaCountSinceSV++;
            map.set(`${m.id}_${d}`, carry.preta + pretaCountSinceSV);
          }
        }
      }

      let lastSVVermelha: number | null = null;
      let vermelhaCountSinceSV = 0;
      for (const d of vermelhaDays) {
        if (svsVermelha.has(d)) {
          lastSVVermelha = d;
          vermelhaCountSinceSV = 0;
          map.set(`${m.id}_${d}`, 0);
        } else {
          if (lastSVVermelha !== null) {
            vermelhaCountSinceSV++;
            map.set(`${m.id}_${d}`, vermelhaCountSinceSV);
          } else {
            vermelhaCountSinceSV++;
            map.set(`${m.id}_${d}`, carry.vermelha + vermelhaCountSinceSV);
          }
        }
      }
    }

    return map;
  }, [militares, daysArray, currentMonthPrefix, customWeekendDays, registros, carryoverMap]);

  // Helper to compute folga count for a military officer on a given day (O(1) lookup)
  const getFolgaForMilitar = (militarId: string, dayNum: number): { folga: number; scaleType: 'Preta' | 'Vermelha' } => {
    const isVermelha = customWeekendDays.has(dayNum);
    const scaleType: 'Preta' | 'Vermelha' = isVermelha ? 'Vermelha' : 'Preta';
    const folga = folgasMap.get(`${militarId}_${dayNum}`) ?? 1;
    return { folga, scaleType };
  };

  // State for Service Selection Modal (Cassineiro vs Cassineiro OF / Auxiliar vs Lavagem dos Talheres)
  const [serviceModal, setServiceModal] = useState<{
    militar: Militar;
    dayNum: number;
    fullDate: string;
  } | null>(null);

  // Auto-escala for a single day: pick the officer with highest folga
  const handleAutoEscalaDay = (dayNum: number) => {
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem alterar a escala de serviço.');
      return;
    }

    const dayStr = String(dayNum).padStart(2, '0');
    const fullDate = `${currentMonthPrefix}-${dayStr}`;
    const isVermelha = customWeekendDays.has(dayNum);

    // Filter eligible active military members
    const eligible = sortedMilitares.filter(m => {
      if (!m.ativo || m.situacaoAtual !== 'Apto') return false;

      // Check date range afastamento (Destino registrado)
      const afastamento = db.afastamentos.getByMilitarAndDate(m.id, fullDate);
      if (afastamento) return false;

      // Check non-Apto destination
      const cellReg = registros.find(r => r.militarId === m.id && r.data === fullDate);
      if (cellReg && cellReg.situacao !== 'SV' && cellReg.situacao !== 'Folga') {
        return false;
      }

      // Check if scheduled on another function
      const otherSV = registros.find(
        r => r.militarId === m.id && r.data === fullDate && r.situacao === 'SV' && !['f-3', 'f-4', 'f-5', 'f-6', 'f-9'].includes(r.funcaoId) && r.funcaoId !== scaleConfig.functionId
      );
      if (otherSV) return false;

      return true;
    });

    if (eligible.length === 0) {
      alert(`Não há militares aptos ou disponíveis para escalar no dia ${dayStr}/${month}!`);
      return;
    }

    const candidatesWithFolga = eligible.map(m => {
      const folgaInfo = getFolgaForMilitar(m.id, dayNum);
      return {
        militar: m,
        folga: folgaInfo.folga,
        dutiesThisMonth: stats[m.id] || 0
      };
    });

    // Sort descending by folga count, ascending by duties this month, then seniority
    candidatesWithFolga.sort((a, b) => {
      if (b.folga !== a.folga) return b.folga - a.folga;
      if (a.dutiesThisMonth !== b.dutiesThisMonth) return a.dutiesThisMonth - b.dutiesThisMonth;
      return a.militar.antiguidade - b.militar.antiguidade;
    });

    // On Auxiliar scale, Mon-Fri requires 2 military members!
    if (scaleConfig.id === 'aux' && !isVermelha) {
      const top2 = candidatesWithFolga.slice(0, 2);
      // Clear existing f-3 on that date
      const currentAuxSVs = registros.filter(r => r.data === fullDate && r.funcaoId === 'f-3');
      currentAuxSVs.forEach(r => db.escala.deleteRegistro(r.militarId, fullDate));

      top2.forEach(cand => {
        db.escala.saveRegistro({
          id: `e-sv-${cand.militar.id}-${fullDate}`,
          militarId: cand.militar.id,
          data: fullDate,
          situacao: 'SV',
          funcaoId: 'f-3'
        });
      });
      onUpdate();

      const names = top2.map(c => `${c.militar.postoGraduacao} ${c.militar.nomeGuerra}`).join(' e ');
      alert(
        `⚡ Auto-Escala de Auxiliar de Cozinheiro (2 Militares - Seg a Sex):\n` +
        `Escalados para o Dia ${dayStr}: ${names}`
      );
      return;
    }

    // On Padeiro scale: auto-escala assigns Padeiro Diurno (f-7) and Padeiro Noturno (f-8)
    if (scaleConfig.id === 'pad') {
      const top2 = candidatesWithFolga.slice(0, 2);
      const currentPadSVs = registros.filter(r => r.data === fullDate && ['f-7', 'f-8'].includes(r.funcaoId));
      currentPadSVs.forEach(r => db.escala.deleteRegistro(r.militarId, fullDate));

      if (top2[0]) {
        db.escala.saveRegistro({
          id: `e-sv-${top2[0].militar.id}-${fullDate}`,
          militarId: top2[0].militar.id,
          data: fullDate,
          situacao: 'SV',
          funcaoId: 'f-7'
        });
      }
      if (top2[1]) {
        db.escala.saveRegistro({
          id: `e-sv-${top2[1].militar.id}-${fullDate}`,
          militarId: top2[1].militar.id,
          data: fullDate,
          situacao: 'SV',
          funcaoId: 'f-8'
        });
      }
      onUpdate();

      const names = top2.map((c, idx) => `${c.militar.postoGraduacao} ${c.militar.nomeGuerra} (${idx === 0 ? 'Padeiro Diurno' : 'Padeiro Noturno'})`).join(' e ');
      alert(
        `⚡ Auto-Escala de Padeiro (Diurno e Noturno):\n` +
        `Escalados para o Dia ${dayStr}: ${names}`
      );
      return;
    }

    const bestCandidate = candidatesWithFolga[0].militar;
    const bestFolga = candidatesWithFolga[0].folga;

    // Clear existing SV for this function if any
    const targetFuncaoId = scaleConfig.id === 'cass' ? 'f-5' : scaleConfig.functionId;
    const currentSV = scaleRegistros.find(r => r.data === fullDate && r.funcaoId === targetFuncaoId);
    if (currentSV) {
      db.escala.deleteRegistro(currentSV.militarId, fullDate);
    }

    const newReg: EscalaRegistro = {
      id: `e-sv-${bestCandidate.id}-${fullDate}`,
      militarId: bestCandidate.id,
      data: fullDate,
      situacao: 'SV',
      funcaoId: targetFuncaoId
    };

    db.escala.saveRegistro(newReg);
    onUpdate();

    alert(
      `⚡ Auto-Escala Realizada para o Dia ${dayStr} (${isVermelha ? 'Escala Vermelha' : 'Escala Preta'}):\n` +
      `Escalado: ${bestCandidate.postoGraduacao} ${bestCandidate.nomeGuerra} (Maior Folga: ${bestFolga} dias)`
    );
  };

  // Stats: duty frequency for this specific scale in this active month
  const stats: { [mId: string]: number } = {};
  militares.forEach(m => { stats[m.id] = 0; });
  scaleRegistros.forEach(r => {
    if (stats[r.militarId] !== undefined) {
      stats[r.militarId]++;
    }
  });

  // Calculate Average rest days
  const activeMilsCount = militares.filter(m => m.ativo).length;
  const totalDuties = scaleRegistros.length;
  const avgDutiesPerPerson = activeMilsCount > 0 ? (totalDuties / activeMilsCount).toFixed(1) : '0';

  // Calculate Militares Fora da Escala (afastados no dia por qualquer motivo, exceto por estar de SV)
  const foraDaEscalaCount = useMemo(() => {
    const afastamentos = db.afastamentos.getAll();
    return militares.filter(m => {
      if (!m.ativo) return false;
      // 1. Possui lançamento de afastamento cobrindo a data selecionada
      const temAfastamentoData = afastamentos.some(
        a => a.militarId === m.id && selectedDate >= a.dataInicio && selectedDate <= a.dataFim
      );
      if (temAfastamentoData) return true;

      // 2. Situação cadastral diferente de 'Apto'
      if (m.situacaoAtual && m.situacaoAtual !== 'Apto') return true;

      // 3. Registro direto na data com situação de afastamento (exceto SV e Folga)
      const regData = registros.find(r => r.militarId === m.id && r.data === selectedDate);
      if (regData && regData.situacao !== 'SV' && regData.situacao !== 'Folga' && regData.situacao !== 'Apto') {
        return true;
      }

      return false;
    }).length;
  }, [militares, registros, selectedDate]);

  // Programmatically get weekday label (e.g. "SEG", "TER"...)
  const getDayOfWeekLabel = (dayNum: number) => {
    const date = new Date(year, month - 1, dayNum);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return weekday.replace('.', '').toUpperCase().substring(0, 3);
  };

  // Handle click on calendar cell
  const handleCellClick = (m: Militar, dayNum: number, cellReg: EscalaRegistro | undefined, isActiveSV: boolean) => {
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem alterar a escala de serviço.');
      return;
    }

    const dayStr = String(dayNum).padStart(2, '0');
    const fullDate = `${currentMonthPrefix}-${dayStr}`;

    // Check if military member has an active date-range afastamento/destino
    const afastamento = db.afastamentos.getByMilitarAndDate(m.id, fullDate);
    if (afastamento) {
      const formatDateBR = (dStr: string) => dStr.split('-').reverse().join('/');
      alert(
        `⛔ IMPOSSÍVEL ESCALAR DE SERVIÇO!\n\n` +
        `O militar ${m.postoGraduacao} ${m.nomeGuerra} encontra-se afastado no destino [${afastamento.destino.toUpperCase()}] no período de ${formatDateBR(afastamento.dataInicio)} a ${formatDateBR(afastamento.dataFim)}.\n\n` +
        `Para liberá-lo, acesse a aba "Destinos" e interrompa o afastamento registrado.`
      );
      return;
    }

    // Modal selection for Cassineiro, Auxiliar, and Padeiro scales
    if (scaleConfig.id === 'cass' || scaleConfig.id === 'aux' || scaleConfig.id === 'pad') {
      setServiceModal({ militar: m, dayNum, fullDate });
      return;
    }

    // If already scheduled on this scale: toggle off/delete
    if (isActiveSV) {
      db.escala.deleteRegistro(m.id, fullDate);
      onUpdate();
      return;
    }

    // If military member is scheduled on ANOTHER scale
    if (cellReg && cellReg.situacao === 'SV' && cellReg.funcaoId !== scaleConfig.functionId) {
      db.escala.deleteRegistro(m.id, fullDate);
    }

    // To preserve single-occupancy of scale service: clear any other SV registration for this scale function on fullDate
    const otherSV = registros.find(
      r => r.data === fullDate && r.situacao === 'SV' && r.funcaoId === scaleConfig.functionId
    );
    if (otherSV) {
      db.escala.deleteRegistro(otherSV.militarId, fullDate);
    }

    // Create new registration
    const newReg: EscalaRegistro = {
      id: `e-sv-${m.id}-${fullDate}`,
      militarId: m.id,
      data: fullDate,
      situacao: 'SV',
      funcaoId: scaleConfig.functionId
    };

    db.escala.saveRegistro(newReg);
    onUpdate();
  };

  // Filter militares strictly by active scale (no fallback)
  const scaleMilitares = useMemo(() => {
    return militares.filter(m => {
      if (scaleConfig.id === 'cass') {
        return ['f-4', 'f-5', 'f-6'].includes(m.funcaoId);
      }
      return m.funcaoId === scaleConfig.functionId;
    });
  }, [militares, scaleConfig.id, scaleConfig.functionId]);

  // Sort military members by seniority
  const sortedMilitares = useMemo(() => {
    return [...scaleMilitares].sort((a, b) => a.antiguidade - b.antiguidade);
  }, [scaleMilitares]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* SIMPLE HEADER */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2BF] to-[#E5BA5D] uppercase">
          Escala de {scaleConfig.title}
        </h2>
      </div>

      {/* MONTH CHANGER BUTTON */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          <select
            value={currentMonthPrefix}
            onChange={(e) => {
              if (e.target.value) {
                setCurrentMonthPrefix(e.target.value);
              }
            }}
            className="appearance-none bg-[#070b08] hover:bg-black/80 border border-[#E5BA5D]/30 hover:border-[#E5BA5D]/60 text-xs font-black uppercase tracking-widest text-[#E5BA5D] px-8 py-3 rounded-full text-center cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(229,186,93,0.15)] outline-none pr-12"
          >
            <option value="2026-01" className="bg-[#070b08] text-[#E5BA5D]">Janeiro de 2026</option>
            <option value="2026-02" className="bg-[#070b08] text-[#E5BA5D]">Fevereiro de 2026</option>
            <option value="2026-03" className="bg-[#070b08] text-[#E5BA5D]">Março de 2026</option>
            <option value="2026-04" className="bg-[#070b08] text-[#E5BA5D]">Abril de 2026</option>
            <option value="2026-05" className="bg-[#070b08] text-[#E5BA5D]">Maio de 2026</option>
            <option value="2026-06" className="bg-[#070b08] text-[#E5BA5D]">Junho de 2026</option>
            <option value="2026-07" className="bg-[#070b08] text-[#E5BA5D]">Julho de 2026</option>
            <option value="2026-08" className="bg-[#070b08] text-[#E5BA5D]">Agosto de 2026</option>
            <option value="2026-09" className="bg-[#070b08] text-[#E5BA5D]">Setembro de 2026</option>
            <option value="2026-10" className="bg-[#070b08] text-[#E5BA5D]">Outubro de 2026</option>
            <option value="2026-11" className="bg-[#070b08] text-[#E5BA5D]">Novembro de 2026</option>
            <option value="2026-12" className="bg-[#070b08] text-[#E5BA5D]">Dezembro de 2026</option>
          </select>
          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#E5BA5D]">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* THREE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        
        {/* EFETIVO DISPONÍVEL */}
        <div className="bg-[#070b08]/80 border border-[#E5BA5D]/15 rounded-[20px] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between h-28 w-full text-center sm:text-left">
          <p className="text-[10px] text-[#E5BA5D]/80 uppercase font-black tracking-wider">Efetivo Disponível</p>
          <p className="text-3xl font-black text-slate-100 mt-1">{activeMilsCount}</p>
          <p className="text-[9px] text-slate-500 font-mono">Militares no Setor</p>
        </div>

        {/* MÉDIA DE SERVIÇOS / MILITAR */}
        <div className="bg-[#070b08]/80 border border-[#E5BA5D]/15 rounded-[20px] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between h-28 w-full text-center sm:text-left">
          <p className="text-[10px] text-[#E5BA5D]/80 uppercase font-black tracking-wider">Média de Serviços / Militar</p>
          <p className="text-3xl font-black text-[#E5BA5D] mt-1">{avgDutiesPerPerson}</p>
          <p className="text-[9px] text-slate-500 font-mono">Serviços distribuídos</p>
        </div>

        {/* MILITARES FORA DA ESCALA */}
        <div className="bg-[#070b08]/80 border border-amber-500/20 rounded-[20px] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between h-28 w-full text-center sm:text-left">
          <p className="text-[10px] text-amber-400 uppercase font-black tracking-wider">Militares Fora da Escala</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{foraDaEscalaCount}</p>
          <p className="text-[9px] text-slate-500 font-mono">Afastados em {selectedDate.split('-').reverse().join('/')}</p>
        </div>

      </div>

      {/* INTERACTIVE MONTHLY MATRIX TABLE */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full shadow-[0_8px_30px_rgba(0,0,0,0.05)] text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              Quadro de Escala Mensal — {scaleConfig.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {userRole === 'admin' 
                ? 'Clique em qualquer célula para alternar o serviço ("SV") do militar no dia correspondente.' 
                : 'Quadro analítico de serviço ativo para visualização geral.'}
            </p>
          </div>
        </div>

        {/* CONTROLES DE ZOOM E INFORMAÇÃO DA ESCALA */}
        <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* TAMANHO DA PLANILHA */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Tamanho da Planilha:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTableZoom(prev => Math.max(0.45, Number((prev - 0.05).toFixed(2))))}
                  className="p-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-600 hover:text-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                  title="Diminuir zoom da tabela"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                
                <span className="min-w-[48px] text-center font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg py-1 text-[11px] shadow-sm">
                  {Math.round(tableZoom * 100)}%
                </span>
                
                <button
                  type="button"
                  onClick={() => setTableZoom(prev => Math.min(1.2, Number((prev + 0.05).toFixed(2))))}
                  className="p-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-slate-600 hover:text-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                  title="Aumentar zoom da tabela"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setTableZoom(1.0)}
                  className="ml-1 text-[9px] px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg font-black transition-colors text-slate-700 uppercase cursor-pointer"
                >
                  Reset (100%)
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL DE CONFIGURAÇÃO DE FINAIS DE SEMANA / FERIADOS */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/90 border border-amber-200/90 rounded-lg p-2 text-[10px] text-amber-950">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Escala Vermelha (Finais de Semana / Feriados):</span>
              </span>
              <span>Clique no cabeçalho do dia para alternar entre Escala Preta (Dia Útil) e Escala Vermelha (Fim de semana/Folga).</span>
            </div>
          </div>
        </div>

        {/* CONTAINER DA PLANILHA COM ESCUTA DE GESTOS MULTI-TOQUE (PINCH TO ZOOM) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="overflow-auto w-full border border-slate-300 rounded-xl max-h-[500px]"
        >
          <table 
            style={{ fontSize: `${Math.max(8, Math.round(12 * tableZoom))}px` }}
            className="w-full text-left border-collapse table-auto bg-white select-none"
            onMouseLeave={() => setHoveredCell({ militarId: null, dayNum: null })}
          >
            <thead>
              {/* 1ª LINHA DO CABEÇALHO: Dias da semana */}
              <tr className="sticky top-0 z-50 bg-slate-100 border-b border-slate-300 text-slate-700 font-black font-mono">
                <th 
                  rowSpan={2} 
                  style={{
                    left: `${offN}px`,
                    width: `${zN}px`,
                    minWidth: `${zN}px`,
                    maxWidth: `${zN}px`,
                    padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                  }}
                  className="sticky left-0 top-0 z-50 bg-slate-100 border-r border-b border-slate-300 text-center text-slate-800"
                >
                  Nº
                </th>
                <th 
                  rowSpan={2} 
                  style={{
                    left: `${offGrad}px`,
                    width: `${zGrad}px`,
                    minWidth: `${zGrad}px`,
                    maxWidth: `${zGrad}px`,
                    padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                  }}
                  className="sticky top-0 z-50 bg-slate-100 border-r border-b border-slate-300 text-slate-800 truncate text-left"
                >
                  {tableZoom < 0.65 ? "Grad." : "Graduação"}
                </th>
                <th 
                  rowSpan={2} 
                  style={{
                    left: `${offNome}px`,
                    width: `${zNome}px`,
                    minWidth: `${zNome}px`,
                    maxWidth: `${zNome}px`,
                    padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                  }}
                  className="sticky top-0 z-50 bg-slate-100 border-r border-b border-slate-300 text-slate-800 truncate text-left"
                >
                  Nome
                </th>
                <th 
                  rowSpan={2} 
                  style={{
                    left: `${offDest}px`,
                    width: `${zDest}px`,
                    minWidth: `${zDest}px`,
                    maxWidth: `${zDest}px`,
                    padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                  }}
                  className="sticky top-0 z-50 bg-slate-100 border-r-2 border-b border-slate-300 border-r-slate-400 text-slate-800 truncate text-left"
                >
                  Destino
                </th>
                {daysArray.map(dayNum => {
                  const label = getDayOfWeekLabel(dayNum);
                  const isFimSemana = customWeekendDays.has(dayNum);
                  const isColHovered = hoveredCell.dayNum === dayNum;
                  return (
                    <th 
                      key={`wk-${dayNum}`} 
                      onClick={() => toggleWeekendDay(dayNum)}
                      onMouseEnter={() => setHoveredCell(prev => ({ ...prev, dayNum }))}
                      style={{
                        minWidth: `${zDay}px`,
                        width: `${zDay}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`border-r border-b text-center text-[10px] sticky top-0 cursor-pointer transition-all duration-75 ${
                        isColHovered
                          ? 'bg-emerald-400 text-slate-950 font-black border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.85)] ring-2 ring-emerald-300 z-40 scale-[1.05]'
                          : isFimSemana 
                            ? 'bg-rose-500 text-white font-black border-rose-600 hover:bg-rose-600 z-30' 
                            : 'text-slate-600 bg-slate-100 border-slate-300 hover:bg-slate-200 z-30'
                      }`}
                      title={`Dia ${dayNum} (${label}): ${isFimSemana ? 'Escala Vermelha (Fim de Semana / Feriado). Clique para mudar para Escala Preta' : 'Escala Preta (Dia Útil). Clique para mudar para Escala Vermelha'}`}
                    >
                      {label}
                    </th>
                  );
                })}
              </tr>
              {/* 2ª LINHA DO CABEÇALHO: Dias do mês numerados com cor destacada de alta visibilidade */}
              <tr className="bg-slate-900 border-b border-slate-700 text-[#E5BA5D] font-black font-mono">
                {daysArray.map(dayNum => {
                  const label = getDayOfWeekLabel(dayNum);
                  const isFimSemana = customWeekendDays.has(dayNum);
                  const dayStr = String(dayNum).padStart(2, '0');
                  const isColHovered = hoveredCell.dayNum === dayNum;
                  return (
                    <th 
                      key={`num-${dayNum}`} 
                      onClick={() => toggleWeekendDay(dayNum)}
                      onMouseEnter={() => setHoveredCell(prev => ({ ...prev, dayNum }))}
                      style={{
                        minWidth: `${zDay}px`,
                        width: `${zDay}px`,
                        top: `${Math.round(26 * tableZoom)}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`border-r text-center text-xs sticky cursor-pointer transition-all duration-75 ${
                        isColHovered
                          ? 'bg-emerald-400 text-slate-950 font-black border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.85)] ring-2 ring-emerald-300 z-40 scale-[1.05]'
                          : isFimSemana 
                            ? 'bg-rose-600 text-white font-black border-rose-700 hover:bg-rose-700 z-30' 
                            : 'text-[#E5BA5D] bg-slate-900 border-slate-700 hover:bg-slate-800 z-30'
                      }`}
                      title={`Dia ${dayNum} (${label}): ${isFimSemana ? 'Escala Vermelha (Fim de Semana / Feriado)' : 'Escala Preta (Dia Útil)'}`}
                    >
                      {dayStr}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedMilitares.length === 0 ? (
                <tr>
                  <td colSpan={3 + daysArray.length} className="p-10 text-center bg-white text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto py-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#E5BA5D]">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        Nenhum militar cadastrado para a Escala de {scaleConfig.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Cada militar do Aprovisionamento concorre a apenas <strong>1 escala</strong>. Para incluir militares nesta escala, acesse <strong>Efetivo / Militares</strong> e atribua esta função ao militar desejado.
                      </p>
                      {userRole === 'admin' && (
                        <button
                          onClick={onBack}
                          className="mt-2 px-4 py-2 bg-[#070b08] hover:bg-black border border-[#E5BA5D]/40 text-[#FFF2BF] text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <UserPlus className="w-4 h-4 text-[#E5BA5D]" />
                          Ir para Menu / Cadastrar Militar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedMilitares.map((m, idx) => {
                const isRowHovered = hoveredCell.militarId === m.id;

                return (
                  <tr key={m.id} className={`transition-colors h-10 ${isRowHovered ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}>
                    {/* Nº de Ordem */}
                    <td 
                      style={{
                        left: `${offN}px`,
                        width: `${zN}px`,
                        minWidth: `${zN}px`,
                        maxWidth: `${zN}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`sticky left-0 z-40 border-r border-b text-center font-mono font-bold truncate transition-all duration-75 ${
                        isRowHovered 
                          ? 'bg-emerald-400/90 text-slate-950 border-emerald-500 font-black shadow-[0_0_8px_rgba(52,211,153,0.4)]' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </td>
                    {/* Graduação */}
                    <td 
                      style={{
                        left: `${offGrad}px`,
                        width: `${zGrad}px`,
                        minWidth: `${zGrad}px`,
                        maxWidth: `${zGrad}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`sticky z-40 border-r border-b font-bold truncate transition-all duration-75 ${
                        isRowHovered 
                          ? 'bg-emerald-400/90 text-slate-950 border-emerald-500 font-black shadow-[0_0_8px_rgba(52,211,153,0.4)]' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {m.postoGraduacao}
                    </td>
                    {/* Nome de Guerra */}
                    <td 
                      onMouseEnter={() => setHoveredCell({ militarId: m.id, dayNum: null })}
                      style={{
                        left: `${offNome}px`,
                        width: `${zNome}px`,
                        minWidth: `${zNome}px`,
                        maxWidth: `${zNome}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`sticky z-40 border-r border-b font-extrabold uppercase tracking-wide whitespace-nowrap truncate text-left transition-all duration-75 ${
                        isRowHovered 
                          ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 border-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.9)] font-black z-50 rounded-xs scale-[1.02]' 
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {m.nomeGuerra}
                    </td>
                    {/* Destino atual */}
                    <td 
                      style={{
                        left: `${offDest}px`,
                        width: `${zDest}px`,
                        minWidth: `${zDest}px`,
                        maxWidth: `${zDest}px`,
                        padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                      }}
                      className={`sticky z-40 border-r-2 border-b border-r-slate-400 font-medium truncate transition-all duration-75 ${
                        isRowHovered 
                          ? 'bg-emerald-300/90 text-slate-950 border-b-emerald-400 font-bold' 
                          : 'bg-white border-b-slate-300 text-slate-500'
                      }`}
                    >
                      <span 
                        style={{ fontSize: `${Math.max(7, Math.round(9 * tableZoom))}px` }}
                        className={`font-bold px-1 py-0.5 rounded-full uppercase block text-center truncate ${
                          m.situacaoAtual === 'Apto' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {m.situacaoAtual}
                      </span>
                    </td>

                    {/* Células de Calendário */}
                    {daysArray.map(dayNum => {
                      const dayStr = String(dayNum).padStart(2, '0');
                      const fullDate = `${currentMonthPrefix}-${dayStr}`;
                      const isFimSemana = customWeekendDays.has(dayNum);
                      
                      const cellReg = registroMap.get(`${m.id}_${fullDate}`);
                      const isMilitarSV = cellReg && cellReg.situacao === 'SV';
                      const afastamento = db.afastamentos.getByMilitarAndDate(m.id, fullDate);
                      const folgaInfo = getFolgaForMilitar(m.id, dayNum);

                      const isColHovered = hoveredCell.dayNum === dayNum;
                      const isRowLeftHovered = isRowHovered && (hoveredCell.dayNum === null || dayNum <= hoveredCell.dayNum);
                      const isExactHovered = isRowHovered && isColHovered;
                      const isHighlighted = isColHovered || isRowLeftHovered;

                      let content = "";
                      let cellStyle = "";
                      let cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr} de ${monthName} (${isFimSemana ? 'Escala Vermelha' : 'Escala Preta'}): Folga ${folgaInfo.folga} dia(s)`;

                      if (isMilitarSV) {
                        if (cellReg.funcaoId === 'f-4') {
                          content = "SV (OF)";
                          cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr}: Cassineiro dos Oficiais (NÃO zera folga na escala)`;
                          cellStyle = "bg-purple-700 text-white font-black text-center shadow-sm cursor-pointer border-r border-purple-800";
                        } else if (cellReg.funcaoId === 'f-9') {
                          content = "SV (Talheres)";
                          cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr}: Lavagem dos Talheres (NÃO zera folga na escala)`;
                          cellStyle = "bg-teal-700 text-white font-black text-center shadow-sm cursor-pointer border-r border-teal-800";
                        } else if (cellReg.funcaoId === 'f-7,f-8' || (cellReg.funcaoId?.includes('f-7') && cellReg.funcaoId?.includes('f-8'))) {
                          content = "SV (Dia/Noite)";
                          cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr}: Padeiro Diurno e Noturno (Inversão/Troca de Sexta-Feira)`;
                          cellStyle = "bg-gradient-to-r from-amber-600 to-indigo-700 text-white font-black text-center shadow-md cursor-pointer border-r border-indigo-900";
                        } else if (cellReg.funcaoId === 'f-7') {
                          content = "SV (Dia)";
                          cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr}: Padeiro Diurno`;
                          cellStyle = "bg-amber-600 text-white font-black text-center shadow-sm cursor-pointer border-r border-amber-700";
                        } else if (cellReg.funcaoId === 'f-8') {
                          content = "SV (Noite)";
                          cellTooltip = `${m.postoGraduacao} ${m.nomeGuerra} - Dia ${dayStr}: Padeiro Noturno`;
                          cellStyle = "bg-indigo-700 text-white font-black text-center shadow-sm cursor-pointer border-r border-indigo-800";
                        } else {
                          content = "SV";
                          if (isExactHovered) {
                            cellStyle = "bg-amber-300 text-slate-950 font-black text-center ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] scale-[1.12] z-50 cursor-pointer border-2 border-emerald-400 rounded-xs";
                          } else if (isHighlighted) {
                            cellStyle = "bg-[#f5c760] text-slate-950 font-black text-center ring-1 ring-emerald-400 z-20 cursor-pointer border-r border-emerald-500 shadow-sm";
                          } else {
                            cellStyle = "bg-[#E5BA5D] text-black font-black text-center shadow-[inset_0_0_8px_rgba(0,0,0,0.15)] cursor-pointer border-r border-amber-600/40";
                          }
                        }
                      } else if (afastamento) {
                        const destUpper = afastamento.destino.toUpperCase();
                        content = destUpper.length > 8 ? destUpper.substring(0, 7) + '.' : destUpper;
                        const formatDateBR = (dStr: string) => dStr.split('-').reverse().join('/');
                        cellTooltip = `⛔ AFASTADO: ${m.postoGraduacao} ${m.nomeGuerra} - Destino: [${afastamento.destino}] (${formatDateBR(afastamento.dataInicio)} a ${formatDateBR(afastamento.dataFim)})`;
                        
                        if (isExactHovered) {
                          cellStyle = "bg-red-500 text-white font-black text-center ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(239,68,68,1)] scale-[1.12] z-50 cursor-not-allowed border-2 border-emerald-400 text-[9px] uppercase tracking-tighter rounded-xs";
                        } else if (isHighlighted) {
                          cellStyle = "bg-red-600 text-white font-black text-center border-r border-red-700 ring-1 ring-emerald-400 z-20 cursor-not-allowed shadow-inner text-[9px] uppercase tracking-tighter";
                        } else {
                          cellStyle = "bg-red-600/90 text-white font-black text-center border-r border-red-700 cursor-not-allowed shadow-inner text-[9px] uppercase tracking-tighter";
                        }
                      } else {
                        content = String(folgaInfo.folga);
                        if (isExactHovered) {
                          cellStyle = "bg-emerald-400 text-slate-950 font-black ring-2 ring-emerald-300 shadow-[0_0_22px_rgba(52,211,153,0.95)] scale-[1.12] z-50 cursor-pointer border-2 border-slate-900 text-center rounded-xs";
                        } else if (isHighlighted) {
                          cellStyle = "bg-emerald-200/90 text-slate-950 font-extrabold cursor-pointer border-r border-emerald-300/80 text-center z-10 shadow-[inset_0_0_6px_rgba(52,211,153,0.25)]";
                        } else if (isFimSemana) {
                          cellStyle = "bg-rose-100/90 hover:bg-rose-200 text-rose-950 font-black cursor-pointer border-r border-rose-200/90 text-center";
                        } else {
                          cellStyle = "bg-white hover:bg-slate-100 text-slate-800 font-bold cursor-pointer border-r border-slate-200 text-center";
                        }
                      }

                      return (
                        <td 
                          key={`cell-${m.id}-${dayNum}`} 
                          onClick={() => handleCellClick(m, dayNum, cellReg, isMilitarSV)}
                          onMouseEnter={() => setHoveredCell({ militarId: m.id, dayNum })}
                          style={{
                            minWidth: `${zDay}px`,
                            width: `${zDay}px`,
                            fontSize: `${Math.max(8, Math.round(11 * tableZoom))}px`,
                            padding: `${Math.max(2, Math.round(8 * tableZoom))}px ${Math.max(1, Math.round(4 * tableZoom))}px`
                          }}
                          className={`border-b border-slate-200 text-center transition-all font-mono select-none h-10 ${cellStyle}`}
                          title={cellTooltip}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* SERVICE MODAL SELECTION (Cassineiro / Auxiliar) */}
        {serviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#070b08] border border-[#E5BA5D]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="text-center space-y-1 border-b border-[#E5BA5D]/20 pb-3">
                <h3 className="text-base font-black text-[#E5BA5D] uppercase tracking-wider">
                  {scaleConfig.id === 'cass' ? 'Atribuir Serviço de Cassineiro' : scaleConfig.id === 'aux' ? 'Atribuir Serviço de Auxiliar' : 'Atribuir Serviço de Padeiro'}
                </h3>
                <p className="text-xs text-slate-300 font-bold">
                  {serviceModal.militar.postoGraduacao} {serviceModal.militar.nomeGuerra} — Dia {serviceModal.fullDate.split('-').reverse().join('/')}
                </p>
              </div>

              <div className="space-y-2.5">
                {scaleConfig.id === 'cass' ? (
                  <>
                    <button
                      onClick={() => {
                        db.escala.saveRegistro({
                          id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                          militarId: serviceModal.militar.id,
                          data: serviceModal.fullDate,
                          situacao: 'SV',
                          funcaoId: 'f-5'
                        });
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer"
                    >
                      <span>Cassineiro dos Sgt/St (SV)</span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">Serviço normal de escala. ZERA a folga no mapa.</span>
                    </button>

                    <button
                      onClick={() => {
                        db.escala.saveRegistro({
                          id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                          militarId: serviceModal.militar.id,
                          data: serviceModal.fullDate,
                          situacao: 'SV',
                          funcaoId: 'f-4'
                        });
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer"
                    >
                      <span>Cassineiro dos Oficiais (SV - Não zera folga)</span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">Não conta escala/NÃO zera folga. Incluído no aditamento.</span>
                    </button>
                  </>
                ) : scaleConfig.id === 'aux' ? (
                  <>
                    <button
                      onClick={() => {
                        db.escala.saveRegistro({
                          id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                          militarId: serviceModal.militar.id,
                          data: serviceModal.fullDate,
                          situacao: 'SV',
                          funcaoId: 'f-3'
                        });
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer"
                    >
                      <span>Auxiliar de Cozinheiro (SV)</span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">Escala de 2 militares/dia (seg a sex). ZERA a folga.</span>
                    </button>

                    <button
                      onClick={() => {
                        db.escala.saveRegistro({
                          id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                          militarId: serviceModal.militar.id,
                          data: serviceModal.fullDate,
                          situacao: 'SV',
                          funcaoId: 'f-9'
                        });
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-teal-700 hover:bg-teal-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer"
                    >
                      <span>Lavagem dos Talheres (SV - Não zera folga)</span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">NÃO zera a folga. Incluído no aditamento.</span>
                    </button>

                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        // Escalar Semana Inteira (Padeiro Diurno)
                        const [y, m, d] = serviceModal.fullDate.split('-').map(Number);
                        const dt = new Date(y, m - 1, d);
                        const dow = dt.getDay();
                        const distToMon = dow === 0 ? -6 : 1 - dow;
                        const mon = new Date(dt);
                        mon.setDate(mon.getDate() + distToMon);

                        for (let i = 0; i < 5; i++) {
                          const wDt = new Date(mon);
                          wDt.setDate(mon.getDate() + i);
                          const ry = wDt.getFullYear();
                          const rm = String(wDt.getMonth() + 1).padStart(2, '0');
                          const rd = String(wDt.getDate()).padStart(2, '0');
                          const dateStr = `${ry}-${rm}-${rd}`;
                          const funcId = i === 4 ? 'f-7,f-8' : 'f-7';

                          db.escala.saveRegistro({
                            id: `e-sv-${serviceModal.militar.id}-${dateStr}`,
                            militarId: serviceModal.militar.id,
                            data: dateStr,
                            situacao: 'SV',
                            funcaoId: funcId
                          });
                        }
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer border border-amber-400/30"
                    >
                      <span className="flex items-center gap-1.5 text-amber-100">
                        🍞 Escalar Semana Completa (Padeiro Diurno)
                      </span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">
                        Escala Segunda a Quinta (Diurno) + Sexta-Feira (Troca Dia/Noite).
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        // Escalar Semana Inteira (Padeiro Noturno)
                        const [y, m, d] = serviceModal.fullDate.split('-').map(Number);
                        const dt = new Date(y, m - 1, d);
                        const dow = dt.getDay();
                        const distToMon = dow === 0 ? -6 : 1 - dow;
                        const mon = new Date(dt);
                        mon.setDate(mon.getDate() + distToMon);

                        for (let i = 0; i < 5; i++) {
                          const wDt = new Date(mon);
                          wDt.setDate(mon.getDate() + i);
                          const ry = wDt.getFullYear();
                          const rm = String(wDt.getMonth() + 1).padStart(2, '0');
                          const rd = String(wDt.getDate()).padStart(2, '0');
                          const dateStr = `${ry}-${rm}-${rd}`;
                          const funcId = i === 4 ? 'f-7,f-8' : 'f-8';

                          db.escala.saveRegistro({
                            id: `e-sv-${serviceModal.militar.id}-${dateStr}`,
                            militarId: serviceModal.militar.id,
                            data: dateStr,
                            situacao: 'SV',
                            funcaoId: funcId
                          });
                        }
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer border border-indigo-400/30"
                    >
                      <span className="flex items-center gap-1.5 text-indigo-100">
                        🌙 Escalar Semana Completa (Padeiro Noturno)
                      </span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">
                        Escala Segunda a Quinta (Noturno) + Sexta-Feira (Troca Dia/Noite).
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        // Troca de Sexta-Feira (Dia + Noite no mesmo militar)
                        db.escala.saveRegistro({
                          id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                          militarId: serviceModal.militar.id,
                          data: serviceModal.fullDate,
                          situacao: 'SV',
                          funcaoId: 'f-7,f-8'
                        });
                        setServiceModal(null);
                        onUpdate();
                      }}
                      className="w-full p-3.5 bg-gradient-to-r from-amber-700 to-indigo-800 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md text-left flex flex-col cursor-pointer border border-amber-300/40"
                    >
                      <span className="flex items-center gap-1.5 text-amber-200">
                        🔄 Inversão / Troca de Sexta-Feira (Dia & Noite)
                      </span>
                      <span className="text-[10px] font-medium opacity-90 mt-0.5">
                        Escala o militar como Padeiro Diurno e Noturno no dia da troca de semana (Sexta-Feira).
                      </span>
                    </button>

                    <div className="pt-1 border-t border-slate-700 flex gap-2">
                      <button
                        onClick={() => {
                          db.escala.saveRegistro({
                            id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                            militarId: serviceModal.militar.id,
                            data: serviceModal.fullDate,
                            situacao: 'SV',
                            funcaoId: 'f-7'
                          });
                          setServiceModal(null);
                          onUpdate();
                        }}
                        className="flex-1 p-2.5 bg-amber-800/80 hover:bg-amber-700 text-white font-black text-[11px] uppercase rounded-lg transition-all text-center cursor-pointer"
                      >
                        Apenas 1 Dia (Dia)
                      </button>

                      <button
                        onClick={() => {
                          db.escala.saveRegistro({
                            id: `e-sv-${serviceModal.militar.id}-${serviceModal.fullDate}`,
                            militarId: serviceModal.militar.id,
                            data: serviceModal.fullDate,
                            situacao: 'SV',
                            funcaoId: 'f-8'
                          });
                          setServiceModal(null);
                          onUpdate();
                        }}
                        className="flex-1 p-2.5 bg-indigo-900/80 hover:bg-indigo-800 text-white font-black text-[11px] uppercase rounded-lg transition-all text-center cursor-pointer"
                      >
                        Apenas 1 Dia (Noite)
                      </button>
                    </div>
                  </>
                )}

                {registroMap.get(`${serviceModal.militar.id}_${serviceModal.fullDate}`) && (
                  <button
                    onClick={() => {
                      db.escala.deleteRegistro(serviceModal.militar.id, serviceModal.fullDate);
                      setServiceModal(null);
                      onUpdate();
                    }}
                    className="w-full p-2.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-extrabold text-xs uppercase rounded-xl transition-all text-center cursor-pointer mt-2"
                  >
                    Remover Escalação Neste Dia
                  </button>
                )}

                <button
                  onClick={() => setServiceModal(null)}
                  className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-all text-center cursor-pointer mt-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE LEGEND OF ABBREVIATIONS */}
        <div className="flex flex-wrap items-center justify-start gap-4 mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600">
          <span className="font-bold text-slate-800 uppercase mr-2 flex items-center gap-1">📌 Legenda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-[#E5BA5D] text-black font-extrabold flex items-center justify-center text-[9px]">SV</span>
            <span>Serviço Ativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-rose-500 text-white font-black flex items-center justify-center text-[8px] border border-rose-600">RED</span>
            <span>Escala Vermelha (Fim de Semana / Feriado)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center justify-center text-[9px]">CUR</span>
            <span>Curso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold flex items-center justify-center text-[9px]">FÉR</span>
            <span>Férias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center justify-center text-[9px]">LIC</span>
            <span>Licença</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-red-50 text-red-700 border border-red-200 font-bold flex items-center justify-center text-[9px]">DIS</span>
            <span>Dispensa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-4 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold flex items-center justify-center text-[9px]">FOL</span>
            <span>Folga</span>
          </div>
          <div className="text-slate-500 font-mono italic ml-auto hidden sm:block">
            * Clique em uma célula livre para designar ou remover o serviço de escala.
          </div>
        </div>
      </div>

      {/* DISTRIBUTION BAR CHART */}
      <div className="bg-[#070b08]/60 backdrop-blur-md border border-[#E5BA5D]/20 p-5 rounded-2xl">
        <div className="border-b border-[#E5BA5D]/10 pb-2 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#E5BA5D]">
            Frequência de Serviços no Mês
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Distribuição para balanço e equidade de escalas.</p>
        </div>

        <div className="space-y-3.5 pr-1 max-h-[360px] overflow-y-auto">
          {militares.filter(m => m.ativo).map(m => {
            const count = stats[m.id] || 0;
            const percentage = totalDuties > 0 ? (count / totalDuties) * 100 : 0;
            return (
              <div key={m.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {m.postoGraduacao} {m.nomeGuerra.toUpperCase()}
                  </span>
                  <span className="font-mono font-bold text-[#E5BA5D]">{count} sv(s)</span>
                </div>

                <div className="w-full bg-black/60 rounded-full h-2 border border-[#E5BA5D]/10 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-[#E5BA5D] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(percentage, count > 0 ? 15 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER BACK BUTTON */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={onBack}
          className="px-8 py-3 rounded-full border border-[#E5BA5D]/30 bg-black/40 hover:bg-[#E5BA5D]/10 text-[#E5BA5D] font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para as Escalas
        </button>
      </div>

    </div>
  );
};


// ==========================================
// 3. DESTINOS VIEW component
// ==========================================
const DestinosView: React.FC<SubViewProps> = ({ selectedDate, militares, registros, userRole, onUpdate }) => {
  const [search, setSearch] = useState('');

  // Form para lançar afastamento
  const [selectedMilitarId, setSelectedMilitarId] = useState<string>(militares[0]?.id || '');
  const [selectedDestino, setSelectedDestino] = useState<string>('Disp Cmt Pel');
  const [dataInicio, setDataInicio] = useState<string>(selectedDate);
  const [dataFim, setDataFim] = useState<string>(selectedDate);
  const [observacao, setObservacao] = useState<string>('');

  // Modal para cadastrar novo destino personalizado
  const [showAddDestinoModal, setShowAddDestinoModal] = useState<boolean>(false);
  const [newDestinoInput, setNewDestinoInput] = useState<string>('');

  // Afastamentos lançados por período em estado reativo
  const [afastamentosList, setAfastamentosList] = useState<DestinoLancamento[]>(() => db.afastamentos.getAll());

  const reloadAfastamentos = () => {
    setAfastamentosList(db.afastamentos.getAll());
  };

  useEffect(() => {
    reloadAfastamentos();
  }, [selectedDate, militares, registros]);

  // Atualizar selectedMilitarId se militares mudarem
  useEffect(() => {
    if (militares.length > 0 && (!selectedMilitarId || !militares.some(m => m.id === selectedMilitarId))) {
      setSelectedMilitarId(militares[0].id);
    }
  }, [militares]);

  // Catalog de destinos
  const catalogDestinos = db.destinosCatalog.getAll();
  // Lista de destinos disponíveis para formulário
  const availableDestinos = Array.from(new Set(['Curso', 'Disp Cmt Pel', 'Disp Med', 'Férias', ...catalogDestinos]));

  const formatDateBR = (dStr: string) => {
    if (!dStr) return '';
    return dStr.split('-').reverse().join('/');
  };

  // Cadastrar novo tipo de destino no catálogo
  const handleCreateNewDestino = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem criar novos destinos.');
      return;
    }

    const trimmed = newDestinoInput.trim();
    if (!trimmed) {
      alert('Digite o nome do destino!');
      return;
    }

    db.destinosCatalog.add(trimmed);
    setSelectedDestino(trimmed);
    setNewDestinoInput('');
    setShowAddDestinoModal(false);
    onUpdate();
    alert(`Novo tipo de destino "${trimmed}" cadastrado com sucesso!`);
  };

  // Lançar destino por período
  const handleSaveAfastamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem registrar destinos.');
      return;
    }

    if (!selectedMilitarId) {
      alert('Selecione um militar!');
      return;
    }

    if (!dataInicio || !dataFim) {
      alert('Selecione as datas de início e término!');
      return;
    }

    if (dataFim < dataInicio) {
      alert('A data de término não pode ser anterior à data de início!');
      return;
    }

    const mil = militares.find(m => m.id === selectedMilitarId);
    if (!mil) return;

    // Criar o registro do afastamento no banco local
    const newAfastamento: DestinoLancamento = {
      id: `afast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      militarId: selectedMilitarId,
      destino: selectedDestino,
      dataInicio,
      dataFim,
      observacao: observacao.trim(),
      criadoEm: new Date().toISOString()
    };

    db.afastamentos.save(newAfastamento);

    // Atualiza a situação do militar para o novo destino no cadastro
    const updatedMil: Militar = { ...mil, situacaoAtual: selectedDestino as SituacaoMilitar };
    db.militares.save(updatedMil);

    // Se o militar possuía serviços agendados no período, cancela-os para evitar sobreposição
    let removedSVCount = 0;
    const allRegistros = db.escala.getAll();
    allRegistros.forEach(r => {
      if (r.militarId === selectedMilitarId && r.data >= dataInicio && r.data <= dataFim && r.situacao === 'SV') {
        db.escala.deleteRegistro(selectedMilitarId, r.data);
        removedSVCount++;
      }
    });

    reloadAfastamentos();
    onUpdate();

    alert(
      `✅ DESTINO REGISTRADO COM SUCESSO!\n\n` +
      `Militar: ${mil.postoGraduacao} ${mil.nomeGuerra}\n` +
      `Destino: ${selectedDestino}\n` +
      `Período: ${formatDateBR(dataInicio)} até ${formatDateBR(dataFim)}\n\n` +
      `O militar estará bloqueado para escalas durante todo esse período.` +
      (removedSVCount > 0 ? `\n(${removedSVCount} serviço(s) anteriormente agendado(s) no período foi/foram removido(s))` : '')
    );

    setObservacao('');
  };

  // Interromper / Cancelar afastamento
  const handleInterromper = (afastamentoId: string) => {
    if (userRole === 'guest') {
      alert('Acesso Negado: Usuários em Modo Convidado não podem alterar destinos.');
      return;
    }

    const afast = db.afastamentos.getAll().find(a => a.id === afastamentoId) || afastamentosList.find(a => a.id === afastamentoId);
    if (!afast) return;

    // 1. Apaga o registro de afastamento do banco local imediatamente
    db.afastamentos.delete(afastamentoId);

    // 2. Atualiza a situação do militar para 'Apto' no cadastro
    const mil = db.militares.getById(afast.militarId) || militares.find(m => m.id === afast.militarId);
    if (mil) {
      const updatedMil: Militar = { ...mil, situacaoAtual: 'Apto' as SituacaoMilitar };
      db.militares.save(updatedMil);
    }

    // 3. Remove registros diretos do período que não sejam serviço (SV)
    const allRegs = db.escala.getAll();
    allRegs.forEach(r => {
      if (r.militarId === afast.militarId && r.data >= afast.dataInicio && r.data <= afast.dataFim && r.situacao !== 'SV') {
        db.escala.deleteRegistro(afast.militarId, r.data);
      }
    });

    // 4. Atualização instantânea dos estados local e global
    setAfastamentosList(db.afastamentos.getAll());
    onUpdate();
  };

  // Excluir destino personalizado do catálogo
  const handleDeleteCustomDestino = (destinoName: string) => {
    if (userRole === 'guest') return;
    if (['Curso', 'Disp Cmt Pel', 'Disp Med', 'Férias'].includes(destinoName)) {
      alert('Não é possível excluir os destinos padrão do sistema.');
      return;
    }

    db.destinosCatalog.delete(destinoName);
    if (selectedDestino === destinoName) {
      setSelectedDestino('Disp Cmt Pel');
    }
    onUpdate();
  };

  const sortedMilitares = [...militares].sort((a, b) => a.antiguidade - b.antiguidade);

  const filteredMilitares = sortedMilitares.filter(
    m => m.nomeGuerra.toLowerCase().includes(search.toLowerCase()) || 
         m.postoGraduacao.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER E AÇÕES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5BA5D]/20 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E5BA5D]" />
            Módulo de Destinos e Afastamentos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lance ausências por período de datas (De / Até). O militar ficará impedido de ser escalado durante o período determinado.
          </p>
        </div>

        {userRole !== 'guest' && (
          <button
            onClick={() => setShowAddDestinoModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Criar Novo Tipo de Destino
          </button>
        )}
      </div>

      {/* MODAL / COLLAPSIBLE PARA CRIAR NOVO TIPO DE DESTINO */}
      {showAddDestinoModal && (
        <div className="bg-[#0f1712] border-2 border-[#E5BA5D]/50 rounded-2xl p-5 shadow-2xl relative animate-in fade-in duration-200">
          <button 
            onClick={() => setShowAddDestinoModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-black text-[#E5BA5D] uppercase tracking-wider flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4" /> Cadastrar Novo Tipo de Destino Disponível
          </h3>
          <p className="text-xs text-slate-300 mb-4">
            Crie um novo nome de destino (ex: <i>Dispensa Recompensa</i>, <i>Licença Maternidade</i>, <i>Missão Externa</i>). Ele se tornará uma opção permanente de seleção no formulário.
          </p>

          <form onSubmit={handleCreateNewDestino} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Digite o nome do novo destino..."
              value={newDestinoInput}
              onChange={(e) => setNewDestinoInput(e.target.value)}
              className="flex-1 bg-black/80 text-xs text-slate-100 border border-[#E5BA5D]/30 rounded-xl px-4 py-2.5 outline-none focus:border-[#E5BA5D]"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#E5BA5D] hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl shadow cursor-pointer transition-all shrink-0"
            >
              Salvar Novo Destino
            </button>
          </form>

          {/* LISTA DE DESTINOS EXISTENTES COM OPÇÃO DE EXCLUSÃO DE CUSTOMIZADOS */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 mb-2">Destinos Atualmente Cadastrados no Sistema:</p>
            <div className="flex flex-wrap gap-2">
              {availableDestinos.map(d => (
                <span 
                  key={d} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-slate-700 rounded-full text-xs font-bold text-slate-200"
                >
                  {d}
                  {!['Curso', 'Disp Cmt Pel', 'Disp Med', 'Férias'].includes(d) && userRole !== 'guest' && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteCustomDestino(d)}
                      title="Excluir este destino customizado"
                      className="text-red-400 hover:text-red-300 ml-1 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAINEL 1: FORMULÁRIO DE LANÇAMENTO DE AFASAMENOT / DESTINO POR PERÍODO */}
      <div className="bg-[#070b08]/80 border border-[#E5BA5D]/30 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-black text-[#E5BA5D] uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-[#E5BA5D]/15 pb-2.5">
          <CalendarIcon className="w-4 h-4" /> Lançar Novo Destino por Período
        </h3>

        <form onSubmit={handleSaveAfastamento} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          {/* SELEÇÃO DO MILITAR */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Militar</label>
            <select
              value={selectedMilitarId}
              onChange={(e) => setSelectedMilitarId(e.target.value)}
              className="w-full bg-black text-xs font-bold text-slate-100 border border-[#E5BA5D]/30 rounded-xl p-2.5 outline-none focus:border-[#E5BA5D]"
            >
              {sortedMilitares.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.postoGraduacao}] {m.nomeGuerra}
                </option>
              ))}
            </select>
          </div>

          {/* SELEÇÃO DO DESTINO */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Destino / Situação</label>
            <select
              value={selectedDestino}
              onChange={(e) => setSelectedDestino(e.target.value)}
              className="w-full bg-black text-xs font-bold text-amber-300 border border-[#E5BA5D]/30 rounded-xl p-2.5 outline-none focus:border-[#E5BA5D]"
            >
              {availableDestinos.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* DATA DE INÍCIO */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Data Início (De)</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-black text-xs font-bold text-slate-100 border border-[#E5BA5D]/30 rounded-xl p-2.5 outline-none focus:border-[#E5BA5D]"
            />
          </div>

          {/* DATA DE TÉRMINO */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Data Término (Até)</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-black text-xs font-bold text-slate-100 border border-[#E5BA5D]/30 rounded-xl p-2.5 outline-none focus:border-[#E5BA5D]"
            />
          </div>

          {/* BOTÃO DE SUBMISSÃO */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={userRole === 'guest'}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Lançar Destino
            </button>
          </div>

        </form>

        {/* OBSERVAÇÃO OPIONAL */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Observações adicionais (ex: 'Boletim Interno nº 120/2026', 'Atestado Médico de 10 dias')..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full bg-black/60 text-xs text-slate-300 border border-slate-800 rounded-xl px-3.5 py-1.5 outline-none focus:border-[#E5BA5D]/50"
          />
        </div>
      </div>

      {/* PAINEL 2: REGISTROS DE AFASTAMENTOS ATIVOS E BOTÃO DE INTERROMPER */}
      <div className="bg-[#070b08]/80 border border-[#E5BA5D]/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5BA5D]/15 pb-2.5">
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Afastamentos e Destinos Registrados por Período ({afastamentosList.length})
          </h3>
          <p className="text-[11px] text-slate-400">
            Clique em <b>Interromper</b> para que o militar retorne ao serviço e possa ser escalado.
          </p>
        </div>

        {afastamentosList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-black/40 rounded-xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
            <p className="text-xs font-bold text-slate-400">Nenhum militar afastado por período no momento.</p>
            <p className="text-[11px] text-slate-500 mt-1">Todos os militares do efetivo estão disponíveis ou prontos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-black/80 text-slate-400 border-b border-[#E5BA5D]/15 font-bold">
                  <th className="p-3">Militar</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Período (De / Até)</th>
                  <th className="p-3">Observação</th>
                  <th className="p-3 text-right">Ação / Interrupção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5BA5D]/10">
                {afastamentosList.map(afast => {
                  const mil = militares.find(m => m.id === afast.militarId);
                  if (!mil) return null;

                  return (
                    <tr key={afast.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-3">
                        <span className="font-bold text-[#E5BA5D]">{mil.postoGraduacao}</span>{' '}
                        <span className="font-black text-slate-100 uppercase">{mil.nomeGuerra}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-black text-[10px] uppercase">
                          {afast.destino}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        {formatDateBR(afast.dataInicio)} <span className="text-slate-500">até</span> {formatDateBR(afast.dataFim)}
                      </td>
                      <td className="p-3 text-slate-400 italic">
                        {afast.observacao || '-'}
                      </td>
                      <td className="p-3 text-right">
                        {userRole !== 'guest' && (
                          <button
                            onClick={() => handleInterromper(afast.id)}
                            className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/80 text-red-200 border border-red-500/50 hover:text-white font-extrabold text-[10px] uppercase rounded-lg shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Interromper Afastamento
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};


// ==========================================
// 4. ADITAMENTO (OFFICIAL BULLETINS) VIEW component
// ==========================================
interface AditamentoProps {
  selectedDate: string;
  militares: Militar[];
  registros: EscalaRegistro[];
  isSigned: boolean;
  setIsSigned: (val: boolean) => void;
  userRole: 'admin' | 'guest' | 'aprovisionadora';
  firestoreAditamentos?: AditamentoRecord[];
}

const BrasaoBrasilSVG: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(250,210)">
      {/* Outer Star */}
      <polygon
        points="0,-120 35,-35 113,-35 50,12 73,96 0,48 -73,96 -50,12 -113,-35 -35,-35"
        fill="#009b3a"
        stroke="#ffd700"
        strokeWidth="5"
      />
      {/* Inner Red/Blue Ring */}
      <polygon
        points="0,-100 28,-28 90,-28 40,10 58,75 0,38 -58,75 -40,10 -90,-28 -28,-28"
        fill="#d21034"
      />
      {/* Central Blue Sphere */}
      <circle cx="0" cy="0" r="44" fill="#002776" stroke="#ffffff" strokeWidth="3" />
      {/* Southern Cross Stars */}
      <circle cx="0" cy="-20" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="20" r="3.5" fill="#ffffff" />
      <circle cx="-20" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="20" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="8" cy="7" r="2" fill="#ffffff" />
      {/* Outer Ring */}
      <circle cx="0" cy="0" r="36" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 6" />
    </g>
    {/* Sword and hilt */}
    <rect x="244" y="50" width="12" height="320" fill="#a0a0a0" stroke="#000000" strokeWidth="1.5" rx="2" />
    <polygon points="250,30 232,55 268,55" fill="#ffd700" stroke="#000000" strokeWidth="1.5" />
    <rect x="220" y="365" width="60" height="14" fill="#ffd700" stroke="#000000" strokeWidth="1.5" rx="3" />
    {/* Branches */}
    <path d="M 120,290 Q 180,340 250,355 Q 320,340 380,290" fill="none" stroke="#009b3a" strokeWidth="10" strokeLinecap="round" />
    {/* Ribbon Banner */}
    <path d="M 90,360 Q 250,405 410,360 L 400,385 Q 250,430 100,385 Z" fill="#002776" stroke="#ffd700" strokeWidth="2" />
    <text x="250" y="380" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1.5">
      REPÚBLICA FEDERATIVA DO BRASIL
    </text>
  </svg>
);

const getTomorrowStr = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const ry = date.getFullYear();
  const rm = String(date.getMonth() + 1).padStart(2, '0');
  const rd = String(date.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
};

const offsetDateStr = (dateStr: string, offsetDays: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const ry = date.getFullYear();
  const rm = String(date.getMonth() + 1).padStart(2, '0');
  const rd = String(date.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
};

const AditamentoView: React.FC<AditamentoProps> = ({ selectedDate, militares, registros, isSigned, setIsSigned, userRole, firestoreAditamentos }) => {
  // Configurable Header text options
  const [omName, setOmName] = useState('7º REGIMENTO DE CAVALARIA MECANIZADO');
  const [cidadeUf, setCidadeUf] = useState('SANTANA DO LIVRAMENTO - RS');
  const [subUnidade, setSubUnidade] = useState('2º ESQUADRÃO DE CAVALARIA MECANIZADO');
  const [aprovisionadoraNome, setAprovisionadoraNome] = useState('YASMIN DE OLIVEIRA STRIEDER - ASP OF');
  const [aprovisionadoraFuncao, setAprovisionadoraFuncao] = useState('APROVISIONADORA');
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Mode selection: Escala Preta (Dia Útil) or Escala Vermelha (Feriado / Fim de Semana)
  const [scaleColorMode, setScaleColorMode] = useState<'preta' | 'vermelha'>('preta');

  // Format of Escala Vermelha: 'single' (1 dia isolado de feriado) | 'block' (Bloco de Feriados / Feriado Prolongado / Fim de semana)
  const [vermelhaType, setVermelhaType] = useState<'single' | 'block'>('block');

  // Aditamento Service Date defaults to TOMORROW relative to selectedDate
  const [aditamentoDate, setAditamentoDate] = useState<string>(() => getTomorrowStr(selectedDate));

  // Date range for Vermelha Block (default: aditamentoDate to +4 days e.g. Quinta a Segunda)
  const [vermelhaStartDate, setVermelhaStartDate] = useState<string>(() => aditamentoDate);
  const [vermelhaEndDate, setVermelhaEndDate] = useState<string>(() => offsetDateStr(aditamentoDate, 4));

  // Custom Confecção (Publication) date override
  const [customConfeccaoDate, setCustomConfeccaoDate] = useState<string | null>(null);

  // Controls visibility of calendar pickers and advanced options
  const [showCalendarPickers, setShowCalendarPickers] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Backward compatibility flag
  const isWeekendMode = scaleColorMode === 'vermelha' && vermelhaType === 'block';

  // Firebase Firestore states for monthly Aditamentos archive
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(() => aditamentoDate.substring(0, 7));
  const [savedAditamentosList, setSavedAditamentosList] = useState<AditamentoRecord[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // Requirement #2: Manual scale slot removal state
  const [removedSlots, setRemovedSlots] = useState<Record<string, boolean>>({});

  const getSlotKey = (dateStr: string, label: string) => `${dateStr}_${label}`;
  const isSlotRemoved = (dateStr: string, label: string) => !!removedSlots[getSlotKey(dateStr, label)];

  const toggleRemoveSlot = (dateStr: string, label: string) => {
    const key = getSlotKey(dateStr, label);
    setRemovedSlots(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  };

  useEffect(() => {
    const tomorrow = getTomorrowStr(selectedDate);
    setAditamentoDate(tomorrow);
    setCustomConfeccaoDate(null);

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

    if (dow === 5 || dow === 6 || dow === 0) {
      setScaleColorMode('vermelha');
      setVermelhaType('block');
      const startStr = offsetDateStr(selectedDate, 1);
      const endStr = offsetDateStr(startStr, 4);
      setVermelhaStartDate(startStr);
      setVermelhaEndDate(endStr);
    } else {
      setScaleColorMode('preta');
      setVermelhaStartDate(tomorrow);
      setVermelhaEndDate(offsetDateStr(tomorrow, 4));
    }
  }, [selectedDate]);

  // Manual input text for Partes 2, 3, and 4
  const [part2Text, setPart2Text] = useState('SEM ALTERAÇÃO');
  const [part3Text, setPart3Text] = useState('SEM ALTERAÇÃO');
  const [part4Text, setPart4Text] = useState('SEM ALTERAÇÃO');

  // Load from localStorage on aditamentoDate change
  useEffect(() => {
    const p2 = localStorage.getItem(`adit_p2_${aditamentoDate}`);
    const p3 = localStorage.getItem(`adit_p3_${aditamentoDate}`);
    const p4 = localStorage.getItem(`adit_p4_${aditamentoDate}`);

    setPart2Text(p2 !== null ? p2 : 'SEM ALTERAÇÃO');
    setPart3Text(p3 !== null ? p3 : 'SEM ALTERAÇÃO');
    setPart4Text(p4 !== null ? p4 : 'SEM ALTERAÇÃO');
  }, [aditamentoDate]);

  // Fix Issue #1: Auto-sync matching Aditamento from Firestore in real-time
  useEffect(() => {
    if (!firestoreAditamentos || firestoreAditamentos.length === 0) return;

    const recordId = `adit_${scaleColorMode}_${vermelhaType}_${aditamentoDate}`;
    const matchingRecord = firestoreAditamentos.find(
      a => a.id === recordId || a.dataServico === aditamentoDate
    );

    if (matchingRecord) {
      if (matchingRecord.omName) setOmName(matchingRecord.omName);
      if (matchingRecord.subUnidade) setSubUnidade(matchingRecord.subUnidade);
      if (matchingRecord.aprovisionadoraNome) setAprovisionadoraNome(matchingRecord.aprovisionadoraNome);
      if (matchingRecord.aprovisionadoraFuncao) setAprovisionadoraFuncao(matchingRecord.aprovisionadoraFuncao);
      if (matchingRecord.part2Text !== undefined) setPart2Text(matchingRecord.part2Text);
      if (matchingRecord.part3Text !== undefined) setPart3Text(matchingRecord.part3Text);
      if (matchingRecord.part4Text !== undefined) setPart4Text(matchingRecord.part4Text);
      setIsSigned(matchingRecord.signed);
      if (matchingRecord.customSlotNames) setCustomSlotNames(matchingRecord.customSlotNames);
      if (matchingRecord.removedSlots) setRemovedSlots(matchingRecord.removedSlots);
    }
  }, [aditamentoDate, firestoreAditamentos, scaleColorMode, vermelhaType]);

  const handlePrint = () => {
    window.print();
  };

  // Helper date info for any YYYY-MM-DD date string
  const getFormattedDateInfo = (dStr: string) => {
    const [y, m, d] = dStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return { y: 2026, m: 1, d: 1, weekdayStr: 'domingo', dateBR: dStr, monthName: 'JANEIRO' };
    }
    const dt = new Date(y, m - 1, d);
    const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    return {
      y,
      m,
      d,
      dt,
      weekdayStr: weekdays[dt.getDay()],
      dateBR: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
      monthName: months[m - 1]
    };
  };

  // List of ISO dates for Vermelha Block
  const blockDatesList = useMemo(() => {
    if (scaleColorMode !== 'vermelha' || vermelhaType !== 'block') {
      return [aditamentoDate];
    }
    const list: string[] = [];
    let curr = vermelhaStartDate;
    let count = 0;
    while (curr <= vermelhaEndDate && count < 10) {
      list.push(curr);
      curr = offsetDateStr(curr, 1);
      count++;
    }
    return list.length > 0 ? list : [vermelhaStartDate];
  }, [scaleColorMode, vermelhaType, vermelhaStartDate, vermelhaEndDate, aditamentoDate]);

  // Helper date parsing for the primary Aditamento Service Date
  const dateParts = useMemo(() => {
    const info = getFormattedDateInfo(aditamentoDate);
    const pubISO = offsetDateStr(
      scaleColorMode === 'vermelha' && vermelhaType === 'block' ? vermelhaStartDate : aditamentoDate,
      -1
    );
    const pubInfo = getFormattedDateInfo(pubISO);

    return {
      day: info.d,
      month: info.m,
      year: info.y,
      weekday: info.weekdayStr,
      dateFormatted: info.dateBR,
      pubD: String(pubInfo.d).padStart(2, '0'),
      pubM: pubInfo.monthName,
      pubM_num: String(pubInfo.m).padStart(2, '0'),
      pubY: pubInfo.y,
      pubDateStr: `${String(pubInfo.d).padStart(2, '0')} DE ${pubInfo.monthName} DE ${pubInfo.y}`,
      pubDateFormatted: `${String(pubInfo.d).padStart(2, '0')}/${String(pubInfo.m).padStart(2, '0')}/${pubInfo.y}`
    };
  }, [aditamentoDate, scaleColorMode, vermelhaType, vermelhaStartDate]);

  // Effective Confecção (Publication) Date calculation
  const effectiveConfeccaoDateStr = useMemo(() => {
    if (customConfeccaoDate) return customConfeccaoDate;
    const baseDate = (scaleColorMode === 'vermelha' && vermelhaType === 'block') ? vermelhaStartDate : aditamentoDate;
    return offsetDateStr(baseDate, -1);
  }, [customConfeccaoDate, scaleColorMode, vermelhaType, vermelhaStartDate, aditamentoDate]);

  const effectiveConfeccaoParts = useMemo(() => {
    return getFormattedDateInfo(effectiveConfeccaoDateStr);
  }, [effectiveConfeccaoDateStr]);

  // Define exact bulletin slots for full weekday/Monday scales
  const BULLETIN_ROWS = [
    { label: 'SGT DE DIA AO APROV', functionId: 'f-1', defaultName: '3º SGT ASTRIDD' },
    { label: 'COZINHEIRO DE DIA', functionId: 'f-2', defaultName: 'CB SANTO' },
    { label: 'AUX DO COZINHEIRO', functionId: 'f-3', defaultName: 'SD EP DIAS' },
    { label: 'CASSINEIRO ST/SGT', functionId: 'f-5', defaultName: 'SD EP SILVEIRA' },
    { label: 'CASSINEIRO OF', functionId: 'f-4', defaultName: 'SD EP ANTHONY' },
    { label: 'PADEIRO DA NOITE', functionId: 'f-8', defaultName: 'SD EP ERICK TEIXEIRA' },
    { label: 'PADEIRO DE DIA', functionId: 'f-7', defaultName: 'SD EP TEODORO' },
    { label: 'LAVAGEM DOS TALHERES', functionId: 'f-9', defaultName: 'SD EP AZEVEDO' },
  ];

  // Define weekend-specific slots (Sábado & Domingo: Sgt Dia Aprov, Cozinheiro, Aux Cozinheiro, Cassineiro Sgt, Padeiro Noite, Lavagem dos Talheres)
  const WEEKEND_SLOTS = [
    { label: 'SGT DE DIA AO APROV', functionId: 'f-1', defaultName: '3º SGT ASTRIDD' },
    { label: 'COZINHEIRO DE DIA', functionId: 'f-2', defaultName: 'CB SANTO' },
    { label: 'AUX DO COZINHEIRO', functionId: 'f-3', defaultName: 'SD EP DIAS', max: 1 },
    { label: 'CASSINEIRO ST/SGT', functionId: 'f-5', defaultName: 'SD EP SILVEIRA' },
    { label: 'PADEIRO DA NOITE', functionId: 'f-8', defaultName: 'SD EP ERICK TEIXEIRA' },
    { label: 'LAVAGEM DOS TALHERES', functionId: 'f-9', defaultName: 'SD EP AZEVEDO' },
  ];

  // Custom text overrides for each slot if needed
  const [customSlotNames, setCustomSlotNames] = useState<Record<string, string>>({});

  const getAssignedMilitaryName = (row: typeof BULLETIN_ROWS[0], targetDate: string = aditamentoDate, maxCount?: number) => {
    const customKey = `${targetDate}_${row.label}`;
    if (customSlotNames[customKey] !== undefined) {
      return customSlotNames[customKey];
    }
    // Find all registrations in database for targetDate with this functionId (or combined function like f-7,f-8)
    const regs = registros.filter(r => r.data === targetDate && r.situacao === 'SV' && (r.funcaoId === row.functionId || r.funcaoId?.includes(row.functionId)));
    if (regs.length > 0) {
      let names = regs
        .map(reg => {
          const mil = militares.find(m => m.id === reg.militarId);
          return mil ? `${mil.postoGraduacao} ${mil.nomeGuerra}`.toUpperCase() : null;
        })
        .filter(Boolean) as string[];

      if (maxCount && names.length > maxCount) {
        names = names.slice(0, maxCount);
      }

      if (names.length > 0) {
        return names.join(' / ');
      }
    }
    return row.defaultName;
  };

  const getRemovedSlotsForCurrentDates = () => {
    const dates = scaleColorMode === 'vermelha' && vermelhaType === 'block' ? blockDatesList : [aditamentoDate];
    const list: Array<{ date: string; label: string }> = [];
    const allSlots = BULLETIN_ROWS.concat(WEEKEND_SLOTS);
    const uniqueLabels = Array.from(new Set(allSlots.map(s => s.label)));

    dates.forEach(d => {
      uniqueLabels.forEach(lbl => {
        if (isSlotRemoved(d, lbl)) {
          list.push({ date: d, label: lbl });
        }
      });
    });
    return list;
  };

  // Handle saving current Aditamento to Firestore
  const handleSaveToFirestore = async () => {
    setIsSavingToFirestore(true);
    setSaveStatusMessage(null);

    try {
      const monthKey = aditamentoDate.substring(0, 7); // e.g. "2026-07"
      const recordId = `adit_${scaleColorMode}_${vermelhaType}_${aditamentoDate}`;

      let compiledEscalas: Array<{ dia?: string; label: string; militarName: string }> = [];

      if (scaleColorMode === 'preta') {
        compiledEscalas = BULLETIN_ROWS
          .filter(row => !isSlotRemoved(aditamentoDate, row.label))
          .map(row => ({
            dia: dateParts.dateFormatted,
            label: row.label,
            militarName: getAssignedMilitaryName(row, aditamentoDate)
          }));
      } else if (scaleColorMode === 'vermelha' && vermelhaType === 'single') {
        compiledEscalas = WEEKEND_SLOTS
          .filter(row => !isSlotRemoved(aditamentoDate, row.label))
          .map(row => ({
            dia: `${dateParts.dateFormatted} (${dateParts.weekday.toUpperCase()} - FERIADO)`,
            label: row.label,
            militarName: getAssignedMilitaryName(row, aditamentoDate, row.max)
          }));
      } else {
        // Bloco de feriados / Fim de semana
        blockDatesList.forEach((dIso, idx) => {
          const isLast = idx === blockDatesList.length - 1;
          const dInfo = getFormattedDateInfo(dIso);
          const slots = isLast ? BULLETIN_ROWS : WEEKEND_SLOTS;
          const dayTag = isLast ? 'COMPLETA' : 'FERIADO/ESCALA VERMELHA';
          
          slots
            .filter(row => !isSlotRemoved(dIso, row.label))
            .forEach(row => {
              const maxVal = 'max' in row ? (row as { max?: number }).max : undefined;
              compiledEscalas.push({
                dia: `${dInfo.dateBR} (${dInfo.weekdayStr.toUpperCase()} - ${dayTag})`,
                label: row.label,
                militarName: getAssignedMilitaryName(row, dIso, maxVal)
              });
            });
        });
      }

      const record: AditamentoRecord = {
        id: recordId,
        mesAno: monthKey,
        dataServico: aditamentoDate,
        tipo: scaleColorMode === 'vermelha' ? 'fim_de_semana' : 'dia_util',
        scaleColorMode,
        vermelhaType,
        omName,
        subUnidade,
        aprovisionadoraNome,
        aprovisionadoraFuncao,
        part2Text,
        part3Text,
        part4Text,
        escalas: compiledEscalas,
        customSlotNames,
        removedSlots,
        signed: isSigned,
        createdAt: new Date().toISOString()
      };

      await saveAditamentoToFirestore(record);
      setSaveStatusMessage(`✅ Aditamento de ${dateParts.dateFormatted} gravado no Firebase no histórico de ${monthKey.split('-').reverse().join('/')}!`);
      setTimeout(() => setSaveStatusMessage(null), 6000);
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
      setSaveStatusMessage('❌ Falha ao salvar no Firebase. Verifique a conexão.');
      setTimeout(() => setSaveStatusMessage(null), 6000);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  const handleToggleSigned = async () => {
    const nextSigned = !isSigned;
    setIsSigned(nextSigned);

    try {
      const monthKey = aditamentoDate.substring(0, 7);
      const recordId = `adit_${scaleColorMode}_${vermelhaType}_${aditamentoDate}`;

      let compiledEscalas: Array<{ dia?: string; label: string; militarName: string }> = [];

      if (scaleColorMode === 'preta') {
        compiledEscalas = BULLETIN_ROWS
          .filter(row => !isSlotRemoved(aditamentoDate, row.label))
          .map(row => ({
            dia: dateParts.dateFormatted,
            label: row.label,
            militarName: getAssignedMilitaryName(row, aditamentoDate)
          }));
      } else if (scaleColorMode === 'vermelha' && vermelhaType === 'single') {
        compiledEscalas = WEEKEND_SLOTS
          .filter(row => !isSlotRemoved(aditamentoDate, row.label))
          .map(row => ({
            dia: `${dateParts.dateFormatted} (${dateParts.weekday.toUpperCase()} - FERIADO)`,
            label: row.label,
            militarName: getAssignedMilitaryName(row, aditamentoDate, row.max)
          }));
      } else {
        blockDatesList.forEach((dIso, idx) => {
          const isLast = idx === blockDatesList.length - 1;
          const dInfo = getFormattedDateInfo(dIso);
          const slots = isLast ? BULLETIN_ROWS : WEEKEND_SLOTS;
          const dayTag = isLast ? 'COMPLETA' : 'FERIADO/ESCALA VERMELHA';

          slots
            .filter(row => !isSlotRemoved(dIso, row.label))
            .forEach(row => {
              const maxVal = 'max' in row ? (row as { max?: number }).max : undefined;
              compiledEscalas.push({
                dia: `${dInfo.dateBR} (${dInfo.weekdayStr.toUpperCase()} - ${dayTag})`,
                label: row.label,
                militarName: getAssignedMilitaryName(row, dIso, maxVal)
              });
            });
        });
      }

      const record: AditamentoRecord = {
        id: recordId,
        mesAno: monthKey,
        dataServico: aditamentoDate,
        tipo: scaleColorMode === 'vermelha' ? 'fim_de_semana' : 'dia_util',
        scaleColorMode,
        vermelhaType,
        omName,
        subUnidade,
        aprovisionadoraNome,
        aprovisionadoraFuncao,
        part2Text,
        part3Text,
        part4Text,
        escalas: compiledEscalas,
        customSlotNames,
        removedSlots,
        signed: nextSigned,
        createdAt: new Date().toISOString()
      };

      await saveAditamentoToFirestore(record);
    } catch (err) {
      console.error('Erro ao atualizar assinatura no Firestore:', err);
    }
  };

  // Fetch saved aditamentos for selected month
  const fetchArchiveByMonth = async (targetMonth: string) => {
    setIsLoadingArchive(true);
    try {
      const list = await getAditamentosByMonthFromFirestore(targetMonth);
      setSavedAditamentosList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleOpenArchive = () => {
    setIsArchiveModalOpen(true);
    const monthKey = aditamentoDate.substring(0, 7);
    setFilterMonth(monthKey);
    fetchArchiveByMonth(monthKey);
  };

  const handleLoadFromArchive = (item: AditamentoRecord) => {
    setAditamentoDate(item.dataServico);
    setScaleColorMode(item.tipo === 'fim_de_semana' ? 'vermelha' : 'preta');
    setOmName(item.omName || '7º REGIMENTO DE CAVALARIA MECANIZADO');
    setSubUnidade(item.subUnidade || '2º ESQUADRÃO DE CAVALARIA MECANIZADO');
    setAprovisionadoraNome(item.aprovisionadoraNome || 'YASMIN DE OLIVEIRA STRIEDER - ASP OF');
    setAprovisionadoraFuncao(item.aprovisionadoraFuncao || 'APROVISIONADORA');
    setPart2Text(item.part2Text || 'SEM ALTERAÇÃO');
    setPart3Text(item.part3Text || 'SEM ALTERAÇÃO');
    setPart4Text(item.part4Text || 'SEM ALTERAÇÃO');
    setIsSigned(item.signed);
    setIsArchiveModalOpen(false);
    alert(`Aditamento de ${item.dataServico.split('-').reverse().join('/')} carregado do Firebase com sucesso!`);
  };

  const handleDeleteFromArchive = async (id: string, dataServico: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o aditamento de ${dataServico.split('-').reverse().join('/')} do Firebase?`)) return;
    try {
      await deleteAditamentoFromFirestore(id);
      await fetchArchiveByMonth(filterMonth);
    } catch (err) {
      alert('Erro ao excluir aditamento do Firebase.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* APROVISIONADORA SPECIFIC PERMISSION BANNER */}
      {userRole === 'aprovisionadora' && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-emerald-200 text-xs font-semibold print:hidden shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/90 border border-emerald-500/60 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-black text-white uppercase text-sm block tracking-wide">
                Usuário Autenticado: ASP OF STRIEDER — APROVISIONADORA
              </span>
              <span className="text-[11px] text-emerald-300">
                Acesso ativado exclusivamente para: <strong>Leitura do Aditamento</strong>, <strong>Assinatura Digital Eletrônica</strong> e <strong>Impressão em PDF</strong>.
              </span>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-emerald-900 border border-emerald-500/70 text-emerald-200 text-[10px] font-black uppercase rounded-full shrink-0 shadow-sm">
            Acesso Aprovisionadora Ativo
          </span>
        </div>
      )}

      {/* FIREBASE SAVE BANNER NOTIFICATION */}
      {saveStatusMessage && (
        <div className="bg-[#0a130c] border-2 border-emerald-500/80 text-emerald-300 p-3.5 rounded-2xl text-xs font-black shadow-xl flex items-center justify-between animate-fade-in print:hidden">
          <span className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            {saveStatusMessage}
          </span>
          <button onClick={() => setSaveStatusMessage(null)} className="text-zinc-400 hover:text-white font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* 1. SELEÇÃO DA ESCALA (VERMELHA vs PRETA) CENTRALIZADA E COM MAIOR DESTAQUE VISUAL */}
      <div className="bg-[#0a130c] border border-[#1e3423] p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-4 print:hidden">
        <span className="text-xs font-black uppercase tracking-widest text-[#E5BA5D] flex items-center gap-2">
          <Shield className="w-4 h-4" /> Seleção do Tipo de Escala
        </span>

        <div className="inline-flex p-1.5 bg-[#121f15] border border-[#1e3423] rounded-2xl shadow-inner gap-2 w-full max-w-lg">
          <button
            onClick={() => setScaleColorMode('preta')}
            className={`flex-1 py-3.5 px-4 rounded-xl text-xs md:text-sm font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              scaleColorMode === 'preta'
                ? 'bg-zinc-800 text-white border border-zinc-500 shadow-lg ring-2 ring-zinc-400 scale-[1.02]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#182a1d]'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-zinc-200 border border-zinc-500 inline-block shadow-sm"></span>
            ⚫ Escala Preta (Dia Útil)
          </button>

          <button
            onClick={() => setScaleColorMode('vermelha')}
            className={`flex-1 py-3.5 px-4 rounded-xl text-xs md:text-sm font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
              scaleColorMode === 'vermelha'
                ? 'bg-red-700 text-white border border-red-400 shadow-lg ring-2 ring-red-400 scale-[1.02]'
                : 'text-zinc-400 hover:text-red-300 hover:bg-[#182a1d]'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse inline-block shadow-sm"></span>
            🔴 Escala Vermelha (Feriado)
          </button>
        </div>
      </div>

      {/* 2. DATAS (HOJE / SERVIÇO) COM BOTÃO DISCRETO "Alterar datas" E CALENDÁRIOS OCULTOS INICIALMENTE */}
      <div className="bg-[#0a130c] border border-[#1e3423] p-5 rounded-3xl shadow-xl space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Hoje:</span>
              <span className="font-black text-white bg-[#142318] px-3.5 py-1.5 rounded-xl border border-[#243f2a]">
                {effectiveConfeccaoParts.dateBR}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Serviço:</span>
              <span className="font-black text-[#E5BA5D] bg-[#142318] px-3.5 py-1.5 rounded-xl border border-[#243f2a]">
                {scaleColorMode === 'vermelha' && vermelhaType === 'block'
                  ? `${getFormattedDateInfo(vermelhaStartDate).dateBR} até ${getFormattedDateInfo(vermelhaEndDate).dateBR}`
                  : getFormattedDateInfo(aditamentoDate).dateBR}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCalendarPickers(!showCalendarPickers)}
            className="px-4 py-2 bg-[#142318] hover:bg-[#1a2d1f] text-zinc-300 hover:text-white border border-[#243f2a] hover:border-[#E5BA5D]/60 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#E5BA5D]" />
            <span>{showCalendarPickers ? 'Ocultar Calendários' : 'Alterar datas'}</span>
          </button>
        </div>

        {/* CALENDÁRIOS E PRESETS (SÓ SÃO EXIBIDOS QUANDO "Alterar datas" É CLICADO) */}
        {showCalendarPickers && (
          <div className="pt-4 border-t border-[#1e3423] space-y-4 animate-in fade-in duration-200">
            {scaleColorMode === 'vermelha' && (
              <div className="bg-red-950/40 border border-red-800/60 p-3.5 rounded-2xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-black text-red-200 text-xs">🔴 Formato da Escala Vermelha:</span>
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-red-800/80">
                    <button
                      onClick={() => setVermelhaType('single')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                        vermelhaType === 'single' ? 'bg-red-600 text-white shadow' : 'text-red-300 hover:text-white'
                      }`}
                    >
                      📌 1 Dia Isolado
                    </button>
                    <button
                      onClick={() => setVermelhaType('block')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                        vermelhaType === 'block' ? 'bg-red-600 text-white shadow' : 'text-red-300 hover:text-white'
                      }`}
                    >
                      📅 Bloco / Feriado Prolongado
                    </button>
                  </div>
                </div>

                {vermelhaType === 'block' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1.5 rounded-xl border border-red-800">
                      <span className="text-zinc-300 font-extrabold text-[11px]">De:</span>
                      <input
                        type="date"
                        value={vermelhaStartDate}
                        onChange={(e) => {
                          const start = e.target.value;
                          if (!start) return;
                          setVermelhaStartDate(start);
                          if (start > vermelhaEndDate) setVermelhaEndDate(offsetDateStr(start, 4));
                        }}
                        className="bg-red-950 text-amber-300 border border-red-700 rounded px-2 py-0.5 font-bold outline-none cursor-pointer text-xs"
                      />
                    </div>

                    <span className="text-red-400 font-extrabold text-xs">➔</span>

                    <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1.5 rounded-xl border border-red-800">
                      <span className="text-zinc-300 font-extrabold text-[11px]">Até:</span>
                      <input
                        type="date"
                        value={vermelhaEndDate}
                        onChange={(e) => {
                          if (e.target.value) setVermelhaEndDate(e.target.value);
                        }}
                        className="bg-red-950 text-amber-300 border border-red-700 rounded px-2 py-0.5 font-bold outline-none cursor-pointer text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const [y, m, d] = aditamentoDate.split('-').map(Number);
                          const dt = new Date(y, m - 1, d);
                          const dow = dt.getDay();
                          let thuDate = new Date(dt);
                          if (dow !== 4) {
                            const distToThu = (4 - dow + 7) % 7;
                            thuDate.setDate(thuDate.getDate() + (distToThu === 0 ? -7 : distToThu));
                          }
                          const ry = thuDate.getFullYear();
                          const rm = String(thuDate.getMonth() + 1).padStart(2, '0');
                          const rd = String(thuDate.getDate()).padStart(2, '0');
                          const startStr = `${ry}-${rm}-${rd}`;
                          setVermelhaStartDate(startStr);
                          setVermelhaEndDate(offsetDateStr(startStr, 4));
                        }}
                        className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 border border-red-600 text-amber-200 text-[10px] font-black rounded-lg cursor-pointer"
                      >
                        ⚡ Quinta ➔ Segunda (5 dias)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const [y, m, d] = aditamentoDate.split('-').map(Number);
                          const dt = new Date(y, m - 1, d);
                          const dow = dt.getDay();
                          let sabDate = new Date(dt);
                          if (dow === 0) sabDate.setDate(sabDate.getDate() - 1);
                          else if (dow !== 6) sabDate.setDate(sabDate.getDate() + (6 - dow));
                          const ry = sabDate.getFullYear();
                          const rm = String(sabDate.getMonth() + 1).padStart(2, '0');
                          const rd = String(sabDate.getDate()).padStart(2, '0');
                          const startStr = `${ry}-${rm}-${rd}`;
                          setVermelhaStartDate(startStr);
                          setVermelhaEndDate(offsetDateStr(startStr, 2));
                        }}
                        className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 border border-red-600 text-amber-200 text-[10px] font-black rounded-lg cursor-pointer"
                      >
                        ⚡ Sábado ➔ Segunda (3 dias)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121f15] p-3 rounded-2xl border border-[#1e3423]">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/80 p-1.5 rounded-xl border border-zinc-800">
                  <span className="font-bold text-zinc-300 text-[11px]">
                    📝 Confecção (Publicado em):
                  </span>
                  <input
                    type="date"
                    value={effectiveConfeccaoDateStr}
                    onChange={(e) => setCustomConfeccaoDate(e.target.value)}
                    className="bg-zinc-900 text-amber-300 border border-zinc-700 rounded px-2 py-1 font-bold outline-none focus:border-[#E5BA5D] cursor-pointer text-xs"
                  />
                </div>

                {!(scaleColorMode === 'vermelha' && vermelhaType === 'block') && (
                  <div className="flex items-center gap-1.5 bg-black/80 p-1.5 rounded-xl border border-zinc-800">
                    <span className="font-extrabold text-[#E5BA5D] text-[11px]">
                      ⚔️ Dia do Serviço:
                    </span>
                    <input
                      type="date"
                      value={aditamentoDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (!newDate) return;
                        setAditamentoDate(newDate);
                        setCustomConfeccaoDate(null);
                      }}
                      className="bg-zinc-900 text-amber-300 border border-[#E5BA5D]/50 rounded px-2 py-1 font-bold outline-none focus:border-[#E5BA5D] cursor-pointer text-xs"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = getTomorrowStr(selectedDate);
                    setAditamentoDate(tomorrow);
                    setCustomConfeccaoDate(null);
                  }}
                  className="px-2.5 py-1.5 bg-[#E5BA5D]/20 hover:bg-[#E5BA5D]/30 border border-[#E5BA5D]/50 text-[#FFF2BF] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  ⚡ Hoje (Serviço Amanhã)
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAditamentoDate(offsetDateStr(aditamentoDate, -1));
                      setCustomConfeccaoDate(null);
                    }}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg font-mono font-bold text-xs cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAditamentoDate(offsetDateStr(aditamentoDate, 1));
                      setCustomConfeccaoDate(null);
                    }}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg font-mono font-bold text-xs cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. DADOS DA ORGANIZAÇÃO MILITAR (COM BOTÃO "EDITAR DADOS" DESTACADO) */}
      <div className="bg-[#0a130c] border border-[#1e3423] p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#E5BA5D]" /> Dados da Organização Militar
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {omName} — {subUnidade}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="px-4 py-2.5 bg-[#142318] hover:bg-[#1a2d1f] border border-[#243f2a] hover:border-[#E5BA5D]/60 text-zinc-200 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <Edit3 className="w-4 h-4 text-[#E5BA5D]" />
            <span>{isEditingHeader ? 'Fechar Edição' : 'Editar Dados'}</span>
          </button>
        )}
      </div>

      {/* PAINEL EXPANSÍVEL DE EDIÇÃO DE CABEÇALHO E PARTES */}
      {isEditingHeader && (
        <div className="bg-[#0a130c] border border-[#E5BA5D]/30 p-5 rounded-3xl space-y-4 text-xs print:hidden animate-in fade-in duration-200 shadow-xl">
          <h3 className="font-black text-[#E5BA5D] uppercase text-xs tracking-wider border-b border-[#1e3423] pb-2">
            Personalizar Cabeçalho do Documento Oficial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 font-bold block mb-1">Organização Militar (OM)</label>
              <input
                type="text"
                value={omName}
                onChange={(e) => setOmName(e.target.value)}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D]"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-bold block mb-1">Cidade e UF</label>
              <input
                type="text"
                value={cidadeUf}
                onChange={(e) => setCidadeUf(e.target.value)}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D]"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-bold block mb-1">Nome e Posto do Aprovisionador(a)</label>
              <input
                type="text"
                value={aprovisionadoraNome}
                onChange={(e) => setAprovisionadoraNome(e.target.value)}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D]"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-bold block mb-1">Função</label>
              <input
                type="text"
                value={aprovisionadoraFuncao}
                onChange={(e) => setAprovisionadoraFuncao(e.target.value)}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D]"
              />
            </div>
          </div>

          <h3 className="font-black text-[#E5BA5D] uppercase text-xs tracking-wider border-b border-[#1e3423] pb-2 pt-2">
            Texto das Partes (2ª, 3ª e 4ª Partes do Aditamento)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-zinc-300 font-bold block mb-1 uppercase">2ª PARTE: INSTRUÇÃO</label>
              <textarea
                rows={3}
                value={part2Text}
                onChange={(e) => {
                  setPart2Text(e.target.value);
                  localStorage.setItem(`adit_p2_${aditamentoDate}`, e.target.value);
                }}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D] resize-y"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-300 font-bold block mb-1 uppercase">3ª PARTE: ASSUNTOS GERAIS E ADMIN.</label>
              <textarea
                rows={3}
                value={part3Text}
                onChange={(e) => {
                  setPart3Text(e.target.value);
                  localStorage.setItem(`adit_p3_${aditamentoDate}`, e.target.value);
                }}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D] resize-y"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-300 font-bold block mb-1 uppercase">4ª PARTE: JUSTIÇA E DISCIPLINA</label>
              <textarea
                rows={3}
                value={part4Text}
                onChange={(e) => {
                  setPart4Text(e.target.value);
                  localStorage.setItem(`adit_p4_${aditamentoDate}`, e.target.value);
                }}
                className="w-full bg-black text-zinc-100 border border-zinc-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#E5BA5D] resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. AÇÃO PRINCIPAL DA TELA — GERAR ADITAMENTO (IMPRIMIR / PDF) */}
      <div className="flex flex-col items-center justify-center py-4 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full max-w-xl py-4.5 px-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-base md:text-lg uppercase tracking-wider rounded-2xl shadow-[0_10px_35px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_45px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3.5 border border-emerald-400/40"
        >
          <Printer className="w-7 h-7 text-white shrink-0" />
          <span>GERAR ADITAMENTO (IMPRIMIR / PDF)</span>
        </button>
      </div>

      {/* 5. OPÇÕES AVANÇADAS (BOTÕES SECUNDÁRIOS AGRUPADOS) */}
      <div className="bg-[#0a130c] border border-[#1e3423] p-4 rounded-3xl shadow-xl print:hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="w-full flex items-center justify-between text-xs font-black text-zinc-300 hover:text-white uppercase tracking-wider cursor-pointer py-1"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#E5BA5D]" />
            Opções Avançadas
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`} />
        </button>

        {showAdvancedOptions && (
          <div className="mt-4 pt-4 border-t border-[#1e3423] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* Assinar Digitalmente */}
            {userRole !== 'guest' && (
              <button
                onClick={handleToggleSigned}
                className={`w-full py-3 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSigned 
                    ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300 shadow' 
                    : 'bg-[#E5BA5D]/20 border border-[#E5BA5D]/50 text-[#FFF2BF] hover:bg-[#E5BA5D]/30 shadow'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#E5BA5D]" />
                <span>
                  {isSigned 
                    ? (userRole === 'aprovisionadora' ? 'Assinado (Asp Of Strieder)' : 'Assinado Digitalmente')
                    : (userRole === 'aprovisionadora' ? 'Assinar como Aprovisionadora' : 'Assinar Digitalmente')}
                </span>
              </button>
            )}

            {/* Salvar no Firebase */}
            <button
              onClick={handleSaveToFirestore}
              disabled={isSavingToFirestore}
              className="w-full py-3 px-4 bg-[#142318] hover:bg-[#1a2d1f] border border-[#243f2a] text-zinc-200 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>{isSavingToFirestore ? 'Gravando...' : 'Salvar no Firebase'}</span>
            </button>

            {/* Histórico por Mês */}
            <button
              onClick={handleOpenArchive}
              className="w-full py-3 px-4 bg-[#142318] hover:bg-[#1a2d1f] border border-[#243f2a] text-zinc-200 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span>Histórico por Mês</span>
            </button>
          </div>
        )}
      </div>

      {/* MILITARY BULLETIN SHEET - EXACT FORMAT FROM PDF REFERENCE */}
      <div className="bg-white text-black p-8 md:p-12 shadow-2xl max-w-3xl mx-auto font-serif relative overflow-hidden border border-slate-300 print:border-0 print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        
        {/* HEADER DOCUMENT */}
        <div className="text-center font-sans uppercase font-bold text-xs md:text-sm space-y-1 tracking-normal leading-tight text-black pt-2">
          <p className="font-extrabold">{omName}</p>
          <p className="font-bold">SERVIÇO DE APROVISIONAMENTO</p>
          <p className="font-bold">
            ADITAMENTO AO BOLETIM INTERNO {scaleColorMode === 'vermelha' ? '(ESCALA VERMELHA)' : '(ESCALA PRETA)'}
          </p>
          <p className="text-[10px] font-semibold pt-1">
            PARA O CONHECIMENTO DO SERVIÇO DE APROVISIONAMENTO
          </p>
          <p className="text-[10px] font-semibold">
            E DEVIDA EXECUÇÃO PUBLICO O SEGUINTE:
          </p>
        </div>

        {/* MANUAL REMOVED SLOTS RESTORE BANNER */}
        {getRemovedSlotsForCurrentDates().length > 0 && (
          <div className="mt-4 bg-amber-950/80 border border-amber-500/50 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 print:hidden shadow-lg">
            <span className="font-extrabold flex items-center gap-1.5">
              🗑️ Escalas Removidas do Aditamento ({getRemovedSlotsForCurrentDates().length}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {getRemovedSlotsForCurrentDates().map(({ date, label }) => (
                <button
                  key={`${date}_${label}`}
                  onClick={() => toggleRemoveSlot(date, label)}
                  className="px-2 py-0.5 bg-amber-900/90 hover:bg-amber-800 border border-amber-500 text-amber-100 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  title="Clique para restaurar esta escala no aditamento"
                >
                  <span>{label} ({date.split('-').reverse().slice(0, 2).join('/')})</span>
                  <span className="text-amber-300 font-black">✕ Restaurar</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TABLES SECTION - ESCALA PRETA VS ESCALA VERMELHA (SINGLE OR BLOCK) */}
        {scaleColorMode === 'preta' ? (
          /* ESCALA PRETA (SINGLE DIA ÚTIL) */
          <div className="mt-6 border-2 border-black font-sans text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-bold uppercase text-[11px] text-black">
                  <th className="p-2 border-r-2 border-black w-3/5 text-center bg-slate-50 print:bg-transparent">
                    ESCALA DE SERVIÇO PARA O DIA
                  </th>
                  <th className="p-2 border-r-2 border-black text-center bg-slate-50 print:bg-transparent w-1/5">
                    {dateParts.dateFormatted}
                  </th>
                  <th className="p-2 text-center bg-slate-50 print:bg-transparent w-1/5 font-semibold lowercase">
                    {dateParts.weekday}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-bold uppercase text-[11px] text-black">
                {BULLETIN_ROWS.filter(row => isEditingHeader || userRole === 'admin' || !isSlotRemoved(aditamentoDate, row.label)).map((row, idx) => {
                  const assignedVal = getAssignedMilitaryName(row, aditamentoDate);
                  const removed = isSlotRemoved(aditamentoDate, row.label);

                  return (
                    <tr key={idx} className={`border-b border-black ${removed ? 'bg-red-100/60 line-through opacity-60 print:hidden' : ''}`}>
                      <td className="p-2.5 border-r-2 border-black font-extrabold text-black tracking-wide flex items-center justify-between gap-2">
                        <span>{row.label}</span>
                        {(isEditingHeader || userRole === 'admin') && (
                          <button
                            type="button"
                            onClick={() => toggleRemoveSlot(aditamentoDate, row.label)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer print:hidden no-underline transition-all ${
                              removed ? 'bg-emerald-700 text-white' : 'bg-red-800 hover:bg-red-700 text-white'
                            }`}
                            title={removed ? 'Restaurar esta escala no aditamento' : 'Remover esta escala do aditamento'}
                          >
                            {removed ? 'Restaurar' : 'Remover'}
                          </button>
                        )}
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-black tracking-wider text-center bg-slate-50/40 print:bg-transparent">
                        {isEditingHeader ? (
                          <input
                            type="text"
                            value={assignedVal}
                            onChange={(e) => setCustomSlotNames({ ...customSlotNames, [`${aditamentoDate}_${row.label}`]: e.target.value.toUpperCase() })}
                            className="w-full bg-amber-50 border border-amber-300 p-1 text-xs uppercase font-bold text-center outline-none"
                          />
                        ) : (
                          assignedVal
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : vermelhaType === 'single' ? (
          /* ESCALA VERMELHA - 1 DIA ISOLADO DE FERIADO */
          <div className="mt-6 border-2 border-black font-sans text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-bold uppercase text-[11px] text-black bg-red-50/50 print:bg-transparent">
                  <th className="p-2 border-r-2 border-black w-3/5 text-center">
                    ESCALA DE SERVIÇO PARA O DIA (FERIADO / ESCALA VERMELHA)
                  </th>
                  <th className="p-2 border-r-2 border-black text-center w-1/5">
                    {dateParts.dateFormatted}
                  </th>
                  <th className="p-2 text-center w-1/5 font-bold uppercase">
                    {dateParts.weekday}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-bold uppercase text-[11px] text-black">
                {WEEKEND_SLOTS.filter(row => isEditingHeader || userRole === 'admin' || !isSlotRemoved(aditamentoDate, row.label)).map((row, idx) => {
                  const assignedVal = getAssignedMilitaryName(row, aditamentoDate, row.max);
                  const removed = isSlotRemoved(aditamentoDate, row.label);

                  return (
                    <tr key={`single-red-${idx}`} className={`border-b border-black ${removed ? 'bg-red-100/60 line-through opacity-60 print:hidden' : ''}`}>
                      <td className="p-2.5 border-r-2 border-black font-extrabold text-black tracking-wide flex items-center justify-between gap-2">
                        <span>{row.label}</span>
                        {(isEditingHeader || userRole === 'admin') && (
                          <button
                            type="button"
                            onClick={() => toggleRemoveSlot(aditamentoDate, row.label)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer print:hidden no-underline transition-all ${
                              removed ? 'bg-emerald-700 text-white' : 'bg-red-800 hover:bg-red-700 text-white'
                            }`}
                            title={removed ? 'Restaurar esta escala no aditamento' : 'Remover esta escala do aditamento'}
                          >
                            {removed ? 'Restaurar' : 'Remover'}
                          </button>
                        )}
                      </td>
                      <td colSpan={2} className="p-2.5 font-black text-black tracking-wider text-center bg-slate-50/40 print:bg-transparent">
                        {isEditingHeader ? (
                          <input
                            type="text"
                            value={assignedVal}
                            onChange={(e) => setCustomSlotNames({ ...customSlotNames, [`${aditamentoDate}_${row.label}`]: e.target.value.toUpperCase() })}
                            className="w-full bg-amber-50 border border-amber-300 p-1 text-xs uppercase font-bold text-center outline-none"
                          />
                        ) : (
                          assignedVal
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ESCALA VERMELHA - BLOCO DE FERIADOS / FERIADO PROLONGADO / FIM DE SEMANA */
          <div className="mt-6 space-y-6 font-sans text-xs">
            {blockDatesList.map((dIso, bIdx) => {
              const dInfo = getFormattedDateInfo(dIso);
              const isLastDay = bIdx === blockDatesList.length - 1;
              const slots = isLastDay ? BULLETIN_ROWS : WEEKEND_SLOTS;

              return (
                <div key={`block-${dIso}-${bIdx}`} className="border-2 border-black">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black font-bold uppercase text-[11px] text-black bg-slate-100 print:bg-transparent">
                        <th className="p-2 border-r-2 border-black w-3/5 text-center">
                          ESCALA DE SERVIÇO PARA {dInfo.weekdayStr.toUpperCase()} {isLastDay ? '(COMPLETA)' : '(FERIADO/ESCALA VERMELHA)'}
                        </th>
                        <th className="p-2 text-center w-2/5">
                          {dInfo.dateBR} ({dInfo.weekdayStr.toUpperCase()})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-bold uppercase text-[11px] text-black">
                      {slots.filter(row => isEditingHeader || userRole === 'admin' || !isSlotRemoved(dIso, row.label)).map((row, idx) => {
                        const assignedVal = getAssignedMilitaryName(
                          row,
                          dIso,
                          'max' in row ? (row as any).max : undefined
                        );
                        const removed = isSlotRemoved(dIso, row.label);

                        return (
                          <tr key={`block-row-${dIso}-${idx}`} className={`border-b border-black ${removed ? 'bg-red-100/60 line-through opacity-60 print:hidden' : ''}`}>
                            <td className="p-2 border-r-2 border-black font-extrabold text-black tracking-wide flex items-center justify-between gap-2">
                              <span>{row.label}</span>
                              {(isEditingHeader || userRole === 'admin') && (
                                <button
                                  type="button"
                                  onClick={() => toggleRemoveSlot(dIso, row.label)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer print:hidden no-underline transition-all ${
                                    removed ? 'bg-emerald-700 text-white' : 'bg-red-800 hover:bg-red-700 text-white'
                                  }`}
                                  title={removed ? 'Restaurar esta escala no aditamento' : 'Remover esta escala do aditamento'}
                                >
                                  {removed ? 'Restaurar' : 'Remover'}
                                </button>
                              )}
                            </td>
                            <td className="p-2 font-black text-black tracking-wider text-center bg-slate-50/40 print:bg-transparent">
                              {isEditingHeader ? (
                                <input
                                  type="text"
                                  value={assignedVal}
                                  onChange={(e) => setCustomSlotNames({ ...customSlotNames, [`${dIso}_${row.label}`]: e.target.value.toUpperCase() })}
                                  className="w-full bg-amber-50 border border-amber-300 p-1 text-xs uppercase font-bold text-center outline-none"
                                />
                              ) : (
                                assignedVal
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* NUMBERED SECTIONS (2ª, 3ª, 4ª PARTE) */}
        <div className="mt-8 space-y-6 font-sans text-center text-xs font-bold text-black leading-snug">
          <div>
            <p className="font-extrabold text-sm uppercase">2ª PARTE:</p>
            <p className="font-bold text-xs mt-0.5 uppercase">INSTRUÇÃO</p>
            <p className="font-normal text-xs mt-1.5 whitespace-pre-wrap text-black">
              {part2Text || 'SEM ALTERAÇÃO'}
            </p>
          </div>

          <div>
            <p className="font-extrabold text-sm uppercase">3ª PARTE</p>
            <p className="font-bold text-xs mt-0.5 uppercase">ASSUNTOS GERAIS E ADMINISTRATIVOS</p>
            <p className="font-normal text-xs mt-1.5 whitespace-pre-wrap text-black">
              {part3Text || 'SEM ALTERAÇÃO'}
            </p>
          </div>

          <div>
            <p className="font-extrabold text-sm uppercase">4ª PARTE</p>
            <p className="font-bold text-xs mt-0.5 uppercase">JUSTIÇA E DISCIPLINA</p>
            <p className="font-normal text-xs mt-1.5 whitespace-pre-wrap text-black">
              {part4Text || 'SEM ALTERAÇÃO'}
            </p>
          </div>
        </div>

        {/* CITY AND DATE LINE */}
        <div className="mt-12 text-center font-sans uppercase font-bold text-xs text-black tracking-wide">
          <p>
            {cidadeUf}, {effectiveConfeccaoParts.d} DE {effectiveConfeccaoParts.monthName} DE {effectiveConfeccaoParts.y}
          </p>
        </div>

        {/* SIGNATURE SECTION WITH ELECTRONIC SIGNATURE EMBLEM */}
        <div className="mt-10 pt-4 flex flex-col items-center text-center font-sans space-y-3">
          
          <div className="space-y-0.5">
            <p className="font-extrabold text-xs uppercase text-black tracking-wider">
              {aprovisionadoraNome}
            </p>
            <p className="font-bold text-[11px] uppercase text-black tracking-widest">
              {aprovisionadoraFuncao}
            </p>
          </div>

          {/* ELECTRONIC SIGNATURE STAMP */}
          {isSigned && (
            <div className="w-full max-w-md border-2 border-black bg-slate-50/90 p-3.5 rounded-lg text-center font-sans space-y-1.5 mt-4 print:bg-slate-50 print:border-black print:text-black">
              <div className="flex items-center justify-center gap-1.5 text-black font-extrabold text-[11px] uppercase tracking-wider border-b border-black/30 pb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-800 print:text-black" />
                <span>DOCUMENTO ASSINADO ELETRONICAMENTE</span>
              </div>
              <p className="text-[10px] font-bold text-black uppercase leading-tight">
                Assinado digitalmente por: {aprovisionadoraNome}
              </p>
              <p className="text-[9px] text-slate-800 font-semibold uppercase">
                Cargo: {aprovisionadoraFuncao} ({omName})
              </p>
              <div className="pt-1.5 border-t border-black/20 flex flex-wrap items-center justify-between text-[8px] font-mono text-black font-bold">
                <span>DATA DA CONFECÇÃO: {effectiveConfeccaoParts.dateBR}</span>
                <span>HASH SHA-256: 7RCM-EB-2026-{aditamentoDate.replace(/-/g, '')}B1C84D</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FIREBASE ARCHIVE BY MONTH MODAL */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-[#0b120c] border-2 border-[#E5BA5D]/40 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#E5BA5D]/20 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-[#E5BA5D] flex items-center gap-2 uppercase tracking-wide">
                  <Database className="w-5 h-5 text-[#E5BA5D]" />
                  Base de Dados Firebase — Aditamentos por Mês
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Consulte, carregue ou gerencie os Aditamentos Oficiais gravados na nuvem.
                </p>
              </div>
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MONTH FILTER BAR */}
            <div className="bg-black/60 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#E5BA5D]" /> Selecionar Mês:
                </span>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => {
                    const newM = e.target.value;
                    setFilterMonth(newM);
                    fetchArchiveByMonth(newM);
                  }}
                  className="bg-slate-900 text-[#E5BA5D] border border-[#E5BA5D]/40 rounded-lg px-3 py-1.5 text-xs font-extrabold outline-none focus:border-[#E5BA5D] cursor-pointer"
                />
              </div>

              <span className="text-xs font-bold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                Registros encontrados: <strong className="text-[#E5BA5D]">{savedAditamentosList.length}</strong>
              </span>
            </div>

            {/* ARCHIVE CONTENT LIST */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoadingArchive ? (
                <div className="py-12 text-center space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-[#E5BA5D] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold">Buscando aditamentos no Firebase...</p>
                </div>
              ) : savedAditamentosList.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                  <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">Nenhum aditamento gravado para {filterMonth.split('-').reverse().join('/')}</p>
                  <p className="text-xs text-slate-500">Clique em "Salvar no Firebase" no topo para registrar o aditamento deste mês.</p>
                </div>
              ) : (
                savedAditamentosList.map((item) => {
                  const dFormatted = item.dataServico.split('-').reverse().join('/');
                  const createdDate = new Date(item.createdAt).toLocaleString('pt-BR');

                  return (
                    <div 
                      key={item.id} 
                      className="bg-slate-900/90 border border-slate-800 hover:border-[#E5BA5D]/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-amber-300">
                            Dia {dFormatted}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                            item.tipo === 'fim_de_semana' 
                              ? 'bg-purple-900/80 text-purple-200 border border-purple-700' 
                              : 'bg-blue-900/80 text-blue-200 border border-blue-700'
                          }`}>
                            {item.tipo === 'fim_de_semana' ? 'Fim de Semana (Sáb/Dom/Seg)' : 'Dia Útil'}
                          </span>
                          {item.signed ? (
                            <span className="px-2 py-0.5 text-[10px] font-black text-emerald-300 bg-emerald-950 border border-emerald-800 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Assinado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-black text-slate-400 bg-slate-800 rounded">
                              Pendente
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-semibold">
                          OM: <span className="text-slate-100">{item.omName}</span> | Aprovisionador(a): <span className="text-amber-200">{item.aprovisionadoraNome}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Salvo em: {createdDate} | Total de postos gravados: {item.escalas?.length || 0}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadFromArchive(item)}
                          className="px-3 py-1.5 bg-[#E5BA5D] hover:bg-[#FFF2BF] text-black font-extrabold text-xs rounded-lg transition-all shadow cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Carregar
                        </button>
                        <button
                          onClick={() => handleDeleteFromArchive(item.id, item.dataServico)}
                          className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-[#E5BA5D]/20 pt-3 mt-4 text-right">
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
