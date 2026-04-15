import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  MfTransaction,
  NewMfTransaction,
  PortfolioSummary,
  FundAllocation,
  NavTrendPoint
} from '../../models/mf-investment.model';

@Injectable({
  providedIn: 'root'
})
export class MfInvestingService {
  private readonly initialSummary: PortfolioSummary = {
    totalInvested: 575000,
    totalNav: 642500,
    unrealizedGain: 67500,
    returnPct: 11.74,
    allocation: [
      { category: 'Large Cap', navValue: 262500 },
      { category: 'Mid Cap', navValue: 165000 },
      { category: 'Debt', navValue: 125000 },
      { category: 'ELSS', navValue: 90000 }
    ],
    navTrend: [
      { period: 'Oct', nav: 598000 },
      { period: 'Nov', nav: 605500 },
      { period: 'Dec', nav: 614200 },
      { period: 'Jan', nav: 624100 },
      { period: 'Feb', nav: 632300 },
      { period: 'Mar', nav: 642500 }
    ]
  };

  private readonly initialTransactions: MfTransaction[] = [
    {
      id: 1001,
      type: 'Lumpsum',
      scheme: 'Bluechip Growth Fund',
      amount: 150000,
      executionDate: '2026-01-10',
      status: 'Completed'
    },
    {
      id: 1002,
      type: 'SIP',
      scheme: 'Balanced Advantage Fund',
      amount: 12000,
      frequency: 'Monthly',
      executionDate: '2026-03-15',
      status: 'Scheduled'
    },
    {
      id: 1003,
      type: 'SWP',
      scheme: 'Income Builder Debt Fund',
      amount: 18000,
      frequency: 'Monthly',
      executionDate: '2026-03-25',
      status: 'Scheduled'
    }
  ];

  private readonly summarySubject = new BehaviorSubject<PortfolioSummary>(this.initialSummary);
  private readonly transactionsSubject = new BehaviorSubject<MfTransaction[]>(this.initialTransactions);

  readonly summary$ = this.summarySubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();

  addTransaction(transaction: NewMfTransaction): void {
    const currentTransactions = this.transactionsSubject.getValue();
    const nextId = currentTransactions.length > 0
      ? Math.max(...currentTransactions.map(item => item.id)) + 1
      : 1001;

    const nextTransaction: MfTransaction = {
      ...transaction,
      id: nextId,
      status: transaction.type === 'SIP' || transaction.type === 'SWP' ? 'Scheduled' : 'Completed'
    };

    this.transactionsSubject.next([nextTransaction, ...currentTransactions]);
    this.summarySubject.next(this.calculateNextSummary(this.summarySubject.getValue(), nextTransaction));
  }

  getSystemDesignTree(): ReadonlyArray<{ title: string; items: string[] }> {
    return [
      {
        title: 'Onboarding Layer',
        items: ['KYC + FATCA', 'Bank mandate validation', 'Risk profile mapping']
      },
      {
        title: 'Transaction Layer',
        items: ['Lumpsum order capture', 'SIP scheduler', 'SWP scheduler', 'Withdrawal settlement']
      },
      {
        title: 'Portfolio Analytics Layer',
        items: ['Total NAV computation', 'Category-wise allocation', 'Performance trend and returns']
      }
    ];
  }

  private calculateNextSummary(summary: PortfolioSummary, transaction: MfTransaction): PortfolioSummary {
    const isOutflow = transaction.type === 'SWP' || transaction.type === 'Withdrawal';
    const investedDelta = transaction.type === 'Lumpsum' || transaction.type === 'SIP'
      ? transaction.amount
      : 0;

    const navDelta = isOutflow
      ? -transaction.amount
      : transaction.amount * 1.012;

    const totalInvested = Math.max(0, summary.totalInvested + investedDelta);
    const totalNav = Math.max(0, summary.totalNav + navDelta);
    const unrealizedGain = totalNav - totalInvested;
    const returnPct = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

    const allocation = this.rebalanceAllocation(summary.allocation, navDelta);
    const navTrend = this.rollNavTrend(summary.navTrend, totalNav);

    return {
      totalInvested,
      totalNav,
      unrealizedGain,
      returnPct,
      allocation,
      navTrend
    };
  }

  private rebalanceAllocation(allocation: FundAllocation[], navDelta: number): FundAllocation[] {
    if (allocation.length === 0) {
      return allocation;
    }

    const weights = [0.4, 0.27, 0.2, 0.13];

    return allocation.map((item, index) => ({
      ...item,
      navValue: Math.max(0, item.navValue + navDelta * (weights[index] ?? 0.1))
    }));
  }

  private rollNavTrend(navTrend: NavTrendPoint[], latestNav: number): NavTrendPoint[] {
    if (navTrend.length === 0) {
      return navTrend;
    }

    const shifted = navTrend.slice(1);
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lastPeriod = navTrend[navTrend.length - 1]?.period;
    const lastIndex = monthOrder.indexOf(lastPeriod ?? 'Jan');
    const nextPeriod = monthOrder[(lastIndex + 1 + monthOrder.length) % monthOrder.length];

    return [...shifted, { period: nextPeriod, nav: latestNav }];
  }
}
