import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrmsService } from '../../../core/services/hrms.service';
import { EmployeeProfile } from '../../../models/hrms.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

type ProfileField = { label: string; value: string };

@Component({
  selector: 'app-profile',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ProfileComponent implements OnInit {
  private readonly hrmsService = inject(HrmsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  profileName = 'Employee';
  profileRole = 'HRMS User';
  initials = 'EM';

  profileFields: ProfileField[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.getMyProfile().subscribe({
      next: (profile: EmployeeProfile) => {
        this.profileName = profile.fullName;
        this.profileRole = `${profile.designation} - ${profile.department}`;
        this.initials = profile.fullName
          .split(' ')
          .filter(x => x.length > 0)
          .slice(0, 2)
          .map(x => x[0]?.toUpperCase() ?? '')
          .join('') || 'EM';

        this.profileFields = [
          { label: 'Employee Name', value: profile.fullName },
          { label: 'Employee ID', value: profile.employeeCode },
          { label: 'Email', value: profile.email },
          { label: 'Phone', value: profile.phone || '-' },
          { label: 'Designation', value: profile.designation },
          { label: 'Department', value: profile.department },
          { label: 'Reporting Manager', value: profile.managerName || '-' },
          { label: 'Blood Group', value: profile.bloodGroup || '-' }
        ];

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.profileFields = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}