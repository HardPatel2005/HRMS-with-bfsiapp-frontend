import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinner],
  templateUrl: './customer-detail.html',
  styleUrls: ['./customer-detail.scss']
})
export class CustomerDetailComponent implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  customer?: Customer;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomerById(id).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.customer = undefined;
        this.errorMessage = error?.status === 404
          ? `Customer with ID ${id} not found.`
          : 'Unable to load customer details. Please verify the API is running on https://localhost:44313 and try again.';
        this.loading = false;
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }

  formatDate(value?: Date | string): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString();
  }

  editCustomer(): void {
    if (this.customer?.id) {
      this.router.navigate(['/customers', 'edit', this.customer.id]);
    }
  }

  deleteCustomer(): void {
    if (!this.customer?.id) return;

    const customerId = this.customer.id;
    const customerName = `${this.customer.firstName} ${this.customer.lastName}`;

    if (isPlatformBrowser(this.platformId)) {
      const confirmed = window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`);
      if (confirmed) {
        this.performDelete(customerId);
      }
    }
  }

  private performDelete(id: number): void {
    this.loading = true;
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.toastr.success('Customer has been deleted successfully', 'Success');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.toastr.error('Failed to delete customer', 'Error');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}