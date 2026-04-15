import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ProfileField = {
  readonly label: string;
  readonly value: string;
};

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ProfileComponent {
  readonly profileFields: readonly ProfileField[] = [
    { label: 'Employee Name', value: 'Krupa Kadia' },
    { label: 'Employee ID', value: 'OPT-1042' },
    { label: 'Designation', value: 'Software Engineer' },
    { label: 'Department', value: 'Technology' },
    { label: 'Reporting Manager', value: 'Nirav Shah' },
    { label: 'Work Location', value: 'Ahmedabad' }
  ];
}