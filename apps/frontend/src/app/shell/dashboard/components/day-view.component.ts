import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { Meal, MealType } from '../../../core/services/meal-plans.service';
import {
  DAY_INITIALS,
  availabilityLabel,
  dotClass,
  formatDayLong,
  isToday,
  toISODate,
  type MealRowDef,
  type SlotAvailability,
} from '../weekly-calendar.types';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal.directive';
import type { SlotRef } from './calendar-grid.component';

/**
 * Mobile view of the same week: one day at a time, the active slots stacked as
 * cards, a day selector on top. Drag and drop does not apply here, so each card
 * carries its own reassign and remove actions instead.
 */
@Component({
  selector: 'app-day-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './day-view.component.html',
})
export class DayViewComponent {
  @Input() weekDays: Date[] = [];
  @Input() selectedDay: Date | null = null;
  @Input() mealRows: MealRowDef[] = [];
  @Input() mealGrid = new Map<string, Meal>();
  @Input() availability = new Map<string, SlotAvailability>();
  @Input() loading = true;

  @Output() selectDay = new EventEmitter<Date>();
  @Output() openDetail = new EventEmitter<Meal>();
  @Output() openPicker = new EventEmitter<SlotRef>();
  @Output() removeSlot = new EventEmitter<SlotRef>();

  readonly dayInitials = DAY_INITIALS;
  protected readonly isToday = isToday;
  protected readonly toISODate = toISODate;
  protected readonly dotClass = dotClass;
  protected readonly availabilityLabel = availabilityLabel;
  protected readonly formatDayLong = formatDayLong;

  isSelected(day: Date): boolean {
    return !!this.selectedDay && toISODate(day) === toISODate(this.selectedDay);
  }

  getMeal(mealType: MealType): Meal | undefined {
    if (!this.selectedDay) return undefined;
    return this.mealGrid.get(`${toISODate(this.selectedDay)}|${mealType}`);
  }

  getAvailability(meal: Meal): SlotAvailability {
    return this.availability.get(meal.recipeId) ?? { level: 'none', missing: 0, total: 0 };
  }

  slotRef(mealType: MealType): SlotRef {
    return { date: toISODate(this.selectedDay ?? new Date()), mealType };
  }
}
