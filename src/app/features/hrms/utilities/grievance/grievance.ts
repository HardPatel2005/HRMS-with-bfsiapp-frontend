import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmsService } from '../../../../core/services/hrms.service';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-grievance',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './grievance.html',
  styleUrl: './grievance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class GrievanceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrmsService = inject(HrmsService);
  private readonly toastr = inject(ToastrService);

  loading = false;

  readonly form = this.fb.group({
    incidentDate: ['', [Validators.required]],
    incidentTime: [''],
    location: ['', [Validators.required, Validators.maxLength(180)]],
    complaintAgainst: ['Manager', [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    witnesses: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fill all required grievance fields.');
      return;
    }

    this.loading = true;
    this.hrmsService.submitGrievance(this.form.getRawValue() as {
      incidentDate: string;
      incidentTime?: string | null;
      location: string;
      complaintAgainst: string;
      description: string;
      witnesses?: string;
    }).subscribe({
      next: response => {
        this.toastr.success(response.message || 'Grievance submitted successfully.');
        this.form.reset({
          incidentDate: '',
          incidentTime: '',
          location: '',
          complaintAgainst: 'Manager',
          description: '',
          witnesses: ''
        });
        this.loading = false;
      },
      error: error => {
        this.toastr.error(error?.error?.message || 'Unable to submit grievance.');
        this.loading = false;
      }
    });
  }
}