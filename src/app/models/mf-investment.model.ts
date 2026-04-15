export type MfTransactionType = 'Lumpsum' | 'SIP' | 'SWP' | 'Withdrawal';

export interface FundAllocation {
  category: string;
  navValue: number;
}

export interface NavTrendPoint {
  period: string;
  nav: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalNav: number;
  unrealizedGain: number;
  returnPct: number;
  allocation: FundAllocation[];
  navTrend: NavTrendPoint[];
}

export interface MfTransaction {
  id: number;
  type: MfTransactionType;
  scheme: string;
  amount: number;
  frequency?: 'Monthly' | 'Quarterly';
  executionDate: string;
  status: 'Completed' | 'Scheduled';
}

export interface NewMfTransaction {
  type: MfTransactionType;
  scheme: string;
  amount: number;
  frequency?: 'Monthly' | 'Quarterly';
  executionDate: string;
}
