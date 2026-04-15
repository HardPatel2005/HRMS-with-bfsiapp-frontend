import { Routes } from '@angular/router';
import { ReportsComponent } from './reports';
import { ContactDirectoryComponent } from './contact-directory/contact-directory';
import { EmployeesOnLeaveComponent } from './employees-on-leave/employees-on-leave';
import { DocumentsComponent } from './documents/documents';
import { PerformanceEvaluationComponent } from './performance-evaluation/performance-evaluation';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: 'contact-directory',
    component: ContactDirectoryComponent
  },
  {
    path: 'employees-on-leave',
    component: EmployeesOnLeaveComponent
  },
  {
    path: 'documents',
    component: DocumentsComponent
  },
  {
    path: 'performance-evaluation',
    component: PerformanceEvaluationComponent
  }
];