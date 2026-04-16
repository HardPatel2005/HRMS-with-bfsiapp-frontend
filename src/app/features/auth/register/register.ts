import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { AuthResponse } from '../../../models/auth.model';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinner],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  loading = false;

  readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(strongPasswordPattern)],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService
      .register(
        this.form.getRawValue() as {
          fullName: string;
          email: string;
          password: string;
          confirmPassword: string;
        },
      )
      .subscribe({
        next: (res: AuthResponse) => {
          // FIX: backend returns { success: false, message: "email already exists" }
          // as HTTP 400 — but also check success flag on HTTP 200 responses
          if (!res.success) {
            this.toastr.error(res.message || 'Registration failed', 'Register Failed');
            this.loading = false;
            return;
          }
          this.toastr.success('Registration successful! Please verify your email.', 'Success');
          this.router.navigate(['/dashboard']);
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(
            this.extractApiError(error, 'Registration failed or backend unavailable'),
            'Register Failed',
          );
          this.loading = false;
        },
      });
  }

  hasError(field: 'fullName' | 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private extractApiError(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;

    const responseMessage =
      (httpError?.error?.message as string | undefined) ??
      (httpError?.error?.Message as string | undefined);

    if (responseMessage?.trim()) return responseMessage;

    const validationErrors = httpError?.error?.errors as Record<string, string[]> | undefined;
    if (validationErrors) {
      const firstKey = Object.keys(validationErrors)[0];
      const first = firstKey ? validationErrors[firstKey]?.[0] : undefined;
      if (first) return first;
    }

    if (httpError?.status === 400) return 'Registration payload invalid. Check password policy.';
    if (httpError?.status === 0) return 'Cannot reach server. Check if the backend is running.';

    return fallback;
  }
}
