import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

/** Thin hairline strip under the hero: three one-line claims, no cards. */
@Component({
  selector: 'app-value-band',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  template: `
    <section class="lp-band">
      <div class="lp-container">
        <div class="lp-band__grid">
          @for (claim of claims; track claim; let i = $index) {
            <p appReveal [appRevealIndex]="i" class="lp-band__item">{{ claim }}</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class ValueBandComponent {
  readonly claims = [
    'Plan semanal en menos de 5 minutos',
    'Lista de la compra generada sola',
    'Aviso cuando algo se agota o caduca',
  ];
}
