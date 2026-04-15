import { Routes } from '@angular/router';
import { UtilitiesComponent } from './utilities';
import { LeaveComponent } from './leave/leave';
import { CompOffComponent } from './comp-off/comp-off';
import { ReferCandidateComponent } from './refer-candidate/refer-candidate';
import { TasksheetComponent } from './tasksheet/tasksheet';
import { GrievanceComponent } from './grievance/grievance';
import { ResignationComponent } from './resignation/resignation';

export const utilitiesRoutes: Routes = [
  {
    path: '',
    component: UtilitiesComponent
  },
  {
    path: 'leave',
    component: LeaveComponent
  },
  {
    path: 'comp-off',
    component: CompOffComponent
  },
  {
    path: 'refer-candidate',
    component: ReferCandidateComponent
  },
  {
    path: 'tasksheet',
    component: TasksheetComponent
  },
  {
    path: 'grievance',
    component: GrievanceComponent
  },
  {
    path: 'resignation',
    component: ResignationComponent
  }
];