import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
 title!: string;
  message!: string;
  confirmText!: string;
  cancelText!: string;
  onConfirm!: () => void;

  constructor(public modalRef: BsModalRef) {}

  confirm() {
    this.onConfirm();
    this.modalRef.hide();
  }

  cancel() {
    this.modalRef.hide();
  }
}
