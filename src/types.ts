export type ResultStatus = 'pendente' | 'win' | 'loss';

export interface DailyPlanItem {
  dayNumber: number;
  date: string;
  startBalance: number;
  targetProfit: number;
  targetBalance: number;
  stopLossAmount: number;
  stopLossBalance: number;
  status: ResultStatus;
  actualProfit: number;
  accumulatedProfit: number;
  accumulatedLoss: number;
  notes?: string;
}

export interface PlanConfig {
  initialBalance: number;
  finalTarget: number;
  durationDays: number;
  startDate: string;
  dailyProfitPercent: number;
  stopLossPercent: number;
  currentBalance: number;
  brokerConnected: boolean;
  brokerName: string;
}

export type ViewTab = 'table' | 'config' | 'supabase';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
}

export interface CloudSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}
