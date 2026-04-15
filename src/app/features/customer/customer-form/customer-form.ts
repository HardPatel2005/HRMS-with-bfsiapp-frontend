import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CreateCustomerDto } from '../../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinner],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.scss']
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  customerForm!: FormGroup;
  isEditMode = false;
  customerId?: number;
  loading = false;
  submitted = false;

  genderOptions = ['Male', 'Female', 'Other'];
  customerTypes = ['Individual', 'Business'];
  identificationTypes = ['Passport', 'Driver License', 'National ID', 'SSN'];
  employmentStatuses = ['Employed', 'Self-Employed', 'Unemployed', 'Retired', 'Student'];

  ngOnInit(): void {
    this.initializeForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = +params['id'];
        this.loadCustomer(this.customerId);
      }
    });
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      alternatePhoneNumber: ['', Validators.maxLength(20)],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      identificationType: ['', Validators.required],
      identificationNumber: ['', Validators.required],
      customerType: ['', Validators.required],
      annualIncome: [0, [Validators.required, Validators.min(0)]],
      employmentStatus: ['', Validators.required]
    });
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          ...customer,
          dateOfBirth: this.formatDateForInput(customer.dateOfBirth)
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.toastr.error('Unable to load customer details', 'Error');
        this.loading = false;
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.customerForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly', 'Validation Error');
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    const customerData: CreateCustomerDto = {
      ...this.customerForm.value,
      dateOfBirth: new Date(this.customerForm.value.dateOfBirth).toISOString()
    };

    if (this.isEditMode && this.customerId) {
      this.updateCustomer(customerData);
    } else {
      this.createCustomer(customerData);
    }
  }

  createCustomer(data: CreateCustomerDto): void {
    this.loading = true;
    this.customerService.createCustomer(data).subscribe({
      next: () => {
        this.toastr.success('Customer has been created successfully', 'Success');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        this.toastr.error('Failed to create customer. Please try again.', 'Error');
        this.loading = false;
      }
    });
  }

  updateCustomer(data: CreateCustomerDto): void {
    if (!this.customerId) return;
    
    this.loading = true;
    this.customerService.updateCustomer(this.customerId, data).subscribe({
      next: () => {
        this.toastr.success('Customer has been updated successfully', 'Success');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.toastr.error('Failed to update customer. Please try again.', 'Error');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.submitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (!field || !(field.dirty || field.touched || this.submitted)) {
      return '';
    }

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (field.hasError('min')) {
      return 'Value must be greater than or equal to 0';
    }
    return '';
  }

  get f() { return this.customerForm.controls; }
}