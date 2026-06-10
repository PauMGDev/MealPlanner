import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { Meal, MealType } from '../../../core/services/meal-plans.service';
import { DAY_LABELS, SKELETON_DAYS, SKELETON_ROWS, isToday, toISODate, type MealRowDef } from '../weekly-calendar.types';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.css',
})
export class CalendarGridComponent {
  @Input() weekDays: Date[] = [];
  @Input() filteredMealRows: MealRowDef[] = [];
  @Input() mealGrid = new Map<string, Meal>();
  @Input() loadingPlan = true;

  @Output() openDetail = new EventEmitter<Meal>();
  @Output() openPicker = new EventEmitter<{ date: string; mealType: MealType }>();
  @Output() removeSlot = new EventEmitter<{ date: string; mealType: MealType }>();

  readonly dayLabels = DAY_LABELS;
  readonly skeletonRows = SKELETON_ROWS;
  readonly skeletonDays = SKELETON_DAYS;
  protected readonly isToday = isToday;
  protected readonly toISODate = toISODate;

  getMeal(day: Date, mealType: MealType): Meal | undefined {
    return this.mealGrid.get(`${toISODate(day)}|${mealType}`);
  }

  onRemoveSlot(date: string, mealType: MealType, event: Event): void {
    event.stopPropagation();
    this.removeSlot.emit({ date, mealType });
  }
}
