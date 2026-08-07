import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { availabilityLabel, dotClass, type NextMealView, type WeekNeed } from '../weekly-calendar.types';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal.directive';

/**
 * TODO: placeholder data. Matching the pantry against the whole recipe book
 * needs an endpoint that does not exist yet (`GET /recipes/cookable`); it will
 * be implemented in a follow-up. Nothing here reads real state on purpose.
 */
const COOKABLE_PLACEHOLDER = ['Arroz tres delicias', 'Crema de calabacín', 'Tortilla de patatas'];

const PREVIEW_SIZE = 3;

@Component({
  selector: 'app-week-modules',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './week-modules.component.html',
})
export class WeekModulesComponent {
  @Input() needs: WeekNeed[] = [];
  @Input() nextMeal: NextMealView | null = null;
  @Input() todayInWeek = true;
  @Input() loading = true;
  @Input() addingToList = false;

  @Output() addNeedsToList = new EventEmitter<WeekNeed[]>();
  @Output() goToToday = new EventEmitter<void>();

  readonly cookablePlaceholder = COOKABLE_PLACEHOLDER;
  protected readonly dotClass = dotClass;
  protected readonly availabilityLabel = availabilityLabel;

  get topNeeds(): WeekNeed[] { return this.needs.slice(0, PREVIEW_SIZE); }
  get extraNeeds(): number { return Math.max(0, this.needs.length - PREVIEW_SIZE); }

  get recipeCount(): number {
    const names = new Set<string>();
    for (const need of this.needs) for (const name of need.recipeNames) names.add(name);
    return names.size;
  }
}
