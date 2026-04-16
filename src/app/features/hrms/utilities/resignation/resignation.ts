import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmsService } from '../../../../core/services/hrms.service';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-resignation',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './resignation.html',
  styleUrl: './resignation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ResignationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmsService = inject(HrmsService);
  private readonly toastr = inject(ToastrService);

  loading = false;

  readonly resignationDate = signal('');

  readonly form = this.fb.group({
    resignationDate: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  readonly lastWorkingDate = computed(() => {
    const value = this.resignationDate();
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    date.setMonth(date.getMonth() + 2);
    return date.toISOString().slice(0, 10);
  });

  onResignationDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.resignationDate.set(target.value);
    this.form.patchValue({ resignationDate: target.value });
  }

  submit(): void {
    if (this.form.invalid || !this.lastWorkingDate()) {
      this.form.markAllAsTouched();
      this.toastr.error('Please provide resignation date and reason.');
      return;
    }

    this.loading = true;
    this.hrmsService.submitResignation({
      resignationDate: this.form.getRawValue().resignationDate ?? '',
      lastWorkingDate: this.lastWorkingDate(),
      reason: this.form.getRawValue().reason ?? ''
    }).subscribe({
      next: response => {
        this.toastr.success(response.message || 'Resignation submitted successfully.');
        this.form.reset({ resignationDate: '', reason: '' });
        this.resignationDate.set('');
        this.loading = false;
      },
      error: error => {
        this.toastr.error(error?.error?.message || 'Unable to submit resignation.');
        this.loading = false;
      }
    });
  }
}