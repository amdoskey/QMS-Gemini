import React, { useState, useEffect } from 'react';
import { useQms } from '../qmsState';
import { Emblem } from './Emblem';
import { services } from '../services';
import { Volume2, VolumeX, AlertCircle, Languages, Megaphone } from 'lucide-react';

export const WaitingRoomDisplay: React.FC = () => {
  const { 
    tickets, 
    counters, 
    enableVoice, 
    enableSound, 
    setEnableVoice, 
    setEnableSound,
    latestCalledTicket,
    latestCallingCounterId,
    isCallingAnimationActive,
    dismissCallingAlert,
    accentLanguage,
    setAccentLanguage
  } = useQms();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time (e.g. 14:29:45)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const formatSeconds = (date: Date) => {
    return date.getSeconds().toString().padStart(2, '0');
  };

  // Format date (e.g. TUESDAY, JUNE 9, 2026)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase();
  };

  // Extract currently called/serving ticket
  const currentlyCallingTicket = tickets
    .filter(t => t.status === 'serving' || t.status === 'calling')
    .sort((a, b) => {
      const aTime = a.calledAt || a.startedAt || '';
      const bTime = b.calledAt || b.startedAt || '';
      return bTime.localeCompare(aTime);
    })[0];

  const getCounterForTicket = (ticket: any) => {
    if (!ticket) return null;
    return counters.find(c => c.currentTicketId === ticket.id) || 
           counters.find(c => {
             const s = services.find(srv => srv.id === ticket.serviceId);
             return s && s.assignedCounter === c.id;
           });
  };

  const activeCounter = getCounterForTicket(currentlyCallingTicket);

  // Extract recent calls (past 4 tickets)
  const recentCalls = tickets
    .filter(t => t.status === 'completed' || (t.status === 'serving' && t.id !== currentlyCallingTicket?.id))
    .sort((a, b) => {
      const aTime = a.completedAt || a.calledAt || '';
      const bTime = b.completedAt || b.calledAt || '';
      return bTime.localeCompare(aTime);
    })
    .slice(0, 4);

  // Fallback default values if database is empty so it looks like the exact mockup!
  const displayCurrentTicket = currentlyCallingTicket?.number || 'A-102';
  const displayCurrentCounter = activeCounter ? String(activeCounter.id).padStart(2, '0') : '05';

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] font-sans antialiased text-[#191c1e] overflow-hidden select-none relative">
      
      {/* 1. Header Row */}
      <header className="flex justify-between items-center px-12 py-6 bg-white border-b-2 border-gray-100 shadow-xs relative z-10">
        <div className="flex items-center gap-5">
          <Emblem size={64} />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#031636]">
              Turkish Embassy Erbil
            </h1>
            <p className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Consular Services Display • Konsolosluk Hizmetleri Ekranı
            </p>
          </div>
        </div>

        {/* Action Toggles for Simulation Review */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAccentLanguage(accentLanguage === 'tr' ? 'en' : 'tr')}
            title="Switch Speech Accent Language"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition"
          >
            <Languages size={15} className="text-purple-600" />
            <span>Voice: {accentLanguage === 'tr' ? 'Türkçe' : 'English'}</span>
          </button>
          
          <button
            onClick={() => setEnableVoice(!enableVoice)}
            className={`p-2 rounded-md border transition ${
              enableVoice 
                ? 'bg-blue-50/50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
            title={enableVoice ? "Voice Assistance Enabled" : "Voice Assistance Muted"}
          >
            {enableVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-baseline font-mono text-5xl font-extrabold text-[#031636]">
            {formatTime(currentTime)}
            <span className="text-3xl font-medium animate-pulse ml-0.5 text-gray-400">
              :{formatSeconds(currentTime)}
            </span>
          </div>
          <div className="text-xs font-bold text-gray-500 tracking-wider font-mono mt-0.5">
            {formatDate(currentTime)}
          </div>
        </div>
      </header>

      {/* 2. Main Large Dashboard Grid */}
      <main className="flex-1 grid grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full relative z-10 overflow-hidden">
        
        {/* Left Side Panel: Now Serving (8 of 12 columns) */}
        <section className="col-span-8 flex flex-col h-full bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
          
          {/* Now Serving Blue Header Banner */}
          <div className="bg-[#031636] text-white px-8 py-5 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
            <div className="flex items-center gap-4">
              <Megaphone className="w-8 h-8 text-white/90 animate-bounce" style={{ animationDuration: '3s' }} />
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">NOW SERVING</h2>
                <p className="text-xs font-semibold tracking-widest text-gray-300 uppercase">Şu Anda Hizmet Verilen</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#e30a17] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Active Call
            </div>
          </div>

          {/* Huge Number Board Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white relative">
            <div className="w-full grid grid-cols-2 text-center relative z-10 gap-x-8">
              
              {/* Ticket Section */}
              <div className="flex flex-col items-center justify-center border-r-2 border-dashed border-gray-200 pr-4">
                <span className="text-sm font-extrabold text-gray-400 tracking-widest uppercase">
                  TICKET NUMBER / SIRA NO
                </span>
                <span className="text-[9.5rem] font-black tracking-tighter text-[#031636] font-sans leading-none my-4">
                  {displayCurrentTicket}
                </span>
                
                {currentlyCallingTicket ? (
                  <span className="px-4 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full tracking-wide">
                    {services.find(s => s.id === currentlyCallingTicket.serviceId)?.nameTu || 'Bilinmiyor'}
                  </span>
                ) : (
                  <span className="px-4 py-1 bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold rounded-full tracking-wide">
                    Tasdik İşlemleri
                  </span>
                )}
              </div>

              {/* Counter Section */}
              <div className="flex flex-col items-center justify-center pl-4">
                <span className="text-sm font-extrabold text-gray-400 tracking-widest uppercase">
                  COUNTER / BANKO
                </span>
                <span className="text-[9.5rem] font-black tracking-tighter text-[#031636] font-sans leading-none my-4">
                  {displayCurrentCounter}
                </span>
                <span className="px-4 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full tracking-wide">
                  {displayCurrentCounter === '09' ? 'Vezne / Cashier' : 'Vezne Yok / Direct Desk'}
                </span>
              </div>
              
            </div>

            {/* Background watermarked emblem */}
            <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
              <Emblem size={320} className="scale-125 blur-xs" />
            </div>
          </div>

          {/* Bilingual Message banner */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-5 flex items-center justify-around text-gray-500 text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇹🇷</span>
              <span>Lütfen bekleyiniz</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2 text-right dir-rtl font-medium">
              <span>يرجى الانتظار</span>
              <span className="text-lg">🇮🇶</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-lg">🇬🇧</span>
              <span>Please wait</span>
            </div>
          </div>

        </section>

        {/* Right Side Panel: Recent Calls (4 of 12 columns) */}
        <section className="col-span-4 flex flex-col h-full bg-[#031636] rounded-xl shadow-md overflow-hidden text-white border border-blue-900/40">
          
          {/* Header */}
          <div className="bg-[#020e24] px-6 py-5 flex items-center gap-3.5 border-b border-blue-950/80">
            <Megaphone className="w-6 h-6 text-blue-400 rotate-180" />
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-white">RECENT CALLS</h3>
              <p className="text-[10px] font-bold tracking-widest text-[#8293ba] uppercase">Önceki Aramalar</p>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-2 px-6 py-3.5 bg-blue-950/40 border-b border-blue-900/30 text-xs font-black tracking-widest text-[#8293ba]">
            <div>TICKET / SIRA NO</div>
            <div className="text-right">COUNTER / BANKO</div>
          </div>

          {/* Recent lists */}
          <div className="flex-1 p-5 flex flex-col gap-4 bg-gradient-to-b from-[#031636] to-[#010a1b]">
            {recentCalls.length > 0 ? (
              recentCalls.map((t) => {
                const counter = getCounterForTicket(t);
                const cId = counter ? String(counter.id).padStart(2, '0') : '01';
                return (
                  <div 
                    key={t.id} 
                    className="grid grid-cols-2 items-center bg-white/5 border border-white/5 rounded-lg px-6 py-4 hover:bg-white/10 transition duration-150"
                  >
                    <div className="text-3xl font-black tracking-tight text-white">{t.number}</div>
                    <div className="text-3xl font-black tracking-tight text-right text-emerald-400">{cId}</div>
                  </div>
                );
              })
            ) : (
              // Seed records matching mockup for complete replica
              <>
                <div className="grid grid-cols-2 items-center bg-white/5 border border-white/5 rounded-lg px-6 py-4">
                  <div className="text-3xl font-black tracking-tight text-white">B-412</div>
                  <div className="text-3xl font-black tracking-tight text-right text-emerald-400">08</div>
                </div>
                <div className="grid grid-cols-2 items-center bg-white/5 border border-white/5 rounded-lg px-6 py-4">
                  <div className="text-3xl font-black tracking-tight text-white">A-101</div>
                  <div className="text-3xl font-black tracking-tight text-right text-emerald-400">03</div>
                </div>
                <div className="grid grid-cols-2 items-center bg-white/5 border border-white/5 rounded-lg px-6 py-4">
                  <div className="text-3xl font-black tracking-tight text-white">C-055</div>
                  <div className="text-3xl font-black tracking-tight text-right text-emerald-400">09</div>
                </div>
                <div className="grid grid-cols-2 items-center bg-white/5 border border-white/5 rounded-lg px-6 py-4">
                  <div className="text-3xl font-black tracking-tight text-white">A-099</div>
                  <div className="text-3xl font-black tracking-tight text-right text-emerald-400">05</div>
                </div>
              </>
            )}
          </div>

          {/* Footer banner label */}
          <div className="bg-[#020e24] px-6 py-4 border-t border-blue-950/80 text-center font-extrabold text-xs tracking-widest text-[#8293ba] uppercase">
            Visa & Consular Services
          </div>

        </section>
      </main>

      {/* 3. Scrolling Ticker News Banner at very bottom */}
      <footer className="bg-[#eceef0] border-t border-gray-300 h-14 flex items-center overflow-hidden relative z-10 font-mono text-sm">
        <div className="flex items-center h-full px-5 bg-red-600 text-white font-extrabold relative z-20 shadow-lg text-xs tracking-widest uppercase flex-shrink-0 animate-pulse">
          <AlertCircle size={16} className="mr-2 animate-bounce" />
          Notice / Duyuru:
        </div>
        <div className="w-full overflow-hidden relative h-full flex items-center z-10">
          <div className="absolute animate-marquee whitespace-nowrap flex gap-20 text-gray-800 font-extrabold pr-4 capitalize">
            <span>🔴 Lütfen işlemleriniz için pasaport ve tüm destekleyici belgelerinizi hazır bulundurunuz.</span>
            <span>🔴 Please have your passport and all supporting documents ready for your application.</span>
            <span>🔴 يرجى التأكد من تجهيز جواز السفر وجميع المستندات المطلوبة لإجراء معاملتكم بشكل صحيح وسريع.</span>
            <span>🔴 Lütfen işlemleriniz için pasaport ve tüm destekleyici belgelerinizi hazır bulundurunuz.</span>
            <span>🔴 Please have your passport and all supporting documents ready for your application.</span>
          </div>
        </div>
      </footer>

      {/* 4. Large Interactive Caller Overlay Alert Modal */}
      {isCallingAnimationActive && latestCalledTicket && (
        <div className="absolute inset-0 bg-[#031636]/95 backdrop-blur-md z-50 flex items-center justify-center p-10 select-none animate-fade-in">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-[10px] border-amber-500 overflow-hidden text-center relative p-12 flex flex-col items-center gap-8 transform animate-scale-up">
            
            {/* Visual Ringing Pulser Effect */}
            <div className="relative w-28 h-28 flex items-center justify-center bg-amber-50 rounded-full text-amber-500">
              <span className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
              <span className="absolute inset-4 rounded-full bg-amber-500/20 animate-ping" style={{ animationDelay: '0.4s' }} />
              <Megaphone size={52} className="relative z-10 animate-wiggle" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-400 tracking-widest uppercase">
                NOW CALLING / ŞU ANDA ÇAĞRILAN
              </h3>
              <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 w-full gap-8 divide-x-2 divide-dashed divide-gray-200 py-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 tracking-wider">TICKET / SIRA NO</span>
                <span className="text-8xl font-black font-sans tracking-tight text-[#031636]">
                  {latestCalledTicket.number}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 tracking-wider">COUNTER / BANKO</span>
                <span className="text-8xl font-black font-sans tracking-tight text-[#e30a17]">
                  {latestCallingCounterId ? String(latestCallingCounterId).padStart(2, '0') : '01'}
                </span>
              </div>
            </div>

            <div className="w-full text-center py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold tracking-wider text-gray-500 uppercase">
              {services.find(s => s.id === latestCalledTicket.serviceId)?.nameTu} / {services.find(s => s.id === latestCalledTicket.serviceId)?.nameEn}
            </div>

            <button
              onClick={dismissCallingAlert}
              className="px-8 py-3.5 bg-[#031636] text-white font-extrabold hover:bg-[#e30a17] transition text-sm rounded-lg tracking-wider uppercase shadow-md active:scale-95"
            >
              OK, I am Proceeding / İlerliyorum
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
