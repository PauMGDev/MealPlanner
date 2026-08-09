import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.css',
})
export class AppModalComponent {
  /** Opening moves focus into the panel, which is also what makes Escape work. */
  @Input() set open(value: boolean) {
    const wasOpen = this.isOpen;
    this.isOpen = value;
    if (value && !wasOpen) this.focusPanel();
  }

  @Input() maxWidth = 'sm:max-w-md';
  /** Sheet from the bottom edge on phones, centred dialog from `sm` up. */
  @Input() mobileBottom = true;
  @Output() closed = new EventEmitter<void>();

  isOpen = false;

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private focusTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.focusTimer));
  }

  get backdropClasses(): string {
    return this.mobileBottom ? 'items-end sm:items-center' : 'items-center';
  }

  /**
   * Complete literals only. The radius used to be built as `sm:${this.rounded}`,
   * which Tailwind never sees, so panels shipped with square bottom corners and
   * the footer looked like it was overflowing them.
   */
  get panelClasses(): string {
    return this.mobileBottom
      ? `${this.maxWidth} rounded-t-2xl sm:rounded-2xl max-h-[92vh]`
      : `${this.maxWidth} rounded-2xl max-h-[90vh]`;
  }

  /**
   * Escape is handled on the panel, not on the document, so it unwinds by DOM
   * depth: content that opens its own layer stops the event on its own subtree
   * and the panel never sees it. A document listener would fire regardless of
   * where focus is, and close everything the moment focus slipped to `<body>`.
   */
  private focusPanel(): void {
    clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(
      () => this.host.querySelector<HTMLElement>('[data-modal-panel]')?.focus(),
    );
  }
}
