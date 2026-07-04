export interface Service {
  id: string;
  prefix: string;
  nameTu: string;
  nameEn: string;
  assignedCounter: number;
  iconName: string;
}

export type TicketStatus = 'waiting' | 'calling' | 'serving' | 'completed' | 'skipped';
export type TicketSource = 'direct' | 'transferred';
export type CounterStatus = 'active' | 'busy' | 'break' | 'closed';

export interface Ticket {
  id: string;
  number: string;
  serviceId: string;
  status: TicketStatus;
  source: TicketSource;
  transferredFrom?: number;
  transferReason?: string;
  timestamp: string; // ISO string
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // Service duration in seconds
}

export interface Counter {
  id: number;
  officerName: string;
  status: CounterStatus;
  currentTicketId: string | null;
  servedCount: number;
  noShowCount: number;
  avgServiceTime: number; // in minutes
}

export interface QmsState {
  tickets: Ticket[];
  counters: Counter[];
}
