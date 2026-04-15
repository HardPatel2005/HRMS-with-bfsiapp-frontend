import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type CandidateOpening = {
  readonly position: string;
  readonly location: string;
  readonly experience: string;
};

@Component({
  selector: 'app-refer-candidate',
  imports: [CommonModule, RouterLink],
  templateUrl: './refer-candidate.html',
  styleUrl: './refer-candidate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ReferCandidateComponent {
  readonly openings: readonly CandidateOpening[] = [
    { position: 'Full Stack Developer', location: 'Ahmedabad', experience: '3-5 Years' },
    { position: 'UI/UX Designer', location: 'Mumbai', experience: '2-4 Years' },
    { position: 'Project Manager', location: 'Pune', experience: '5-8 Years' }
  ];
}