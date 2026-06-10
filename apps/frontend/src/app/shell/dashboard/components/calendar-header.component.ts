import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { MealType } from '../../../core/services/meal-plans.service';
import type { MealRowDef } from '../weekly-calendar.types';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.css',
})
export class CalendarHeaderComponent {
  @Input() weekRangeLabel = '';
  @Input() mealRows: MealRowDef[] = [];
  @Input() visibleMealTypes: MealType[] = [];

  @Output() prevWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();
  @Output() goToThisWeek = new EventEmitter<void>();
  @Output() toggleMealType = new EventEmitter<MealType>();

  isVisible(type: MealType): boolean { return this.visibleMealTypes.includes(type); }
}
