import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grievance',
  imports: [CommonModule],
  templateUrl: './grievance.html',
  styleUrl: './grievance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class GrievanceComponent {}