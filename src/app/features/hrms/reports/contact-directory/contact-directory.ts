import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsService } from '../../../../core/services/hrms.service';
import { EmployeeDirectory } from '../../../../models/hrms.model';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-contact-directory',
  imports: [CommonModule, FormsModule, LoadingSpinner],
  templateUrl: './contact-directory.html',
  styleUrl: './contact-directory.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ContactDirectoryComponent implements OnInit {
  private readonly hrmsService = inject(HrmsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  search = '';
  employees: EmployeeDirectory[] = [];

  ngOnInit(): void {
    this.loadDirectory();
  }

  loadDirectory(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.getContactDirectory(this.search).subscribe({
      next: data => {
        this.employees = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.employees = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}