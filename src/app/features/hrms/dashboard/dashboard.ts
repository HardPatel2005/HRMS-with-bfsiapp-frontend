import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type EventCard = {
  readonly title: string;
  readonly theme: string;
};

type Vacancy = {
  readonly position: string;
  readonly location: string;
  readonly experience: string;
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class DashboardComponent {
  readonly events: readonly EventCard[] = [
    { title: 'Champion', theme: 'theme-blue' },
    { title: 'Happy Diwali', theme: 'theme-amber' },
    { title: 'Happy Holi', theme: 'theme-festival' },
    { title: 'Happy Fun Friday', theme: 'theme-sand' }
  ];

  readonly vacancies: readonly Vacancy[] = [
    { position: 'CTO', location: 'Ahmedabad', experience: '4-4 years' },
    { position: 'HR Executive', location: 'Ahmedabad', experience: '2 years' }
  ];
}