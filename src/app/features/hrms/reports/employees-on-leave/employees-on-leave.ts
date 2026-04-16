import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrmsService } from '../../../../core/services/hrms.service';
import { EmployeeLeaveReport } from '../../../../models/hrms.model';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-employees-on-leave',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './employees-on-leave.html',
  styleUrl: './employees-on-leave.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class EmployeesOnLeaveComponent implements OnInit {
  private readonly hrmsService = inject(HrmsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  employeesOnLeave: EmployeeLeaveReport[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.getEmployeesOnLeave().subscribe({
      next: data => {
        this.employeesOnLeave = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.employeesOnLeave = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}