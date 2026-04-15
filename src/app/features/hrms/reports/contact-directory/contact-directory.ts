import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-directory',
  imports: [CommonModule],
  templateUrl: './contact-directory.html',
  styleUrl: './contact-directory.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ContactDirectoryComponent {}