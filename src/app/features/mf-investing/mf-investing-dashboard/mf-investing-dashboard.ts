import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartConstructorType, HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil } from 'rxjs';
import {
  MfTransaction,
  MfTransactionType,
  NewMfTransaction,
  PortfolioSummary
} from '../../../models/mf-investment.model';
import { MfInvestingService } from '../../../core/services/mf-investing.service';

@Component({
  selector: 'app-mf-investing-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HighchartsChartComponent],
  templateUrl: './mf-investing-dashboard.html',
  styleUrls: ['./mf-investing-dashboard.scss']
})
export class MfInvestingDashboardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mfInvestingService = inject(MfInvestingService);
  private readonly destroy$ = new Subject<void>();

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly highcharts = Highcharts;
  readonly chartConstructor: ChartConstructorType = 'chart';
  readonly availableSchemes = [
    'Bluechip Growth Fund',
    'Balanced Advantage Fund',
    'Midcap Discovery Fund',
    'Income Builder Debt Fund',
    'Tax Saver ELSS Fund'
  ];

  summary: PortfolioSummary | null = null;
  transactions: MfTransaction[] = [];
  designLayers = this.mfInvestingService.getSystemDesignTree();

  allocationChartOptions: Highcharts.Options = {};
  navTrendChartOptions: Highcharts.Options = {};

  transactionForm = this.fb.group({
    type: this.fb.nonNullable.control<MfTransactionType>('Lumpsum'),
    scheme: this.fb.nonNullable.control(this.availableSchemes[0], Validators.required),
    amount: this.fb.nonNullable.control(10000, [Validators.required, Validators.min(500)]),
    frequency: this.fb.control<'Monthly' | 'Quarterly'>('Monthly'),
    executionDate: this.fb.nonNullable.control(this.defaultDate(), Validators.required)
  });

  ngOnInit(): void {
    this.mfInvestingService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => {
        this.summary = summary;
        this.updateChartOptions(summary);
      });

    this.mfInvestingService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactions) => {
        this.transactions = transactions;
      });

    this.transactionForm.controls.type.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => this.handleTypeChange(type));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const value = this.transactionForm.getRawValue();

    const payload: NewMfTransaction = {
      type: value.type,
      scheme: value.scheme,
      amount: Number(value.amount),
      executionDate: value.executionDate,
      ...(value.type === 'SIP' || value.type === 'SWP' ? { frequency: value.frequency ?? 'Monthly' } : {})
    };

    this.mfInvestingService.addTransaction(payload);

    this.transactionForm.patchValue({
      type: 'Lumpsum',
      scheme: this.availableSchemes[0],
      amount: 10000,
      frequency: 'Monthly',
      executionDate: this.defaultDate()
    });
    this.handleTypeChange('Lumpsum');
  }

  trackByTransactionId(_: number, item: MfTransaction): number {
    return item.id;
  }

  get showFrequency(): boolean {
    const type = this.transactionForm.controls.type.value;
    return type === 'SIP' || type === 'SWP';
  }

  private handleTypeChange(type: MfTransactionType): void {
    if (type === 'SIP' || type === 'SWP') {
      this.transactionForm.controls.frequency.addValidators(Validators.required);
    } else {
      this.transactionForm.controls.frequency.removeValidators(Validators.required);
      this.transactionForm.controls.frequency.setValue(null);
    }

    this.transactionForm.controls.frequency.updateValueAndValidity({ emitEvent: false });
  }

  private updateChartOptions(summary: PortfolioSummary): void {
    this.allocationChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Fund Allocation by NAV'
      },
      tooltip: {
        pointFormat: '<b>Rs.{point.y:,.0f}</b> ({point.percentage:.1f}%)'
      },
      accessibility: {
        point: {
          valueSuffix: ' rupees'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f}%'
          }
        }
      },
      series: [
        {
          type: 'pie',
          name: 'NAV',
          data: summary.allocation.map((item) => ({
            name: item.category,
            y: Number(item.navValue.toFixed(2))
          }))
        }
      ],
      credits: {
        enabled: false
      }
    };

    this.navTrendChartOptions = {
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Total NAV Trend (Last 6 Periods)'
      },
      xAxis: {
        categories: summary.navTrend.map((point) => point.period)
      },
      yAxis: {
        title: {
          text: 'NAV in Rs.'
        }
      },
      tooltip: {
        valuePrefix: 'Rs.'
      },
      series: [
        {
          type: 'areaspline',
          name: 'Total NAV',
          data: summary.navTrend.map((point) => Number(point.nav.toFixed(2))),
          color: '#0d6efd',
          fillOpacity: 0.2
        }
      ],
      credits: {
        enabled: false
      }
    };
  }

  private defaultDate(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }
}
