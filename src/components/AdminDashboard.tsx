import React, { useState } from 'react';
import { useQms } from '../qmsState';
import { services } from '../services';
import { Counter, CounterStatus } from '../types';
import { Emblem } from './Emblem';
import { 
  PlusCircle, Database, RefreshCw, BarChart2, 
  Settings, UserCheck, TrendingUp, TrendingDown, Clock, 
  MapPin, Radio, Calendar, Download, AlertCircle 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    tickets,
    counters,
    setCounterStatus,
    issueNewTicket,
    resetAllQueues
  } = useQms();

  const [simulatedServiceId, setSimulatedServiceId] = useState('passport');
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  // Trigger simulated client queuing on click
  const handleSimulateQueue = () => {
    issueNewTicket(simulatedServiceId);
    setShowConfigAlert(true);
    setTimeout(() => setShowConfigAlert(false), 2000);
  };

  // Compute live aggregates from data state + Seed constants representing long-term metrics
  const liveWaitingCount = tickets.filter(t => t.status === 'waiting').length;
  const activeCountersCount = counters.filter(c => c.status === 'active' || c.status === 'busy').length;
  
  // Custom seed factors + live modifier
  const totalTicketsTodayCount = 1220 + tickets.length;
  const averageWaitMinutes = 14;

  const getServiceWaitingCount = (srvId: string) => {
    return tickets.filter(t => t.serviceId === srvId && t.status === 'waiting').length;
  };

  // Cashier (Counter 9) split stats
  const cashierDirectWaiting = tickets.filter(t => 
    t.serviceId === 'cashier' && 
    t.status === 'waiting' && 
    t.source === 'direct'
  ).length;

  const cashierTransferredWaiting = tickets.filter(t => 
    t.serviceId === 'cashier' && 
    t.status === 'waiting' && 
    t.source === 'transferred'
  ).length;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans text-gray-900 select-none overflow-y-auto">
      
      {/* 1. Header Area with admin context */}
      <header className="bg-white border-b border-gray-200 px-10 py-5.5 flex justify-between items-center flex-shrink-0 shadow-xs relative">
        <div className="flex items-center gap-4">
          <Emblem size={52} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#031636]">
              Turkish Embassy Erbil
            </h1>
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Consular Services Dashboard • Diplomatic System Overview
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          {/* Quick simulator helper */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <select
              value={simulatedServiceId}
              onChange={(e) => setSimulatedServiceId(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black text-[#031636] focus:outline-none px-2 py-1 uppercase"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.nameTu.slice(0, 15)}...</option>
              ))}
            </select>
            <button
              onClick={handleSimulateQueue}
              className="px-3 py-1 bg-[#031636] hover:bg-[#e30a17] transition text-white font-black text-[10px] rounded uppercase cursor-pointer"
            >
              Queue Citizen
            </button>
          </div>

          <button
            onClick={resetAllQueues}
            className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-md transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Reset system queues to default"
          >
            <RefreshCw size={15} />
            Reset State
          </button>
        </div>
      </header>

      {/* 2. Admin Body workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-10 space-y-9">
        
        {/* Banner with Transfer Info */}
        <div className="flex justify-between items-center bg-white border border-gray-200/60 p-5 rounded-xl shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-[#031636] tracking-tight">System Overview</h2>
            <p className="text-xs font-semibold text-slate-500">Real-time performance metrics for Erbil Mission consular desks.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600 font-bold">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Transfers Today</span>
              <span>142 transfers</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Transferred Tickets</span>
              <span>18% of total</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex gap-2 items-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar size={14} className="text-slate-400" />
              <span>June 24, 2026</span>
              <Download size={14} className="text-slate-500 hover:text-black cursor-pointer ml-1" />
            </div>
          </div>
        </div>

        {/* 2A. Top 4 big metrics cards */}
        <div className="grid grid-cols-4 gap-6">
          
          {/* Card 1: Total tickets */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-xs flex flex-col justify-between items-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1 bg-blue-600 w-full" />
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">TOTAL TICKETS TODAY</span>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-4xl font-extrabold tracking-tight text-slate-800">{totalTicketsTodayCount}</strong>
              <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <TrendingUp size={14} />
                +12%
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mt-6">
              <Database size={15} />
            </div>
          </div>

          {/* Card 2: Average Wait Time */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-xs flex flex-col justify-between items-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1 bg-amber-500 w-full" />
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">AVERAGE WAIT TIME</span>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-4xl font-extrabold tracking-tight text-slate-800">{averageWaitMinutes}m</strong>
              <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                <TrendingDown size={14} />
                -2%
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mt-6">
              <Clock size={15} />
            </div>
          </div>

          {/* Card 3: Active Counters */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-xs flex flex-col justify-between items-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1 bg-emerald-500 w-full" />
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">ACTIVE COUNTERS</span>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-4xl font-extrabold tracking-tight text-slate-800">
                {pad(activeCountersCount)} <span className="text-lg font-medium text-gray-400">/ 09</span>
              </strong>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm border border-emerald-100 text-[9px] font-black uppercase tracking-wider animate-pulse ml-2">
                <Radio size={10} className="animate-pulse" />
                Live
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-6">
              <MapPin size={15} />
            </div>
          </div>

          {/* Card 4: Currently Waiting (DARK PANEL AS REQUESTED IN DIRECT IMAGE 3) */}
          <div className="bg-[#031636] p-6 rounded-xl shadow-md flex flex-col justify-between items-start relative overflow-hidden text-white border border-blue-950">
            <span className="text-[10px] font-black text-[#8293ba] tracking-wider uppercase">CURRENTLY WAITING</span>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-5xl font-black font-sans leading-none tracking-tight">{liveWaitingCount + 3}</strong>
              <span className="text-[10px] font-bold text-[#8293ba] uppercase font-mono mb-px">Citizens</span>
            </div>
            
            {/* Custom styled progress meter */}
            <div className="w-full mt-4 space-y-1.5 text-[9px] font-extrabold text-[#8293ba]">
              <div className="h-1.5 bg-blue-950 border border-blue-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-4/5" />
              </div>
              <div className="w-full flex justify-between">
                <span>SECH SCHED STATUS</span>
                <span className="text-white">OPTIMAL</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2B. Middle section splits: Queue by category AND cashier stats */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          
          {/* QUEUE BY SERVICE COMPARTMENT (8 of 12 columns) */}
          <div className="col-span-7 bg-white rounded-xl border border-gray-200/50 p-6 flex flex-col justify-between relative shadow-xs">
            <h3 className="text-sm font-black text-[#031636] uppercase tracking-wider border-b border-gray-100 pb-3">
              Queue by Service / Hizmet Başına Bekleyenler
            </h3>

            {/* Grid of prefixes */}
            <div className="grid grid-cols-3 gap-4 py-6">
              {services.map((service) => {
                const waitCount = getServiceWaitingCount(service.id);
                // Hardcoded fallback base values corresponding exactly to mockup image sizes when queue is quiet
                const displayCount = waitCount > 0 ? waitCount : srvMockQuantity(service.prefix);
                
                return (
                  <div 
                    key={service.id} 
                    className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg flex justify-between items-center hover:bg-slate-100/50 transition"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-lg font-black text-[#031636] block tracking-tight">{service.prefix}</strong>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide truncate max-w-[100px] block">
                        {service.nameTu.slice(0, 15)}...
                      </span>
                    </div>
                    {/* Big count digit representation */}
                    <div className="text-2xl font-black text-slate-800">
                      {displayCount}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CASHIER VEZNE OPERATIONS COMPARTMENT */}
          <div className="col-span-5 bg-white rounded-xl border border-gray-200/50 p-6 flex flex-col justify-between relative shadow-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-[#031636] uppercase tracking-wider">
                Cashier (Vezne) Operations
              </h3>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 font-extrabold uppercase">
                ● Active
              </span>
            </div>

            {/* Split cards representing direct cashier vs transferred cashier */}
            <div className="grid grid-cols-2 gap-4 py-6 h-full items-stretch">
              
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg text-center flex flex-col justify-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">DIRECT QUEUE</span>
                <strong className="text-4xl font-extrabold text-[#031636] block tracking-tight">
                  {cashierDirectWaiting > 0 ? cashierDirectWaiting : 24}
                </strong>
                <span className="text-[10px] text-slate-500 font-semibold uppercase font-mono">Waiting for payment</span>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-lg text-center flex flex-col justify-center gap-1">
                <span className="text-[9px] font-bold text-blue-500 tracking-wider uppercase block">TRANSFERRED QUEUE</span>
                <strong className="text-4xl font-extrabold text-blue-900 block tracking-tight">
                  {cashierTransferredWaiting > 0 ? cashierTransferredWaiting : 8}
                </strong>
                <span className="text-[10px] text-blue-500 font-semibold uppercase font-mono">From other counters</span>
              </div>

            </div>
          </div>

        </div>

        {/* 2C. DESK OPERATIONS TABLE (Full width) */}
        <section className="bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-xs">
          
          <div className="px-8 py-5.5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-md font-black text-[#031636] tracking-tight">Desk Operations</h3>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">Summary: All counters can transfer tickets to all other counters.</p>
            </div>
            
            <button
              onClick={() => setShowConfigAlert(true)}
              className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase transition hover:bg-slate-200"
            >
              View All Details
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 font-extrabold text-[10px] text-slate-400 bg-slate-50 uppercase tracking-widest">
                  <th className="px-8 py-4">Desk #</th>
                  <th className="px-8 py-4">Officer</th>
                  <th className="px-8 py-4">Assigned Service</th>
                  <th className="px-8 py-4">Current Ticket</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-slate-700">
                {counters.map((c) => {
                  const srv = services.find(s => s.assignedCounter === c.id);
                  const matchedTicket = tickets.find(t => t.id === c.currentTicketId);
                  const ticketNumber = matchedTicket ? matchedTicket.number : 'N/A';
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-3.5 font-bold text-slate-900">{pad(c.id)}</td>
                      <td className="px-8 py-3.5">{c.officerName}</td>
                      <td className="px-8 py-3.5 text-slate-500">
                        {srv ? `${srv.nameTu} / ${srv.nameEn.slice(0, 20)}...` : 'Vezne / Cashier'}
                      </td>
                      <td className="px-8 py-3.5 font-mono">
                        {ticketNumber !== 'N/A' ? (
                          <span className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-extrabold">
                            {ticketNumber}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold uppercase">N/A</span>
                        )}
                      </td>
                      <td className="px-8 py-3.5">
                        <div className="flex items-center gap-1.5 select-none">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            c.status === 'active' ? 'bg-emerald-500' :
                            c.status === 'busy' ? 'bg-amber-400' :
                            c.status === 'break' ? 'bg-rose-500' : 'bg-gray-400'
                          }`} />
                          <span className="capitalize font-bold text-slate-800">{c.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-3.5 text-right font-sans">
                        {/* Instant Modifier buttons */}
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setCounterStatus(c.id, c.status === 'active' ? 'break' : 'active')}
                            className="px-2.5 py-1 text-[9px] font-black border border-slate-200 rounded text-slate-500 hover:text-[#031636] uppercase bg-slate-50 transition select-none"
                          >
                            Toggle Break
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </section>

      </main>

      {/* Floating simulator helper alerts */}
      {showConfigAlert && (
        <div className="fixed bottom-10 right-10 z-50 bg-[#031636] border border-blue-900 text-white p-4.5 rounded-xl shadow-2xl max-w-sm flex items-center gap-3 animate-slide-up select-none">
          <AlertCircle className="text-amber-500 flex-shrink-0 animate-bounce" />
          <div className="text-xs">
            <strong className="font-extrabold text-white block">Simulation Activated!</strong>
            <span className="font-semibold text-slate-300">A new client has queued! Switch to the Operator panel to fetch and call the ticket.</span>
          </div>
        </div>
      )}

    </div>
  );
};

// Help helper for counts in screen overview
function pad(num: number): string {
  return String(num).padStart(2, '0');
}

function srvMockQuantity(prefix: string): number {
  if (prefix === 'A') return 12;
  if (prefix === 'CT') return 5;
  if (prefix === 'N') return 8;
  if (prefix === 'M') return 2;
  if (prefix === 'B') return 4;
  if (prefix === 'P') return 15;
  if (prefix === 'ID') return 9;
  if (prefix === 'NT') return 6;
  if (prefix === 'C') return 3;
  return 0;
}
