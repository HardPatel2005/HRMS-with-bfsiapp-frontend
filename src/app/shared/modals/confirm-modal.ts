import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="decline()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="decline()">
        <i class="bi bi-x-circle me-1"></i>{{ cancelText }}
      </button>
      <button type="button" class="btn btn-primary" (click)="confirm()">
        <i class="bi bi-check-circle me-1"></i>{{ confirmText }}
      </button>
    </div>
  `
})
export class ConfirmModalComponent {
  bsModalRef = inject(BsModalRef);
  
  title = 'Confirm Action';
  message = 'Are you sure you want to proceed?';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  onConfirm?: () => void;
  onCancel?: () => void;

  confirm(): void {
    if (this.onConfirm) {
      this.onConfirm();
    }
    this.bsModalRef.hide();
  }

  decline(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.bsModalRef.hide();
  }
}
