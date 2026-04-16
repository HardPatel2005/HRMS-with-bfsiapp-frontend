import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrmsService } from '../../../core/services/hrms.service';
import { DashboardData, Vacancy } from '../../../models/hrms.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

type EventCard = {
  title: string;
  description?: string;
  eventDate?: string;
  theme: string;
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class DashboardComponent {
  private readonly hrmsService = inject(HrmsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';

  events: EventCard[] = [
    { title: 'Champion', theme: 'theme-blue' },
    { title: 'Happy Diwali', theme: 'theme-amber' },
    { title: 'Happy Holi', theme: 'theme-festival' },
    { title: 'Happy Fun Friday', theme: 'theme-sand' }
  ];

  vacancies: Vacancy[] = [];
  newJoinees: string[] = [];
  birthdays: string[] = [];
  employeesOnLeaveCount = 0;
  employeeOfMonthName = 'Coming Soon';

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.hrmsService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.applyDashboardData(data);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load dashboard data. Showing default view.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyDashboardData(data: DashboardData): void {
    const themes = ['theme-blue', 'theme-amber', 'theme-festival', 'theme-sand'];

    if (data.events && data.events.length > 0) {
      this.events = data.events.map((event, index) => ({
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        theme: themes[index % themes.length]
      }));
    }

    this.vacancies = data.vacancies ?? [];
    this.newJoinees = data.newJoinees ?? [];
    this.birthdays = data.birthdays ?? [];
    this.employeesOnLeaveCount = data.employeesOnLeave?.length ?? 0;
    this.employeeOfMonthName = data.employeeOfMonth?.name || 'Coming Soon';
  }
}