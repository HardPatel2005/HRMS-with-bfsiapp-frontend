import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type ReportItem = {
  readonly icon: string;
  readonly title: string;
  readonly route: string;
};

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ReportsComponent {
  readonly items: readonly ReportItem[] = [
    { icon: 'C', title: 'Employee Contact Directory', route: '/reports/contact-directory' },
    { icon: 'L', title: 'Employees on Leave', route: '/reports/employees-on-leave' },
    { icon: 'D', title: 'Documents', route: '/reports/documents' },
    { icon: 'P', title: 'Performance Evaluation', route: '/reports/performance-evaluation' }
  ];
}