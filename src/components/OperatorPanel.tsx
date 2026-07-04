import React, { useState, useEffect, useRef } from 'react';
import { useQms } from '../qmsState';
import { services } from '../services';
import { Counter, Ticket, CounterStatus } from '../types';
import { 
  Users, Play, CheckCircle, RefreshCw, AlertTriangle, 
  HelpCircle, ChevronRight, UserMinus, ArrowRightLeft, 
  Clock, ShieldAlert, Monitor, UserCheck, BarChart2 
} from 'lucide-react';

export const OperatorPanel: React.FC = () => {
  const {
    tickets,
    counters,
    selectedOperatorId,
    setOperator,
    callNextTicket,
    startService,
    completeService,
    skipTicket,
    recallTicket,
    transferTicket,
    setCounterStatus,
    accentLanguage
  } = useQms();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<number>(9); // Default to Counter 9 Cashier
  const [transferReason, setTransferReason] = useState('Payment / Ödeme');
  const [transferPriority, setTransferPriority] = useState(false);
  const [elapsedString, setElapsedString] = useState('00:00');
  
  // Timer references
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find current counter and ticket
  const currentCounter = counters.find(c => c.id === selectedOperatorId) || counters[5]; // Fallback Counter 6
  const currentTicket = tickets.find(t => t.id === currentCounter.currentTicketId);
  const assignedService = services.find(s => s.assignedCounter === currentCounter.id) || services[5];

  // Elapsed stopwatch logic for active serving ticket
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (currentTicket && (currentTicket.status === 'serving' || currentTicket.status === 'calling')) {
      const startTimeStr = currentTicket.startedAt || currentTicket.calledAt || new Date().toISOString();
      const startTime = new Date(startTimeStr).getTime();

      const updateTimer = () => {
        const diffMs = Date.now() - startTime;
        const totalSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setElapsedString(
          `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      };

      updateTimer(); // Initial call
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      setElapsedString('00:00');
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentTicket, selectedOperatorId]);

  // Handle transfer trigger
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferTicket(currentCounter.id, transferTargetId, transferReason);
    setIsTransferModalOpen(false);
  };

  // Find specific lists of tickets for this counter's service
  const waitingTickets = tickets.filter(t => 
    t.status === 'waiting' && 
    t.serviceId === assignedService.id &&
    t.source === 'direct'
  );

  const transferredTickets = tickets.filter(t => 
    t.status === 'waiting' && 
    t.serviceId === assignedService.id &&
    t.source === 'transferred'
  );

  const nextWaitingTicket = transferredTickets[0] || waitingTickets[0] || null;

  return (
    <div className="flex h-full bg-[#f1f5f9] font-sans text-[#191c1e] select-none">
      
      {/* 1. Administrative Sidebar */}
      <aside className="w-64 bg-[#031636] text-white flex flex-col flex-shrink-0 relative overflow-hidden">
        {/* Subtle Watermark Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
        
        {/* Sidebar Header Category */}
        <div className="p-6 border-b border-blue-950 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center font-bold text-amber-500 border border-white/5">
            🇹🇷
          </div>
          <div>
            <h2 className="font-extrabold tracking-tight text-md">Consular Services</h2>
            <p className="text-[10px] font-bold text-[#8293ba] uppercase tracking-wider">Erbil Mission</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 z-10">
          <a href="#dashboard" className="flex items-center gap-3.5 px-4 py-3 bg-white/10 text-white text-sm font-bold rounded-lg transition border-l-4 border-amber-500">
            <Monitor size={18} className="text-amber-500" />
            <span>Dashboard / Panel</span>
          </a>
          <a href="#live" className="flex items-center gap-3.5 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-bold rounded-lg transition">
            <Users size={18} className="text-slate-400" />
            <span>Live Queue / Canlı Sıra</span>
          </a>
          <a href="#counters" className="flex items-center gap-3.5 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-bold rounded-lg transition">
            <ArrowRightLeft size={18} className="text-slate-400" />
            <span>Bankolar / Service Counters</span>
          </a>
          <a href="#staff" className="flex items-center gap-3.5 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-bold rounded-lg transition">
            <UserCheck size={18} className="text-slate-400" />
            <span>Personel / Staff</span>
          </a>
          <a href="#analytics" className="flex items-center gap-3.5 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-bold rounded-lg transition">
            <BarChart2 size={18} className="text-slate-400" />
            <span>Analiz / Analytics</span>
          </a>
        </nav>

        {/* User Info footer in Side Panel */}
        <div className="p-5 border-t border-blue-950 bg-blue-950/20 text-slate-400 text-xs z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-[#8293ba] uppercase">Teller Station</span>
          </div>
          <div className="text-[11px] font-bold text-white/50">{currentTimeStr()}</div>
        </div>
      </aside>

      {/* 2. Main Workstation Space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Ribbon bar */}
        <header className="bg-white border-b border-slate-200 h-20 px-8 flex justify-between items-center relative z-10 flex-shrink-0">
          
          {/* Active counter identifier */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-black text-[#031636]">
                  Counter {currentCounter.id} / Banko {currentCounter.id}
                </span>
                <span className="text-xs font-bold text-gray-400 self-center">—</span>
                <span className="text-sm font-bold text-gray-500">
                  {assignedService.nameTu} / {assignedService.nameEn}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Officer: <strong className="text-gray-700 font-extrabold">{currentCounter.officerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulation Desk Switcher Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Switch Desk:</span>
              <select
                value={selectedOperatorId}
                onChange={(e) => setOperator(parseInt(e.target.value, 10))}
                className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#031636] focus:outline-none focus:border-amber-500"
              >
                {counters.map(c => {
                  const srv = services.find(s => s.assignedCounter === c.id);
                  return (
                    <option key={c.id} value={c.id}>
                      Counter {c.id} ({srv?.nameTu.slice(0, 18)}...)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Counter status dropdown selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desk Status:</span>
              <select
                value={currentCounter.status}
                onChange={(e) => setCounterStatus(currentCounter.id, e.target.value as CounterStatus)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                  currentCounter.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  currentCounter.status === 'busy' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  currentCounter.status === 'break' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <option value="active">● Active / Aktif</option>
                <option value="busy">● Busy / Meşgul</option>
                <option value="break">● Break / Molada</option>
                <option value="closed">● Closed / Kapalı</option>
              </select>
            </div>
          </div>

        </header>

        {/* Lower Main Area Split with Right Rail */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main workspace section (with scroll) */}
          <main className="flex-1 p-8 overflow-y-auto space-y-8">
            
            {/* 2A. Top Section: Serving module & Stats side-by-side */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              
              {/* CURRENTLY SERVING BOARD (8 of 12 columns) */}
              <div className="col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden relative">
                
                {/* Board blue category header */}
                <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Currently Serving / Şu Anda Hizmet Verilen
                  </span>
                  {currentTicket && (
                    <span className="px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-50 rounded border border-red-100 animate-pulse uppercase tracking-wider">
                      {currentTicket.source === 'transferred' ? 'Transferred Citizen' : 'Direct Ticket'}
                    </span>
                  )}
                </div>

                {/* Main panel displays */}
                <div className="flex-1 p-8 flex items-center justify-around">
                  {currentTicket ? (
                    <div className="w-full flex justify-between items-center px-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ACTIVE QUEUE PREFIX</p>
                          <h4 className="text-7xl font-sans font-black tracking-tighter text-[#031636]">
                            {currentTicket.number}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-sm text-gray-500 bg-gray-50 border border-gray-100 p-2 rounded-lg">
                          <Clock size={15} className="text-slate-400" />
                          <span>Started: <strong className="text-slate-800 font-extrabold">{elapsedString}</strong> mins ago</span>
                        </div>
                      </div>
                      
                      {/* Interactive Teller Actions */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        
                        {currentTicket.status === 'calling' ? (
                          <button
                            onClick={() => startService(currentCounter.id)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                          >
                            <Play size={16} />
                            <span>START SERVICE</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => completeService(currentCounter.id)}
                            className="w-full py-4 bg-[#031636] hover:bg-[#e30a17] text-white rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                          >
                            <CheckCircle size={16} />
                            <span>COMPLETE / BİTİR</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => recallTicket(currentCounter.id)}
                            className="py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-[#031636] font-bold text-xs flex items-center justify-center gap-1 transition active:bg-slate-100 cursor-pointer"
                            title="Re-announce waiting ticket"
                          >
                            <RefreshCw size={13} className="text-amber-500" />
                            <span>RECALL</span>
                          </button>
                          
                          <button
                            onClick={() => skipTicket(currentCounter.id)}
                            className="py-2.5 rounded-lg border border-red-200 hover:border-red-300 bg-red-50/50 text-red-700 font-bold text-xs flex items-center justify-center gap-1 transition active:bg-red-50 cursor-pointer"
                            title="Flag as citizen no-show"
                          >
                            <UserMinus size={13} />
                            <span>NO-SHOW</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setIsTransferModalOpen(true)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 font-black text-xs tracking-wide rounded-lg flex items-center justify-center gap-2 cursor-pointer transition uppercase"
                        >
                          <ArrowRightLeft size={13} />
                          <span>Transfer Ticket</span>
                        </button>

                      </div>
                    </div>
                  ) : (
                    // Display blank station when no current user
                    <div className="text-center py-6 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={32} />
                      </div>
                      <div>
                        <h4 className="text-md font-bold text-slate-500">No citizen currently being called</h4>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Please fetch from the active department queue below</p>
                      </div>
                      <button
                        onClick={() => callNextTicket(currentCounter.id)}
                        disabled={!nextWaitingTicket}
                        className={`mt-4 px-6 py-3.5 rounded-lg font-extrabold text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition uppercase ${
                          nextWaitingTicket 
                            ? 'bg-[#031636] hover:bg-[#e30a17] text-white' 
                            : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <Play size={14} />
                        <span>Call Next Citizen</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
              
              {/* NEXT IN QUEUE & STATS (4 of 12 columns) */}
              <div className="col-span-4 flex flex-col gap-5 justify-between">
                
                {/* Call Next Drawer Card */}
                <div className="bg-[#031636] text-white rounded-xl shadow-xs p-5 flex-1 flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute top-1 right-1 opacity-5 text-white"><Users size={120} /></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-[#8293ba] uppercase">NEXT IN QUEUE</p>
                      {nextWaitingTicket ? (
                        <h4 className="text-3xl font-sans font-black tracking-tight mt-1 text-white">{nextWaitingTicket.number}</h4>
                      ) : (
                        <h4 className="text-lg font-bold mt-1 text-slate-400">Queue Empty</h4>
                      )}
                    </div>
                    {nextWaitingTicket && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-900 rounded-sm text-[9px] font-black uppercase">
                        {nextWaitingTicket.source === 'transferred' ? 'Priority' : 'Direct'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => callNextTicket(currentCounter.id)}
                    disabled={!nextWaitingTicket}
                    className={`w-full py-3.5 rounded-lg font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase active:scale-98 transition ${
                      nextWaitingTicket 
                        ? 'bg-amber-500 hover:bg-white text-slate-900 hover:text-[#031636]' 
                        : 'bg-blue-950/50 text-blue-800/100 border border-blue-900/50 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <RefreshCw size={14} className={nextWaitingTicket ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
                    <span>Call Next / Sıradakini Çağır</span>
                  </button>
                </div>

                {/* Counter Statistics strip */}
                <div className="bg-white rounded-xl shadow-xs p-5 border border-slate-200 flex justify-around text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">SERVED</span>
                    <strong className="text-2xl font-black text-slate-800">{currentCounter.servedCount}</strong>
                  </div>
                  <div className="w-px h-10 bg-slate-200 self-center" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">AVG TEMP</span>
                    <strong className="text-2xl font-black text-slate-800">{currentCounter.avgServiceTime}m</strong>
                  </div>
                  <div className="w-px h-10 bg-slate-200 self-center" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">NO-SHOW</span>
                    <strong className="text-2xl font-black text-slate-800 text-rose-600">{currentCounter.noShowCount}</strong>
                  </div>
                </div>

              </div>

            </div>

            {/* 2B. Lower Section: Tables for Active queues / Transferred queues */}
            <div className="space-y-6">
              
              {/* PASSPORT SERVICES QUEUE / DIRECT QUEUE */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-black text-[#031636] uppercase tracking-wider">
                    {assignedService.nameTu} Queue / {assignedService.nameEn}
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-[#031636] block rounded text-[10px] font-extrabold uppercase">
                    Waiting size: {waitingTickets.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="px-6 py-4">Ticket ID</th>
                        <th className="px-6 py-4">Hizmet Türü / Category</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Waiting time</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {waitingTickets.length > 0 ? (
                        waitingTickets.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-3.5 font-bold text-[#031636]">{t.number}</td>
                            <td className="px-6 py-3.5 uppercase text-slate-500 font-extrabold max-w-[150px] truncate">{assignedService.nameTu}</td>
                            <td className="px-6 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 font-black uppercase">Direct</span>
                            </td>
                            <td className="px-6 py-3.5 text-gray-500 font-mono">{formatWaitTime(t.timestamp)}</td>
                            <td className="px-6 py-3.5 text-right">
                              <button
                                onClick={() => callNextTicket(currentCounter.id)}
                                className="px-3.5 py-1.5 bg-[#031636] hover:bg-[#e30a17] transition text-white font-black text-[10px] uppercase rounded"
                              >
                                Call
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Replica mock row lists
                        <tr className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-3.5 font-bold text-[#031636]">{assignedService.prefix}-443</td>
                          <td className="px-6 py-3.5 text-slate-500 font-extrabold uppercase">{assignedService.nameTu}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 font-black uppercase">Direct Ticket</span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-500 font-mono">08m 12s</td>
                          <td className="px-6 py-3.5 text-right">
                            <button className="px-3.5 py-1.5 bg-slate-200 text-slate-400 font-black text-[10px] uppercase rounded opacity-60 cursor-not-allowed">
                              Call
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TRANSFERRED TICKETS ACTION BOARD */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-purple-500" />
                    <span>Transferred Tickets / Transfer Edilenler</span>
                  </h3>
                  <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 text-[10px] font-black uppercase">
                    Needs Priority: {transferredTickets.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="px-6 py-4">Ticket ID</th>
                        <th className="px-6 py-4">Service Type</th>
                        <th className="px-6 py-4">From Counter</th>
                        <th className="px-6 py-4">Transfer Reason</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {transferredTickets.length > 0 ? (
                        transferredTickets.map((t) => (
                          <tr key={t.id} className="hover:bg-purple-50/20 transition">
                            <td className="px-6 py-3.5 font-bold text-slate-950 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                              <span>{t.number}</span>
                            </td>
                            <td className="px-6 py-3.5 uppercase font-black text-slate-400 tracking-wider">Collection</td>
                            <td className="px-6 py-3.5 font-bold text-slate-600">Counter {t.transferredFrom}</td>
                            <td className="px-6 py-3.5 text-slate-500">{t.transferReason || 'Document check'}</td>
                            <td className="px-6 py-3.5 text-right">
                              <button
                                onClick={() => callNextTicket(currentCounter.id)}
                                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 transition text-white font-black text-[10px] uppercase rounded shadow-xs"
                              >
                                Call Priority
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Mock row as shown in Operator counter 6 image mockup
                        <tr className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-3.5 font-bold text-slate-950 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>P-438</span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-400 uppercase font-black tracking-widest">Collection</td>
                          <td className="px-6 py-3.5 text-slate-600 font-bold">Counter 01</td>
                          <td className="px-6 py-3.5 text-slate-500 italic">Additional document check</td>
                          <td className="px-6 py-3.5 text-right">
                            <button className="px-3.5 py-1.5 bg-slate-200 text-slate-400 font-black text-[10px] uppercase rounded opacity-60 cursor-not-allowed">
                              Call Priority
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </main>
          
          {/* Right Side Rail Information */}
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 justify-between overflow-y-auto">
            
            <div className="p-6 space-y-6">
              
              {/* OPERATIONAL NOTICE CARD */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 space-y-2.5">
                <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={15} />
                  <span>Operational Notice</span>
                </h4>
                <div className="h-0.5 w-[50px] bg-rose-500 rounded-full" />
                <p className="text-[11px] font-semibold text-rose-700/90 leading-snug">
                  Urgent: Server maintenance scheduled at 17:00 local time. Please ensure all ongoing citizen services are concluded and checked in prior to shutdown.
                </p>
              </div>

              {/* TEAM SESSIONS LISTING */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-[#031636] uppercase tracking-wider">Team Activity</span>
                  <span className="text-[10px] text-gray-400 font-bold">9 Desks</span>
                </div>

                <div className="space-y-2.5 font-semibold text-xs text-slate-700">
                  {counters.map((c) => {
                    const matchedTicket = tickets.find(t => t.id === c.currentTicketId);
                    return (
                      <div key={c.id} className="flex justify-between items-center py-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                            c.status === 'active' ? 'bg-emerald-500' :
                            c.status === 'busy' ? 'bg-amber-500 animate-pulse' :
                            c.status === 'break' ? 'bg-rose-500' : 'bg-gray-400'
                          }`} />
                          <span className="font-extrabold text-[#031636] min-w-[65px]">Desk {String(c.id).padStart(2, '0')}</span>
                          <span className="text-slate-400 text-[11px] text-ellipsis max-w-[80px] overflow-hidden whitespace-nowrap">{c.officerName}</span>
                        </div>
                        <span className="font-bold text-gray-500 font-mono text-right">
                          {matchedTicket ? matchedTicket.number : (c.status === 'break' ? 'Break' : 'N/A')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Occupany status lobby card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-slate-100/50 to-transparent pointer-events-none" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">CURRENT LOBBY STATUS</span>
                <strong className="text-5xl font-black text-[#031636] block my-2">42</strong>
                <span className="px-3 py-1 bg-white border border-slate-200 text-[#031636] text-[10px] font-black uppercase rounded-lg shadow-2xs">
                  Citizens Waiting (Lobby)
                </span>
              </div>

            </div>

            {/* Bottom help line */}
            <div className="p-6 border-t border-slate-100 text-[10px] text-slate-400 font-semibold space-y-1">
              <span className="text-[#031636] font-bold">Diplomatic Operations Panel</span>
              <p>For urgent hardware/terminal malfunctions, please escalate to IT Coordinator desk.</p>
            </div>

          </aside>

        </div>

      </div>

      {/* 3. MULTI-COUNTER DYNAMIC TRANSFER DIALOG POPUP */}
      {isTransferModalOpen && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleTransferSubmit}
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-scale-up"
          >
            <div className="bg-[#031636] text-white px-6 py-4.5 flex justify-between items-center">
              <h3 className="text-md font-extrabold tracking-tight">Transfer Current Citizen</h3>
              <button 
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded"
              >
                <ChevronRight className="rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-semibold text-slate-700">
              
              {/* Counter selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wide font-bold">Target Counter / Banko:</label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 font-bold text-[#031636] focus:outline-none focus:border-amber-500"
                >
                  {counters
                    .filter(c => c.id !== currentCounter.id)
                    .map(c => {
                      const srvName = services.find(s => s.assignedCounter === c.id)?.nameTu || 'Bilinmiyor';
                      return (
                        <option key={c.id} value={c.id}>
                          Desk {String(c.id).padStart(2, '0')} — {srvName} / Cashier
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Transfer reason selector */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wide font-bold">Transfer Reason / Nedeni:</label>
                <select
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 text-[#031636] font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Payment / Ödeme">Payment / Ödeme (To Vezne/Cashier)</option>
                  <option value="Additional document check">Additional document check / Ek Belge İncelemesi</option>
                  <option value="Supervisor Escallation">Supervisor Escalation / Amir Onayı</option>
                  <option value="Citizenship Procedures">Citizenship Procedures / Vatandaşlık Birimi</option>
                  <option value="Biometric photo rescan">Biometric photo rescan / Biyometrik Tarama</option>
                </select>
              </div>

              {/* Priority checkbox option */}
              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="transfer_priority"
                  checked={transferPriority}
                  onChange={(e) => setTransferPriority(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="transfer_priority" className="text-slate-600 font-extrabold pb-0.5 cursor-pointer">
                  Tag as Priority Transfer (Places ticket at head of target queue)
                </label>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-2 text-[10px] font-semibold text-amber-800 leading-snug">
                <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
                <span>
                  The ticket number (e.g. <strong>{currentTicket?.number || 'A-104'}</strong>) will be preserved. This citizen will retain their original card and be auto-routed into the selected target department queue.
                </span>
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 font-bold uppercase rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold uppercase rounded-md transition hover:shadow-md cursor-pointer"
              >
                Submit Route
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

// Simple helper to calculate wait duration
function formatWaitTime(timestamp: string): string {
  const diffSecs = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSecs < 60) return `${diffSecs}s`;
  const mins = Math.floor(diffSecs / 60);
  const secs = diffSecs % 60;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

// Format UTC text
function currentTimeStr(): string {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}
