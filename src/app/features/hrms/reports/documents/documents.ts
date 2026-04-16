import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsService } from '../../../../core/services/hrms.service';
import { DocumentRecord } from '../../../../models/hrms.model';
import { LoadingSpinner } from '../../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule, LoadingSpinner],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class DocumentsComponent implements OnInit {
  private readonly hrmsService = inject(HrmsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  fromDate = '';
  toDate = '';
  documentType = '';
  documents: DocumentRecord[] = [];

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.hrmsService.getDocuments(this.fromDate, this.toDate, this.documentType).subscribe({
      next: data => {
        this.documents = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.documents = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}