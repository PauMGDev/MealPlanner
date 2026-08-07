import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

interface PlannedDay {
  readonly day: string;
  readonly meal: string;
  readonly type: string;
  readonly today?: boolean;
}

/** Horizontal scroll-snap rail: the planned week, one card per day. */
@Component({
  selector: 'app-week-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './week-rail.component.html',
})
export class WeekRailComponent {
  readonly days: readonly PlannedDay[] = [
    { day: 'Lun', meal: 'Pasta integral con pesto', type: 'Comida' },
    { day: 'Mar', meal: 'Pollo al curry con arroz', type: 'Comida' },
    { day: 'Mié', meal: 'Salmón al horno con espárragos', type: 'Cena', today: true },
    { day: 'Jue', meal: 'Tacos de garbanzos', type: 'Cena' },
    { day: 'Vie', meal: 'Risotto de champiñones', type: 'Comida' },
    { day: 'Sáb', meal: 'Poke bowl de atún', type: 'Comida' },
    { day: 'Dom', meal: 'Lasaña de verduras', type: 'Cena' },
  ];
}
