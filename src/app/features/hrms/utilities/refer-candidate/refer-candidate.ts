import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HrmsService } from '../../../../core/services/hrms.service';
import { Vacancy } from '../../../../models/hrms.model';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-refer-candidate',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './refer-candidate.html',
  styleUrl: './refer-candidate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ReferCandidateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hrmsService = inject(HrmsService);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  openings: Vacancy[] = [];
  selectedPosition = '';

  readonly form = this.fb.group({
    position: ['', [Validators.required]],
    candidateName: ['', [Validators.required, Validators.maxLength(120)]],
    contact: ['', [Validators.required, Validators.maxLength(80)]],
    cvFileName: ['', [Validators.maxLength(260)]]
  });

  ngOnInit(): void {
    this.loadOpenings();
  }

  loadOpenings(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.getReferralOpenings().subscribe({
      next: data => {
        this.openings = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.openings = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectPosition(position: string): void {
    this.selectedPosition = position;
    this.form.patchValue({ position });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fill all required referral fields.');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.submitReferral(this.form.getRawValue() as {
      position: string;
      candidateName: string;
      contact: string;
      cvFileName?: string;
    }).subscribe({
      next: response => {
        this.toastr.success(response.message || 'Referral submitted successfully.');
        this.form.reset({ position: this.selectedPosition, candidateName: '', contact: '', cvFileName: '' });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.toastr.error(error?.error?.message || 'Unable to submit referral.');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}