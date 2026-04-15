import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasksheet',
  imports: [CommonModule],
  templateUrl: './tasksheet.html',
  styleUrl: './tasksheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class TasksheetComponent {}