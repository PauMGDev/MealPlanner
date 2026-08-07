import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

/** Vertical timeline: the three things a user actually does, in order. */
@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './how-it-works.component.html',
})
export class HowItWorksComponent {
  readonly steps = [
    {
      title: 'Planifica',
      description: 'Elige tus recetas para la semana en menos de 5 minutos.',
    },
    {
      title: 'Cocina',
      description: 'Sigue instrucciones paso a paso optimizadas para cada plato.',
    },
    {
      title: 'Disfruta',
      description: 'Ahorra tiempo y dinero mientras comes más saludable.',
    },
  ];
}
