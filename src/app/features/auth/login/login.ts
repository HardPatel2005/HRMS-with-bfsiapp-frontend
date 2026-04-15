import { Component, inject }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { HttpErrorResponse }    from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService }        from 'ngx-toastr';
import { AuthService }          from '../../../core/services/auth.service';
import { LoadingSpinner }       from '../../../shared/loading-spinner/loading-spinner';
import { AuthResponse }         from '../../../models/auth.model';

@Component({
  selector:   'app-login',
  standalone: true,
  imports:    [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinner],
  templateUrl: './login.html',
  styleUrl:    './login.scss'
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly toastr      = inject(ToastrService);

  loading = false;

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.authService.login(
      this.form.getRawValue() as { email: string; password: string }
    ).subscribe({
      next: (res: AuthResponse) => {
        if (!res.success) {
          this.toastr.error(res.message || 'Login failed', 'Login Failed');
          this.loading = false;
          return;
        }
        this.toastr.success('Login successful', 'Success');

        // ── Redirect to returnUrl if guard sent us here, else /customers ──
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/customers';
        this.router.navigateByUrl(returnUrl);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error(this.extractApiError(err, 'Invalid credentials'), 'Login Failed');
        this.loading = false;
      }
    });
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.authService.loginWithGoogle().subscribe({
      next: (res: AuthResponse) => {
        if (!res.success) {
          this.toastr.error(res.message || 'Google login failed', 'Login Failed');
          this.loading = false;
          return;
        }
        this.toastr.success('Google login successful', 'Success');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/customers';
        this.router.navigateByUrl(returnUrl);
        this.loading = false;
      },
      error: (err: unknown) => {
        this.toastr.error(this.extractApiError(err, 'Google login failed'), 'Login Failed');
        this.loading = false;
      }
    });
  }

  oauth(_provider: 'microsoft'): void {
    this.authService.loginWithMicrosoft();
  }

  hasError(field: 'email' | 'password'): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  private extractApiError(error: unknown, fallback: string): string {
    const err = error as HttpErrorResponse;
    const msg = (err?.error?.message as string | undefined)
             ?? (err?.error?.Message as string | undefined);
    if (msg?.trim()) return msg;
    if (err?.status === 401) return 'Invalid email or password.';
    if (err?.status === 400) return 'Invalid request. Check your input.';
    if (err?.status === 0)   return 'Cannot reach server. Is the backend running?';
    return fallback;
  }
}