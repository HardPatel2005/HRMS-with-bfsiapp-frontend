import { Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list';
import { CustomerFormComponent } from './customer-form/customer-form';
import { CustomerDetailComponent } from './customer-detail/customer-detail';

export const customerRoutes: Routes = [
  {
    path: '',
    component: CustomerListComponent
  },
  {
    path: 'new',
    component: CustomerFormComponent
  },
  {
    path: 'edit/:id',
    component: CustomerFormComponent
  },
  {
    path: ':id',
    component: CustomerDetailComponent
  }
];