import {
  Directive, ElementRef, Input, AfterViewInit, Renderer2, numberAttribute
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit {
  @Input({ alias: 'appRevealDelay', transform: numberAttribute }) delay = 0;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    const s = this.el.nativeElement.style;
    s.opacity = '0';
    s.transform = 'translateY(28px)';
    s.transition =
      'opacity 0.65s cubic-bezier(.23,1,.32,1), transform 0.65s cubic-bezier(.23,1,.32,1)';
  }

  ngAfterViewInit(): void {
    const el = this.el.nativeElement;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = '';
          }, this.delay * 1000);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
  }
}
