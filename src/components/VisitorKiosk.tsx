import React, { useState } from 'react';
import { useQms } from '../qmsState';
import { services } from '../services';
import { Emblem } from './Emblem';
import { FileCheck, UserCheck, Mail, Heart, Baby, BookOpen, Contact, FileText, Coins, Printer, Clock, Users, X } from 'lucide-react';
import { Ticket } from '../types';

export const VisitorKiosk: React.FC = () => {
  const { 
    issueNewTicket, 
    tickets, 
    accentLanguage, 
    setAccentLanguage 
  } = useQms();
  
  const [printedTicket, setPrintedTicket] = useState<Ticket | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Map icon names to Lucide icons
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

  const handleServiceSelect = (serviceId: string) => {
    setIsPrinting(true);
    
    // Simulate mechanical printer delay
    setTimeout(() => {
      const ticket = issueNewTicket(serviceId);
      setPrintedTicket(ticket);
      setIsPrinting(false);
    }, 1500);
  };

  const handleDismissTicket = () => {
    setPrintedTicket(null);
  };

  // Calculate waiting count for selected ticket category
  const getCategoryWaitingCount = (srvId: string) => {
    return tickets.filter(t => t.serviceId === srvId && t.status === 'waiting').length;
  };

  // Estimate waiting duration
  const getCategoryEstimatedWait = (srvId: string) => {
    const count = getCategoryWaitingCount(srvId);
    if (count === 0) return 3;
    return count * 4; // Estimate 4 minutes per citizen
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans text-gray-900 select-none overflow-hidden relative">
      
      {/* 1. Kiosk Official Header */}
      <header className="bg-white border-b border-gray-200 px-10 py-5 flex justify-between items-center relative z-10 shadow-xs">
        <div className="flex items-center gap-4">
          <Emblem size={52} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#031636]">
              Turkish Embassy Erbil
            </h1>
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Consular Services Kiosk • Konsolosluk Sıra Alım Noktası
            </p>
          </div>
        </div>

        {/* Dynamic Live Clock */}
        <div className="flex items-center gap-6">
          {/* Simple Lang Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setAccentLanguage('tr')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                accentLanguage === 'tr' 
                  ? 'bg-[#031636] text-white shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Türkçe
            </button>
            <button
              onClick={() => setAccentLanguage('en')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                accentLanguage === 'en' 
                  ? 'bg-[#031636] text-white shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              English
            </button>
          </div>

          <div className="text-right">
            <span className="font-mono text-xl font-bold block text-gray-800">
              {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Welcome Title Banner */}
      <section className="text-center py-6 px-4 bg-linear-to-b from-gray-50 to-transparent relative z-10">
        <h2 className="text-4xl font-extrabold text-[#031636] tracking-tight mb-2">
          Hoş Geldiniz / Welcome
        </h2>
        <p className="text-sm font-semibold text-gray-500 tracking-wide">
          Lütfen sıra numarası almak için işlem kategorisini seçiniz / Please select your service category
        </p>
      </section>

      {/* 3. 3x3 Service Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-12 overflow-y-auto grid grid-cols-3 gap-6 relative z-10">
        {services.map((service) => {
          const waitingSize = getCategoryWaitingCount(service.id);
          const defaultCounterId = service.assignedCounter;
          
          return (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              disabled={isPrinting || !!printedTicket}
              className="flex flex-col bg-white hover:bg-[#ffebee]/10 border border-gray-200/80 hover:border-amber-500/50 hover:shadow-xl hover:scale-[1.02] p-8 rounded-xl transition duration-200 text-center items-center justify-between group active:scale-98 relative overflow-hidden cursor-pointer"
            >
              {/* Colored subtle corner indicator */}
              <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center bg-gray-50 border-bl border-gray-200 rounded-tr-lg text-[10px] font-bold text-gray-400 group-hover:bg-[#ffebee] group-hover:text-red-600 transition">
                B-0{defaultCounterId}
              </div>

              <div className="my-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#031636] group-hover:bg-[#e30a17] group-hover:text-white group-hover:shadow-lg transition duration-200 mb-5">
                  {getIcon(service.iconName, "w-8 h-8")}
                </div>

                <h3 className="text-[20px] font-black text-gray-900 group-hover:text-[#031636] leading-tight mb-1 font-sans">
                  {service.nameTu}
                </h3>
                <p className="text-xs font-semibold text-gray-400 tracking-wide px-2 uppercase leading-snug">
                  {service.nameEn}
                </p>
              </div>

              {/* Waiting metrics strip */}
              <div className="w-full mt-6 flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider font-extrabold text-gray-500 bg-gray-50/70 border border-gray-100 rounded-lg py-2 group-hover:bg-amber-50/50 group-hover:border-amber-100 group-hover:text-amber-800 transition">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-[#031636]/60 group-hover:text-[#e30a17]" />
                  <span>Waiting: <strong className="text-gray-900 font-black group-hover:text-red-700">{waitingSize}</strong></span>
                </div>
                <div className="h-2.5 w-px bg-gray-200" />
                <div className="flex items-center gap-1 animate-pulse">
                  <Clock size={12} className="text-gray-400" />
                  <span>~{getCategoryEstimatedWait(service.id)}m</span>
                </div>
              </div>
            </button>
          )
        })}
      </main>

      {/* 4. Footer Guidelines info */}
      <footer className="bg-white border-t border-gray-100 py-3.5 px-10 flex justify-between items-center relative z-10 text-[11px] font-semibold text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-lg text-amber-500">❓</span>
          <span>
            Yardıma mı ihtiyacınız var? Lütfen resepsiyona danışınız. / Need Assistance? Please approach reception.
          </span>
        </div>
        <div>
          © 2026 Turkish Embassy Erbil. Diplomatic Operational System v2.4
        </div>
      </footer>

      {/* 5. Mechanical Mechanical Sound Indicator & Print Slide Modal */}
      {isPrinting && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-xs z-40 flex items-center justify-center select-none animate-fade-in">
          <div className="bg-white/95 rounded-2xl p-8 border border-white max-w-sm w-full mx-4 shadow-2xl text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 text-[#031636] flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
              <Printer size={40} className="animate-bounce" style={{ animationDuration: '1s' }} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Yazdırılıyor...</h3>
              <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Printing Receipt ticket. Please stand by.</p>
            </div>
            {/* Mock progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#e30a17] rounded-full animate-[progress_1.5s_ease-out_forwards]" />
            </div>
          </div>
        </div>
      )}

      {/* 6. Thermal Ticket Printer Screen Slip */}
      {printedTicket && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-100 rounded-2xl shadow-2xl flex flex-col relative animate-scale-up">
            
            {/* Simulated Receipt paper container */}
            <div className="bg-white text-gray-800 p-8 rounded-t-2xl shadow-inner relative flex flex-col items-center select-text font-mono border-b-4 border-dashed border-gray-300">
              
              <button 
                onClick={handleDismissTicket}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 focus:outline-none select-none print:hidden pointer-events-auto p-1 bg-gray-50 border border-gray-200 rounded-full"
                title="Dismiss Ticket"
              >
                <X size={15} />
              </button>

              <Emblem size={48} className="my-2" />
              <div className="text-[10px] font-black tracking-widest text-[#031636] text-center mt-2">
                T.C. ERBİL BAŞKONSOLOSLUĞU
              </div>
              <div className="text-[8px] font-bold text-gray-400 tracking-wider text-center max-w-[180px] mt-0.5 leading-snug">
                CONSUATE GENERAL OF THE REPUBLIC OF TÜRKIYE IN ERBIL
              </div>

              {/* Horizontal Line dotted */}
              <div className="w-full border-t border-dashed border-gray-300 my-4" />

              <div className="text-[10px] font-black uppercase text-[#e11d48] tracking-widest text-center">
                {services.find(s => s.id === printedTicket.serviceId)?.nameTu || 'HİZMET'}
              </div>
              <div className="text-[8px] text-gray-500 font-extrabold uppercase text-center tracking-wide">
                {services.find(s => s.id === printedTicket.serviceId)?.nameEn || 'SERVICE'}
              </div>

              {/* Large Ticket number printed */}
              <div className="text-6xl font-black tracking-tighter text-[#031636] font-sans my-5">
                {printedTicket.number}
              </div>

              {/* Estimated wait and counter details */}
              <div className="w-full flex justify-between text-[9px] font-bold mt-2">
                <span className="text-gray-400 uppercase">Selected Desk:</span>
                <span className="text-gray-800">Counter {services.find(s => s.id === printedTicket.serviceId)?.assignedCounter}</span>
              </div>
              
              <div className="w-full flex justify-between text-[9px] font-bold mt-1">
                <span className="text-gray-400 uppercase">Queue ahead:</span>
                <span className="text-gray-800">{getCategoryWaitingCount(printedTicket.serviceId) - 1} citizens</span>
              </div>

              <div className="w-full flex justify-between text-[9px] font-bold mt-1">
                <span className="text-gray-400 uppercase">Estimated wait:</span>
                <span className="text-[#e23c3c]">~{getCategoryEstimatedWait(printedTicket.serviceId)} minutes</span>
              </div>

              <div className="w-full border-t border-dashed border-gray-300 my-4" />

              {/* Barcode representation */}
              <div className="bg-slate-50 w-full p-2.5 flex flex-col items-center rounded-lg border border-slate-100">
                <div className="flex h-10 w-full items-baseline gap-[1.5px] px-1 justify-center opacity-85 select-none my-1">
                  {/* barcode lines generated */}
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-black h-full rounded-xs flex-1"
                      style={{ 
                        opacity: i % 3 === 0 ? 0.9 : i % 5 === 0 ? 0.35 : i % 7 === 0 ? 0.15 : 0.85,
                        maxWidth: i % 4 === 0 ? '4px' : i % 3 === 0 ? '1.5px' : '2px'
                      }}
                    />
                  ))}
                </div>
                <div className="text-[7px] font-bold tracking-widest text-slate-500 font-mono text-center">
                  *QMS-{printedTicket.number.replace('-', '')}-{Date.now().toString().slice(-4)}*
                </div>
              </div>

              <div className="text-[7px] text-gray-400 text-center uppercase tracking-wide mt-4">
                Thank you for your cooperation
              </div>
              <div className="text-[6px] text-gray-400 font-mono text-center mt-0.5">
                {new Date(printedTicket.timestamp).toLocaleString()}
              </div>

            </div>

            {/* Simulated Receipt paper tear-off zigzag edge */}
            <div className="w-full h-4 bg-white select-none pointer-events-none rounded-b-2xl relative overflow-hidden flex" style={{ background: 'transparent' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 max-w-[20px] bg-white h-4 shadow-sm"
                  style={{
                    clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
                  }}
                />
              ))}
            </div>

            {/* Action buttons on thermal pop */}
            <div className="p-5 flex flex-col gap-2 relative z-10">
              <button
                onClick={handleDismissTicket}
                className="w-full py-3 bg-[#031636] hover:bg-[#e30a17] transition text-white font-extrabold text-xs tracking-wider rounded-lg uppercase shadow-lg select-none pointer-events-auto active:scale-95 cursor-pointer"
              >
                Done / Aldım
              </button>
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-white/60 hover:bg-white text-gray-700 transition font-bold text-[10px] tracking-wide rounded-md border border-gray-300 uppercase pointer-events-auto print:hidden"
              >
                Print Voucher
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
