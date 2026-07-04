import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Ticket, Counter, Service, TicketStatus, CounterStatus } from './types';
import { services } from './services';

// Sound synthesis using Web Audio API (No files required, works fully offline)
export const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.12, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioCtx.currentTime;
    // Elegant arpeggio chime (D5 -> G5)
    playNote(587.33, now, 0.35); // D5
    playNote(783.99, now + 0.12, 0.45); // G5
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// Text-to-speech announcement
export const speakTicket = (ticketNumber: string, counterId: number, lang: 'tr' | 'en' = 'tr') => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop current playing audio
    
    // Format letter-number ticket nicely (e.g., P 4 4 2)
    const match = ticketNumber.match(/^([A-Za-z]+)-?(\d+)$/);
    let readableTicket = ticketNumber;
    if (match) {
      const letters = match[1].split('').join(' ');
      const numbers = match[2].split('').join(' ');
      readableTicket = `${letters} ${numbers}`;
    }
    
    const text = lang === 'tr'
      ? `Bilet numarası, ${readableTicket}. Lütfen, ${counterId} numaralı bankoya ilerleyiniz.`
      : `Ticket number, ${readableTicket}. Please proceed to counter ${counterId}.`;
      
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
};

// Initial Counter Configuration as shown in Administrative panel
const initialCounters: Counter[] = [
  { id: 1, officerName: 'Ahmet Yılmaz', status: 'active', currentTicketId: 'ticket-a104', servedCount: 26, noShowCount: 2, avgServiceTime: 12 },
  { id: 2, officerName: 'Fatma Kaya', status: 'busy', currentTicketId: 'ticket-ct012', servedCount: 18, noShowCount: 1, avgServiceTime: 16 },
  { id: 3, officerName: 'Omar S.', status: 'break', currentTicketId: null, servedCount: 14, noShowCount: 3, avgServiceTime: 11 },
  { id: 4, officerName: 'Zeynep Demir', status: 'active', currentTicketId: 'ticket-m002', servedCount: 22, noShowCount: 0, avgServiceTime: 15 },
  { id: 5, officerName: 'Mehmet Öz', status: 'active', currentTicketId: 'ticket-b412', servedCount: 31, noShowCount: 2, avgServiceTime: 14 },
  { id: 6, officerName: 'Ayşe Bulut', status: 'busy', currentTicketId: 'ticket-p442', servedCount: 28, noShowCount: 1, avgServiceTime: 15 },
  { id: 7, officerName: 'Ali Şahin', status: 'active', currentTicketId: 'ticket-id002', servedCount: 24, noShowCount: 1, avgServiceTime: 13 },
  { id: 8, officerName: 'Dilan Aras', status: 'active', currentTicketId: 'ticket-nt202', servedCount: 19, noShowCount: 2, avgServiceTime: 18 },
  { id: 9, officerName: 'Hassan K.', status: 'active', currentTicketId: 'ticket-c010', servedCount: 34, noShowCount: 0, avgServiceTime: 8 }
];

