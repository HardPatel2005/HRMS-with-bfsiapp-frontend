import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave',
  imports: [CommonModule],
  templateUrl: './leave.html',
  styleUrl: './leave.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class LeaveComponent {}