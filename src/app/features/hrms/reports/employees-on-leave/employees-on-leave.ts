import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employees-on-leave',
  imports: [CommonModule, RouterLink],
  templateUrl: './employees-on-leave.html',
  styleUrl: './employees-on-leave.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class EmployeesOnLeaveComponent {}