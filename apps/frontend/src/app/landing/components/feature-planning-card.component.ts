import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

type CellStatus = 'filled' | 'empty';
interface CalendarRow { label: string; color: string; cells: CellStatus[]; }

const CALENDAR_ROWS: CalendarRow[] = [
  { label: 'Desayuno', color: '#fbbf24', cells: ['filled', 'filled', 'empty',  'filled', 'filled', 'empty',  'filled'] },
  { label: 'Comida',   color: '#3b82f6', cells: ['filled', 'empty',  'filled', 'filled', 'empty',  'filled', 'filled'] },
  { label: 'Cena',     color: '#6366f1', cells: ['filled', 'filled', 'filled', 'empty',  'filled', 'filled', 'empty' ] },
];

@Component({
  selector: 'app-feature-planning-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './feature-planning-card.component.html',
  styleUrl: './feature-planning-card.component.css',
})
export class FeaturePlanningCardComponent {
  readonly dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly calendarRows = CALENDAR_ROWS;
}
