import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type UtilityItem = {
  readonly icon: string;
  readonly title: string;
  readonly route: string;
};

@Component({
  selector: 'app-utilities',
  imports: [CommonModule, RouterLink],
  templateUrl: './utilities.html',
  styleUrl: './utilities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class UtilitiesComponent {
  readonly items: readonly UtilityItem[] = [
    { icon: 'L', title: 'Apply/Approve leave', route: '/utilities/leave' },
    { icon: 'C', title: 'Apply/Approve Comp-off', route: '/utilities/comp-off' },
    { icon: 'R', title: 'Refer a Candidate', route: '/utilities/refer-candidate' },
    { icon: 'T', title: 'Add Daily Tasksheet', route: '/utilities/tasksheet' },
    { icon: 'G', title: 'Add Grievance', route: '/utilities/grievance' },
    { icon: 'E', title: 'Resignation', route: '/utilities/resignation' }
  ];
}