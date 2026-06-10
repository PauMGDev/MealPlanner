import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.css',
})
export class AppModalComponent {
  @Input() open = false;
  @Input() maxWidth = 'sm:max-w-md';
  @Input() rounded = 'rounded-2xl';
  @Input() mobileBottom = true;
  @Output() closed = new EventEmitter<void>();

  get backdropClasses(): string {
    return this.mobileBottom ? 'items-end sm:items-center' : 'items-center';
  }

  get panelClasses(): string {
    return this.mobileBottom
      ? `${this.maxWidth} rounded-t-2xl sm:${this.rounded} max-h-[92vh]`
      : `${this.maxWidth} ${this.rounded} max-h-[90vh]`;
  }
}
