import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmsService } from '../../../../core/services/hrms.service';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-leave',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './leave.html',
  styleUrl: './leave.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class LeaveComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmsService = inject(HrmsService);
  private readonly toastr = inject(ToastrService);

  loading = false;

  readonly plannedLeaveForm = this.fb.group({
    leaveType: ['Planned Leave', [Validators.required]],
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    leaveDurationType: ['Full Day', [Validators.required]]
  });

  readonly emergencyLeaveForm = this.fb.group({
    leaveType: ['Emergency Leave', [Validators.required]],
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    leaveDurationType: ['Full Day', [Validators.required]]
  });

  submitPlannedLeave(): void {
    this.submitLeave(this.plannedLeaveForm, 'Planned leave request submitted.');
  }

  submitEmergencyLeave(): void {
    this.submitLeave(this.emergencyLeaveForm, 'Emergency leave request submitted.');
  }

  private submitLeave(form: ReturnType<FormBuilder['group']>, successMessage: string): void {
    if (form.invalid) {
      form.markAllAsTouched();
      this.toastr.error('Please fill all required leave fields.');
      return;
    }

    const { fromDate, toDate } = form.getRawValue();
    if (fromDate && toDate && fromDate > toDate) {
      this.toastr.error('To date cannot be before from date.');
      return;
    }

    this.loading = true;
    this.hrmsService.submitLeave(form.getRawValue() as {
      leaveType: string;
      fromDate: string;
      toDate: string;
      description?: string;
      leaveDurationType: string;
    }).subscribe({
      next: (response) => {
        this.toastr.success(response.message || successMessage);
        form.reset({
          leaveType: form === this.plannedLeaveForm ? 'Planned Leave' : 'Emergency Leave',
          fromDate: '',
          toDate: '',
          description: '',
          leaveDurationType: 'Full Day'
        });
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Unable to submit leave request.');
        this.loading = false;
      }
    });
  }
}