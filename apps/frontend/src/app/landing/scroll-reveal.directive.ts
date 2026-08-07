import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  Input,
  inject,
  numberAttribute,
} from '@angular/core';

/**
 * Reveals the host element when it first enters the viewport: fade + a short
 * translateY, driven entirely by the `.lp-reveal` / `.is-in` CSS pair in
 * styles.css. Consecutive items in a group stagger via `appRevealIndex`.
 *
 * Under `prefers-reduced-motion: reduce` the element is never hidden and no
 * observer is created, so the content is visible from first paint.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit {
  /** Position within its reveal group. Delay = index * STAGGER_MS. */
  @Input({ alias: 'appRevealIndex', transform: numberAttribute }) index = 0;

  private static readonly STAGGER_MS = 120;

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    // Hide before the first paint, otherwise the element flashes in and then out.
    if (!this.reducedMotion) this.el.classList.add('lp-reveal');
  }

  ngAfterViewInit(): void {
    if (this.reducedMotion) return;

    this.el.style.setProperty(
      '--lp-reveal-delay',
      `${this.index * ScrollRevealDirective.STAGGER_MS}ms`,
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.el.classList.add('is-in');
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(this.el);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
