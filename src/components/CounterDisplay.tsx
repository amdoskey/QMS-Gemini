import React from 'react';
import { useQms } from '../qmsState';
import { services } from '../services';
import { Coins, BookOpen, FileCheck, Mail, Heart, Baby, Contact, FileText, UserCheck, CheckCircle } from 'lucide-react';
import { Emblem } from './Emblem';

export const CounterDisplay: React.FC = () => {
  const { 
    counters, 
    tickets, 
    selectedCounterDisplayId, 
    setCounterDisplay 
  } = useQms();

  const currentCounter = counters.find(c => c.id === selectedCounterDisplayId) || counters[8]; // Fallback to Counter 9 Vegne
  const currentTicket = tickets.find(t => t.id === currentCounter.currentTicketId);
  const assignedService = services.find(s => s.assignedCounter === currentCounter.id) || services[8];

  const getIcon = (name: string, className: string = "w-10 h-10") => {
    switch(name) {
      case 'FileCheck': return <FileCheck className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Baby': return <Baby className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Contact': return <Contact className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Coins': return <Coins className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const padNum = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] font-sans text-gray-900 select-none overflow-hidden relative">
      
      {/* Simulation overhead control strip */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex justify-between items-center relative z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Emblem size={44} />
          <div>
            <h2 className="text-sm font-black text-[#031636]">Turkish Embassy</h2>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-px tracking-wider">Counter Billboard Mockup</p>
          </div>
        </div>
        
        {/* Desk picker selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Overhead Wall:</span>
          <select
            value={selectedCounterDisplayId}
            onChange={(e) => setCounterDisplay(parseInt(e.target.value, 10))}
            className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#031636] focus:outline-none focus:border-amber-500"
          >
            {counters.map(c => {
              const srv = services.find(s => s.assignedCounter === c.id);
              return (
                <option key={c.id} value={c.id}>
                  Counter {c.id} ({srv?.nameTu.slice(0, 16)} Overhead)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Overhead Display Canvas Center Frame */}
      <main className="flex-1 flex items-center justify-center p-8 bg-slate-900">
        
        {/* Main large dark billboard card */}
        <div className="max-w-4xl w-full aspect-video bg-[#031636] rounded-2.5xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-4 border-slate-700 overflow-hidden flex flex-col justify-between relative text-white">
          <div className="absolute inset-0 bg-radial-gradient(circle_at_top,rgba(255,255,255,0.02),transparent) pointer-events-none" />

          {/* 1. Header Banner of Wall Board */}
          <div className="border-b-4 border-slate-800 px-10 py-6.5 flex justify-between items-center bg-[#01091b]">
            <div className="flex flex-col">
              <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase select-text">
                BANKO {currentCounter.id} / COUNTER {currentCounter.id}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 text-blue-400">
                {getIcon(assignedService.iconName, "w-5 h-5")}
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#8293ba]">
                  {assignedService.nameTu} / {assignedService.nameEn}
                </p>
              </div>
            </div>

            {/* Circle overlay numbers */}
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-[-2deg] select-all">
              <span className="text-[#031636] text-4xl font-black font-sans tracking-tight">
                {padNum(currentCounter.id)}
              </span>
            </div>
          </div>

          {/* 2. Main ticket block area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950/20 to-slate-950/40 relative">
            
            {currentTicket ? (
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-black text-blue-400 tracking-widest uppercase mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  ŞU ANKİ SIRA / CURRENT TICKET
                </span>
                
                {/* Massive flashing number */}
                <span className="text-[12rem] font-black tracking-tighter text-white font-sans leading-none my-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-all">
                  {currentTicket.number}
                </span>

                {/* Subtitle call blinker */}
                {currentTicket.status === 'calling' && (
                  <div className="px-5 py-1.5 bg-[#e30a17] text-white text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 animate-pulse mt-2 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    CALLING / ÇAĞRILIYOR
                  </div>
                )}
              </div>
            ) : (
              // Display state when no active serving user
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative flex items-center justify-center text-emerald-400">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/10 scale-150 animate-ping" />
                  <CheckCircle size={80} className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]" />
                </div>
                <div className="space-y-1">
                  <span className="text-4xl font-black text-emerald-400 uppercase tracking-tight">AVAILABLE / BOŞTA</span>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Lütfen sıra numarası alınız / Please issue a queue ticket</p>
                </div>
              </div>
            )}

            {/* Subtle background crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-2 pointer-events-none select-none">
              <Emblem size={240} className="scale-110 blur-xxs" />
            </div>
          </div>

          {/* 3. Wall board scrolling ribbon ticker */}
          <footer className="bg-white text-[#031636] border-t-4 border-slate-800 h-16 flex items-center overflow-hidden font-mono text-sm uppercase relative w-full font-black">
            <div className="absolute animate-[marquee_20s_linear_infinite] whitespace-nowrap flex gap-12 pr-4 pl-4 select-text">
              <span>🔵 Lütfen numaranız çağrıldığında {padNum(currentCounter.id)} no'lu bankaya ilerleyiniz.</span>
              <span>🔵 Please proceed to counter {padNum(currentCounter.id)} when your number is called.</span>
              <span>🔵 يرجى التوجه إلى الكاونتر رقم {padNum(currentCounter.id)} فور ظهور رقم بطاقتك على الشاشة.</span>
              <span>🔵 Lütfen numaranız çağrıldığında {padNum(currentCounter.id)} no'lu bankaya ilerleyiniz.</span>
              <span>🔵 Please proceed to counter {padNum(currentCounter.id)} when your number is called.</span>
            </div>
          </footer>

        </div>
      </main>

      {/* Guide lines description */}
      <footer className="bg-white border-t border-gray-100 py-3.5 px-10 text-center text-xs font-semibold text-gray-500">
        Turkish Embassy Erbil • This billboard monitor is mounted above Counter {currentCounter.id} for public routing.
      </footer>

    </div>
  );
};
