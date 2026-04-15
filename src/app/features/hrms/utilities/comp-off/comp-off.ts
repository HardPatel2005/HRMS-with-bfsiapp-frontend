import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comp-off',
  imports: [CommonModule],
  templateUrl: './comp-off.html',
  styleUrl: './comp-off.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class CompOffComponent {}