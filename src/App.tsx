/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QmsProvider, useQms } from './qmsState';
import { WaitingRoomDisplay } from './components/WaitingRoomDisplay';
import { VisitorKiosk } from './components/VisitorKiosk';
import { OperatorPanel } from './components/OperatorPanel';
import { CounterDisplay } from './components/CounterDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { playChime } from './qmsState';
import { Monitor, Ticket, UserCheck, Tv, BarChart2, Volume2 } from 'lucide-react';

function AppContent() {
  const { activeView, setView } = useQms();

  const renderView = () => {
    switch (activeView) {
      case 'waiting-room':
        return <WaitingRoomDisplay />;
      case 'kiosk':
        return <VisitorKiosk />;
      case 'operator':
        return <OperatorPanel />;
      case 'counter-display':
        return <CounterDisplay />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <WaitingRoomDisplay />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 relative">
      
      {/* 👑 Professional HUD Switcher Bar (REVIEW PANEL) */}
      <div className="bg-[#031636] border-b border-blue-950 px-8 py-3 flex flex-wrap justify-between items-center gap-4 text-white relative z-20 shadow-lg shrink-0">
        
        {/* System Title / Status */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] uppercase tracking-widest font-black text-amber-500 animate-pulse">
            ● SIMULATOR ENVIRONMENT
          </span>
          <div className="h-4 w-px bg-blue-900" />
          <span className="text-xs font-bold text-slate-300">
            Turkish Embassy QMS
          </span>
        </div>

        {/* View switching buttons */}
        <div className="flex bg-blue-950/80 p-1 rounded-xl border border-blue-900/40 select-none">
          <button
            onClick={() => setView('waiting-room')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition uppercase ${
              activeView === 'waiting-room'
                ? 'bg-[#e30a17] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span>1. Waiting Room TV</span>
          </button>

          <button
            onClick={() => setView('kiosk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition uppercase ${
              activeView === 'kiosk'
                ? 'bg-[#e30a17] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ticket size={14} />
            <span>2. Visitor Kiosk</span>
          </button>

          <button
            onClick={() => setView('operator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition uppercase ${
              activeView === 'operator'
                ? 'bg-[#e30a17] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>3. Teller Panel</span>
          </button>

          <button
            onClick={() => setView('counter-display')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition uppercase ${
              activeView === 'counter-display'
                ? 'bg-[#e30a17] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tv size={14} />
            <span>4. Counter Sign</span>
          </button>

          <button
            onClick={() => setView('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide transition uppercase ${
              activeView === 'admin'
                ? 'bg-[#e30a17] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart2 size={14} />
            <span>5. Admin Center</span>
          </button>
        </div>

        {/* Diagnostic Actions */}
        <button
          onClick={playChime}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#cbd5e1] hover:text-white border border-[#475569] hover:bg-linear-to-b transition text-[10px] font-black uppercase rounded-lg shadow-sm cursor-pointer select-none"
          title="Play chime sound test"
        >
          <Volume2 size={13} />
          <span>Test Bell</span>
        </button>

      </div>

      {/* 🖥️ Main screen content space */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <QmsProvider>
      <AppContent />
    </QmsProvider>
  );
}