// Initial Seed Tickets to populate the queue realistically
const initialTickets: Ticket[] = [
  // Completed today
  { id: 'ticket-hist1', number: 'B-411', serviceId: 'birth', status: 'completed', source: 'direct', timestamp: '2026-06-09T08:30:00Z', duration: 720 },
  { id: 'ticket-hist2', number: 'A-101', serviceId: 'attestation', status: 'completed', source: 'direct', timestamp: '2026-06-09T08:35:00Z', duration: 480 },
  { id: 'ticket-hist3', number: 'C-009', serviceId: 'cashier', status: 'completed', source: 'direct', timestamp: '2026-06-09T08:40:00Z', duration: 300 },
  { id: 'ticket-hist4', number: 'M-001', serviceId: 'marriage', status: 'completed', source: 'direct', timestamp: '2026-06-09T08:45:00Z', duration: 900 },
  { id: 'ticket-hist5', number: 'P-440', serviceId: 'passport', status: 'completed', source: 'direct', timestamp: '2026-06-09T08:50:00Z', duration: 650 },
  { id: 'ticket-hist6', number: 'P-441', serviceId: 'passport', status: 'completed', source: 'direct', timestamp: '2026-06-09T09:00:00Z', duration: 710 },
  { id: 'ticket-hist7', number: 'CT-011', serviceId: 'citizenship', status: 'completed', source: 'direct', timestamp: '2026-06-09T09:10:00Z', duration: 1100 },
  { id: 'ticket-hist8', number: 'ID-001', serviceId: 'id', status: 'completed', source: 'direct', timestamp: '2026-06-09T09:15:00Z', duration: 520 },
  { id: 'ticket-hist9', number: 'NT-201', serviceId: 'notary', status: 'completed', source: 'direct', timestamp: '2026-06-09T09:20:00Z', duration: 840 },

  // Currently Serving on Counters
  { id: 'ticket-a104', number: 'A-104', serviceId: 'attestation', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:45:00Z', startedAt: '2026-06-09T11:47:00Z' },
  { id: 'ticket-ct012', number: 'CT-012', serviceId: 'citizenship', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:40:00Z', startedAt: '2026-06-09T11:42:00Z' },
  { id: 'ticket-m002', number: 'M-002', serviceId: 'marriage', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:43:00Z', startedAt: '2026-06-09T11:45:00Z' },
  { id: 'ticket-b412', number: 'B-412', serviceId: 'birth', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:48:00Z', startedAt: '2026-06-09T11:50:00Z' },
  { id: 'ticket-p442', number: 'P-442', serviceId: 'passport', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:46:00Z', startedAt: '2026-06-09T11:51:00Z' },
  { id: 'ticket-id002', number: 'ID-002', serviceId: 'id', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:42:00Z', startedAt: '2026-06-09T11:44:00Z' },
  { id: 'ticket-nt202', number: 'NT-202', serviceId: 'notary', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:38:00Z', startedAt: '2026-06-09T11:40:00Z' },
  { id: 'ticket-c010', number: 'C-010', serviceId: 'cashier', status: 'serving', source: 'direct', timestamp: '2026-06-09T11:47:00Z', startedAt: '2026-06-09T11:49:00Z' },

  // Waiting in Queue (Ready to be called)
  // Attestation (Counter 1)
  { id: 'ticket-a105', number: 'A-105', serviceId: 'attestation', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:48:00Z' },
  { id: 'ticket-a106', number: 'A-106', serviceId: 'attestation', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:50:00Z' },
  { id: 'ticket-a107', number: 'A-107', serviceId: 'attestation', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:52:00Z' },
  
  // Citizenship (Counter 2)
  { id: 'ticket-ct013', number: 'CT-013', serviceId: 'citizenship', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:46:00Z' },
  { id: 'ticket-ct014', number: 'CT-014', serviceId: 'citizenship', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:51:00Z' },

  // Notice Group (Counter 3 is on break, but queue stacks up)
  { id: 'ticket-n021', number: 'N-021', serviceId: 'notice', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:39:00Z' },
  { id: 'ticket-n022', number: 'N-022', serviceId: 'notice', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:45:00Z' },
  { id: 'ticket-n023', number: 'N-023', serviceId: 'notice', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:50:00Z' },

  // Marriage (Counter 4)
  { id: 'ticket-m003', number: 'M-003', serviceId: 'marriage', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:49:00Z' },

  // Birth Certificate (Counter 5)
  { id: 'ticket-b413', number: 'B-413', serviceId: 'birth', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:51:00Z' },

  // Passport (Counter 6) - Matches screenshot where P-443 and P-444 are in queue
  { id: 'ticket-p443', number: 'P-443', serviceId: 'passport', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:44:00Z' },
  { id: 'ticket-p444', number: 'P-444', serviceId: 'passport', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:47:00Z' },

  // Transferred ticket waiting in Passport Queue (from Attestation Counter 1, reason: original document verification)
  { id: 'ticket-p438', number: 'P-438', serviceId: 'passport', status: 'waiting', source: 'transferred', transferredFrom: 1, transferReason: 'Additional document check', timestamp: '2026-06-09T11:42:00Z' },

  // ID Procedures (Counter 7)
  { id: 'ticket-id003', number: 'ID-003', serviceId: 'id', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:49:00Z' },
  { id: 'ticket-id004', number: 'ID-004', serviceId: 'id', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:52:00Z' },

  // Notary (Counter 8)
  { id: 'ticket-nt203', number: 'NT-203', serviceId: 'notary', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:50:00Z' },

  // Cashier (Counter 9)
  { id: 'ticket-c011', number: 'C-011', serviceId: 'cashier', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:49:00Z' },
  { id: 'ticket-c012', number: 'C-012', serviceId: 'cashier', status: 'waiting', source: 'direct', timestamp: '2026-06-09T11:51:00Z' },
  
  // Transferred tickets waiting for payment at Cashier (Vezne)
  { id: 'ticket-trans-c1', number: 'P-435', serviceId: 'cashier', status: 'waiting', source: 'transferred', transferredFrom: 6, transferReason: 'Passport Fee Payment', timestamp: '2026-06-09T11:43:00Z' },
  { id: 'ticket-trans-c2', number: 'NT-198', serviceId: 'cashier', status: 'waiting', source: 'transferred', transferredFrom: 8, transferReason: 'Notary Fee Payment', timestamp: '2026-06-09T11:45:00Z' },
  { id: 'ticket-trans-c3', number: 'A-098', serviceId: 'cashier', status: 'waiting', source: 'transferred', transferredFrom: 1, transferReason: 'Attestation Fee Payment', timestamp: '2026-06-09T11:46:00Z' }
];

export interface QmsContextProps {
  tickets: Ticket[];
  counters: Counter[];
  activeView: 'waiting-room' | 'kiosk' | 'operator' | 'counter-display' | 'admin';
  selectedOperatorId: number;
  selectedCounterDisplayId: number;
  enableVoice: boolean;
  enableSound: boolean;
  accentLanguage: 'tr' | 'en';
  latestCalledTicket: Ticket | null;
  latestCallingCounterId: number | null;
  isCallingAnimationActive: boolean;
  
  // Navigation / Switcher handlers
  setView: (view: 'waiting-room' | 'kiosk' | 'operator' | 'counter-display' | 'admin') => void;
  setOperator: (counterId: number) => void;
  setCounterDisplay: (counterId: number) => void;
  setEnableVoice: (val: boolean) => void;
  setEnableSound: (val: boolean) => void;
  setAccentLanguage: (lang: 'tr' | 'en') => void;
  dismissCallingAlert: () => void;
  
  // QMS Operational Workflows
  issueNewTicket: (serviceId: string) => Ticket;
  callNextTicket: (counterId: number) => Ticket | null;
  startService: (counterId: number) => void;
  completeService: (counterId: number) => void;
  skipTicket: (counterId: number) => void;
  recallTicket: (counterId: number) => void;
  transferTicket: (counterId: number, targetCounterId: number, reason: string) => void;
  setCounterStatus: (counterId: number, status: CounterStatus) => void;
  
  // Utilities
  getCounterByServiceId: (serviceId: string) => Counter | null;
  getServiceByPrefix: (prefix: string) => Service | null;
  resetAllQueues: () => void;
}

const QmsContext = createContext<QmsContextProps | undefined>(undefined);

export const QmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load initial values from LocalStorage if available (Offline persistent storage)
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('qms_tickets_v1');
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('qms_counters_v1');
    return saved ? JSON.parse(saved) : initialCounters;
  });

  const [activeView, setView] = useState<'waiting-room' | 'kiosk' | 'operator' | 'counter-display' | 'admin'>(() => {
    const saved = localStorage.getItem('qms_active_view');
    return (saved as any) || 'waiting-room';
  });

  const [selectedOperatorId, setOperator] = useState<number>(() => {
    const saved = localStorage.getItem('qms_operator_id');
    return saved ? parseInt(saved, 10) : 6; // Default to Counter 6 (Passport) as in mockup
  });

  const [selectedCounterDisplayId, setCounterDisplay] = useState<number>(() => {
    const saved = localStorage.getItem('qms_counter_display_id');
    return saved ? parseInt(saved, 10) : 9; // Default to Counter 9 (Cashier) as in mockup
  });

  const [enableVoice, setEnableVoice] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [accentLanguage, setAccentLanguage] = useState<'tr' | 'en'>('tr');

  // Trigger alert modal on waiting room screen when a ticket is called
  const [latestCalledTicket, setLatestCalledTicket] = useState<Ticket | null>(null);
  const [latestCallingCounterId, setLatestCallingCounterId] = useState<number | null>(null);
  const [isCallingAnimationActive, setIsCallingAnimationActive] = useState(false);

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem('qms_tickets_v1', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('qms_counters_v1', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('qms_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('qms_operator_id', String(selectedOperatorId));
  }, [selectedOperatorId]);

  useEffect(() => {
    localStorage.setItem('qms_counter_display_id', String(selectedCounterDisplayId));
  }, [selectedCounterDisplayId]);

  // Helpers
  const getCounterByServiceId = (serviceId: string): Counter | null => {
    const s = services.find((srv) => srv.id === serviceId);
    if (!s) return null;
    return counters.find((c) => c.id === s.assignedCounter) || null;
  };

  const getServiceByPrefix = (prefix: string): Service | null => {
    return services.find((s) => s.prefix === prefix) || null;
  };

  const dismissCallingAlert = () => {
    setIsCallingAnimationActive(false);
    setLatestCalledTicket(null);
    setLatestCallingCounterId(null);
  };

  // Generate a ticket
  const issueNewTicket = (serviceId: string): Ticket => {
    const s = services.find((srv) => srv.id === serviceId);
    if (!s) throw new Error(`Invalid service ID: ${serviceId}`);

    // Filter tickets with the same prefix to find the max number today
    const prefixTickets = tickets.filter((t) => t.number.startsWith(s.prefix + '-'));
    
    let nextNum = 1;
    if (prefixTickets.length > 0) {
      const numbers = prefixTickets.map((t) => {
        const parts = t.number.split('-');
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
      });
      nextNum = Math.max(...numbers, 0) + 1;
    } else {
      // Custom start offsets matching the authentic Turkish Embassy structure
      if (s.prefix === 'A') nextNum = 105;
      if (s.prefix === 'CT') nextNum = 13;
      if (s.prefix === 'N') nextNum = 21;
      if (s.prefix === 'M') nextNum = 3;
      if (s.prefix === 'B') nextNum = 413;
      if (s.prefix === 'P') nextNum = 443;
      if (s.prefix === 'ID') nextNum = 3;
      if (s.prefix === 'NT') nextNum = 203;
      if (s.prefix === 'C') nextNum = 11;
    }

    const ticketNumber = `${s.prefix}-${String(nextNum).padStart(3, '0')}`;
    
    const newT: Ticket = {
      id: `ticket-${serviceId}-${Date.now()}`,
      number: ticketNumber,
      serviceId,
      status: 'waiting',
      source: 'direct',
      timestamp: new Date().toISOString()
    };

    setTickets((prev) => [...prev, newT]);
    
    // Play sound click on print
    if (enableSound) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.frequency.setValueAtTime(400, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        }
      } catch (e) {}
    }

    return newT;
  };

  // Call the next ticket
  const callNextTicket = (counterId: number): Ticket | null => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter) return null;

    // A counter can call:
    // 1. Any ticket transferred specifically to them (or specifically for Counter 9: any cashier ticket).
    // Let's identify which services this counter handles. Default is counter.serviceId, but they can cross-serve.
    const serviceMap = services.find((s) => s.assignedCounter === counterId);
    const serviceId = serviceMap ? serviceMap.id : 'passport';

    // Search rule:
    // Prioritize TRANSFERRED tickets (since transfers are high priority, especially for cashier!).
    // For Cashier (Counter 9), prioritize transfers first, then direct cashier tickets.
    // For other counters, show their specific service transfers or direct specific service.
    
    let nextTicket = tickets.find((t) => 
      t.status === 'waiting' && 
      t.serviceId === serviceId && 
      t.source === 'transferred'
    );

    // If no transfers, find the oldest direct waiting ticket for their default service
    if (!nextTicket) {
      nextTicket = tickets.find((t) => 
        t.status === 'waiting' && 
        t.serviceId === serviceId && 
        t.source === 'direct'
      );
    }

    // If still no ticket, let them call any direct or transferred ticket that has been waiting (flexible cross-desk service)
    if (!nextTicket && counterId !== 9) { // Vezne only serves cashier transactions
      nextTicket = tickets.find((t) => t.status === 'waiting' && t.serviceId !== 'cashier');
    }

    if (!nextTicket) return null;

    // Update old currently-serving ticket of this counter to completed
    const currentTicket = tickets.find((t) => t.id === counter.currentTicketId);
    let updatedTickets = tickets.map((t) => {
      if (currentTicket && t.id === currentTicket.id) {
        return {
          ...t,
          status: 'completed' as TicketStatus,
          completedAt: new Date().toISOString(),
          duration: t.startedAt ? Math.floor((Date.now() - new Date(t.startedAt).getTime()) / 1000) : 180
        };
      }
      if (t.id === nextTicket!.id) {
        return {
          ...t,
          status: 'calling' as TicketStatus,
          calledAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTickets(updatedTickets);

    // Update counter status
    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return {
          ...c,
          status: 'busy' as CounterStatus,
          currentTicketId: nextTicket!.id,
          servedCount: c.servedCount + (currentTicket ? 1 : 0)
        };
      }
      return c;
    }));

    // Trigger visual/voice announcement alert
    setLatestCalledTicket({ ...nextTicket, status: 'calling', calledAt: new Date().toISOString() });
    setLatestCallingCounterId(counterId);
    setIsCallingAnimationActive(true);

    if (enableSound) playChime();
    if (enableVoice) {
      setTimeout(() => {
        speakTicket(nextTicket!.number, counterId, accentLanguage);
      }, 700);
    }

    return nextTicket;
  };

  // Start ticket serving process
  const startService = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) => prev.map((t) => {
      if (t.id === counter.currentTicketId) {
        return {
          ...t,
          status: 'serving' as TicketStatus,
          startedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return { ...c, status: 'busy' as CounterStatus };
      }
      return c;
    }));
  };

  // Complete ticket serving
  const completeService = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) => prev.map((t) => {
      if (t.id === counter.currentTicketId) {
        const start = t.startedAt || t.calledAt || new Date().toISOString();
        const calculatedDur = Math.floor((Date.now() - new Date(start).getTime()) / 1000);
        return {
          ...t,
          status: 'completed' as TicketStatus,
          completedAt: new Date().toISOString(),
          duration: calculatedDur > 2 ? calculatedDur : 120 // Fallback to 2 minutes
        };
      }
      return t;
    }));

    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return {
          ...c,
          status: 'active' as CounterStatus,
          currentTicketId: null,
          servedCount: c.servedCount + 1
        };
      }
      return c;
    }));
  };

  // Skip ticket
  const skipTicket = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    setTickets((prev) => prev.map((t) => {
      if (t.id === counter.currentTicketId) {
        return {
          ...t,
          status: 'skipped' as TicketStatus,
          completedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return {
          ...c,
          status: 'active' as CounterStatus,
          currentTicketId: null,
          noShowCount: c.noShowCount + 1
        };
      }
      return c;
    }));
  };

  // Recall ticket manually (repeats the announcment)
  const recallTicket = (counterId: number) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const currentTicket = tickets.find((t) => t.id === counter.currentTicketId);
    if (!currentTicket) return;

    // Trigger visual effect in Displays by writing a "calling" transition state
    setTickets((prev) => prev.map((t) => {
      if (t.id === currentTicket.id) {
        return { ...t, status: 'calling', calledAt: new Date().toISOString() };
      }
      return t;
    }));

    setLatestCalledTicket({ ...currentTicket, status: 'calling', calledAt: new Date().toISOString() });
    setLatestCallingCounterId(counterId);
    setIsCallingAnimationActive(true);

    if (enableSound) playChime();
    if (enableVoice) {
      setTimeout(() => {
        speakTicket(currentTicket.number, counterId, accentLanguage);
      }, 700);
    }
  };

  // Transfer a ticket to another counter/service (usually Counter 9 Cashier)
  const transferTicket = (counterId: number, targetCounterId: number, reason: string) => {
    const counter = counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const activeT = tickets.find((t) => t.id === counter.currentTicketId);
    if (!activeT) return;

    // Determine target service based on counterId
    const targetServiceMap = services.find((s) => s.assignedCounter === targetCounterId);
    const targetServiceId = targetServiceMap ? targetServiceMap.id : 'cashier';

    // Mark current ticket as completed from source counter, but create a TRANSFERRED waiting ticket linked to it!
    // Or, we can update the existing ticket itself, changing its status to 'waiting' and marking it as transferred!
    // This maintains historical continuity of the exact ticket number (e.g. transfer P-442 directly to cash desk, preserving its number - representing standard administrative procedures!).
    setTickets((prev) => prev.map((t) => {
      if (t.id === activeT.id) {
        return {
          ...t,
          status: 'waiting' as TicketStatus,
          timestamp: new Date().toISOString(), // Refresh wait time
          source: 'transferred' as TicketSource,
          transferredFrom: counterId,
          transferReason: reason,
          serviceId: targetServiceId // Swaps category queue to target (e.g. payment queue)
        };
      }
      return t;
    }));

    // Free the source counter
    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return {
          ...c,
          status: 'active' as CounterStatus,
          currentTicketId: null,
          servedCount: c.servedCount + 1
        };
      }
      return c;
    }));
  };

  // Set counter active status
  const setCounterStatus = (counterId: number, status: CounterStatus) => {
    setCounters((prev) => prev.map((c) => {
      if (c.id === counterId) {
        return { ...c, status };
      }
      return c;
    }));
  };

  // Reset queue data for fresh testing
  const resetAllQueues = () => {
    localStorage.removeItem('qms_tickets_v1');
    localStorage.removeItem('qms_counters_v1');
    setTickets(initialTickets);
    setCounters(initialCounters);
    dismissCallingAlert();
  };

  return (
    <QmsContext.Provider value={{
      tickets,
      counters,
      activeView,
      selectedOperatorId,
      selectedCounterDisplayId,
      enableVoice,
      enableSound,
      accentLanguage,
      latestCalledTicket,
      latestCallingCounterId,
      isCallingAnimationActive,
      
      setView,
      setOperator,
      setCounterDisplay,
      setEnableVoice,
      setEnableSound,
      setAccentLanguage,
      dismissCallingAlert,
      
      issueNewTicket,
      callNextTicket,
      startService,
      completeService,
      skipTicket,
      recallTicket,
      transferTicket,
      setCounterStatus,
      getCounterByServiceId,
      getServiceByPrefix,
      resetAllQueues
    }}>
      {children}
    </QmsContext.Provider>
  );
};

export const useQms = () => {
  const context = useContext(QmsContext);
  if (!context) throw new Error('useQms must be used within QmsProvider');
  return context;
};
