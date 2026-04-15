import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type EvaluationMetric = {
  readonly title: string;
  readonly value: string;
  readonly note: string;
};

@Component({
  selector: 'app-performance-evaluation',
  imports: [CommonModule],
  templateUrl: './performance-evaluation.html',
  styleUrl: './performance-evaluation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class PerformanceEvaluationComponent {
  readonly metrics: readonly EvaluationMetric[] = [
    { title: 'Delivery', value: '4.5 / 5', note: 'Strong sprint completion record.' },
    { title: 'Collaboration', value: '4.2 / 5', note: 'Positive cross-team feedback.' },
    { title: 'Ownership', value: '4.7 / 5', note: 'Handles critical incidents independently.' }
  ];
}