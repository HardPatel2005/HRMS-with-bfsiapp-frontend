import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser }        from '@angular/common';
import { RouterModule }                           from '@angular/router';
import { FormsModule }                            from '@angular/forms';
import { Router }                                 from '@angular/router';
import { CustomerService }                        from '../../../core/services/customer.service';
import { Customer }                               from '../../../models/customer.model';
import { LoadingSpinner }                         from '../../../shared/loading-spinner/loading-spinner';
import { ToastrService }                          from 'ngx-toastr';
import { HttpErrorResponse }                      from '@angular/common/http';

@Component({
  selector:    'app-customer-list',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, LoadingSpinner],
  templateUrl: './customer-list.html',
  styleUrls:   ['./customer-list.scss']
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly toastr          = inject(ToastrService);
  private readonly router          = inject(Router);
  private readonly platformId      = inject(PLATFORM_ID);

  customers:         Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm        = '';
  loading           = false;   // ← false by default — only true while fetching
  errorMessage      = '';

  ngOnInit(): void {
    // ── FIX: only load data in the browser ──────────────────────────────
    // During SSR, localStorage has no token so the API returns 401.
    // The interceptor skips token attachment on the server (no window).
    // We skip the API call entirely on the server and let the browser
    // make the call after hydration when the real token is available.
    if (isPlatformBrowser(this.platformId)) {
      this.loadCustomers();
    }
  }

  loadCustomers(): void {
    this.loading      = true;
    this.errorMessage = '';

    this.customerService.getAllCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers         = data ?? [];
        this.filteredCustomers = this.customers;
        this.loading           = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading      = false;
        this.errorMessage = this.friendlyError(err);

        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error(this.errorMessage, 'Load Failed');
        }
        console.error('Error loading customers:', err);
      }
    });
  }

  filterCustomers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCustomers = this.customers;
      return;
    }
    this.filteredCustomers = this.customers.filter(c =>
      c.firstName?.toLowerCase().includes(term)            ||
      c.lastName?.toLowerCase().includes(term)             ||
      c.middleName?.toLowerCase().includes(term)           ||
      c.email?.toLowerCase().includes(term)                ||
      c.phoneNumber?.toLowerCase().includes(term)          ||
      c.city?.toLowerCase().includes(term)                 ||
      c.identificationNumber?.toLowerCase().includes(term)
    );
  }

  addNewCustomer(): void {
    this.router.navigate(['/customers', 'new']);
  }

  viewCustomer(id: number | undefined): void {
    if (id == null) return;
    this.router.navigate(['/customers', id]);
  }

  editCustomer(id: number | undefined): void {
    if (id == null) return;
    this.router.navigate(['/customers', 'edit', id]);
  }

  deleteCustomer(id: number | undefined): void {
    if (id == null) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const c    = this.customers.find(x => x.id === id);
    const name = c ? `${c.firstName} ${c.lastName}` : `ID ${id}`;

    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.customers         = this.customers.filter(x => x.id !== id);
        this.filteredCustomers = this.filteredCustomers.filter(x => x.id !== id);
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.success('Customer deleted successfully', 'Deleted');
        }
      },
      error: (err: HttpErrorResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.error('Failed to delete customer', 'Error');
        }
        console.error('Delete error:', err);
      }
    });
  }

  private friendlyError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Cannot reach server. Is the backend running?';
    if (err.status === 401) return 'Session expired. Please log in again.';
    if (err.status === 403) return 'You do not have permission to view customers.';
    return err.message || 'An unexpected error occurred.';
  }
}