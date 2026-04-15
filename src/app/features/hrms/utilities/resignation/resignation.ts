import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resignation',
  imports: [CommonModule],
  templateUrl: './resignation.html',
  styleUrl: './resignation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class ResignationComponent {
  readonly resignationDate = signal('');

  readonly lastWorkingDate = computed(() => {
    const value = this.resignationDate();
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    date.setMonth(date.getMonth() + 2);
    return date.toISOString().slice(0, 10);
  });

  onResignationDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.resignationDate.set(target.value);
  }
}