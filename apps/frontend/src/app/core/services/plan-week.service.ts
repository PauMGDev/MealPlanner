import { Injectable, computed, signal } from '@angular/core';
import { addDays, getThisMonday, toISODate } from '../../shell/dashboard/weekly-calendar.types';

/**
 * The week the Plan screen is showing. It lives outside the screen because
 * other surfaces need it too: adding a recipe to the plan from the recipe
 * modal offers the days of the week the user is actually looking at, not
 * always the current one.
 */
@Injectable({ providedIn: 'root' })
export class PlanWeekService {
  readonly weekStart = signal<Date>(getThisMonday());

  readonly days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)));
  readonly isCurrentWeek = computed(() => toISODate(this.weekStart()) === toISODate(getThisMonday()));

  shift(days: number): void {
    this.weekStart.update(d => addDays(d, days));
  }

  goToThisWeek(): void {
    this.weekStart.set(getThisMonday());
  }
}
