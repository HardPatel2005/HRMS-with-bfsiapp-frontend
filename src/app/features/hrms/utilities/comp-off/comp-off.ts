import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmsService } from '../../../../core/services/hrms.service';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-comp-off',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './comp-off.html',
  styleUrl: './comp-off.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class CompOffComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmsService = inject(HrmsService);
  private readonly toastr = inject(ToastrService);

  loading = false;

  readonly form = this.fb.group({
    earnedDate: ['', [Validators.required]],
    inTime: [''],
    outTime: [''],
    usedWith: ['Planned Leave', [Validators.required]],
    clientName: ['Acme Retail', [Validators.required]],
    category: ['Weekend Support', [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fill all required comp-off fields.');
      return;
    }

    this.loading = true;
    this.hrmsService.submitCompOff(this.form.getRawValue() as {
      earnedDate: string;
      inTime?: string | null;
      outTime?: string | null;
      usedWith: string;
      clientName: string;
      category: string;
      description?: string;
    }).subscribe({
      next: response => {
        this.toastr.success(response.message || 'Comp-off request submitted successfully.');
        this.form.reset({
          earnedDate: '',
          inTime: '',
          outTime: '',
          usedWith: 'Planned Leave',
          clientName: 'Acme Retail',
          category: 'Weekend Support',
          description: ''
        });
        this.loading = false;
      },
      error: error => {
        this.toastr.error(error?.error?.message || 'Unable to submit comp-off request.');
        this.loading = false;
      }
    });
  }
}