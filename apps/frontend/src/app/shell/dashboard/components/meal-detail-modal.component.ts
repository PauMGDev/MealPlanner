import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import type { Meal } from '../../../core/services/meal-plans.service';
import { type Recipe } from '../../../core/services/recipes.service';
import { AppModalComponent } from '../../../shared/modal/app-modal.component';
import { MEAL_ROWS, formatSlotDate } from '../weekly-calendar.types';
import type { SlotRef } from './calendar-grid.component';

@Component({
  selector: 'app-meal-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModalComponent],
  templateUrl: './meal-detail-modal.component.html',
})
export class MealDetailModalComponent {
  @Input() meal: Meal | null = null;
  @Input() set recipeDetail(v: Recipe | null) { this.recipe.set(v); }
  @Input() set loadingRecipe(v: boolean) { this.loading.set(v); }

  @Output() closed = new EventEmitter<void>();
  @Output() switchRecipe = new EventEmitter<SlotRef>();
  @Output() removed = new EventEmitter<SlotRef>();

  recipe = signal<Recipe | null>(null);
  loading = signal(false);

  protected readonly formatSlotDate = formatSlotDate;

  get slotLabel(): string {
    return MEAL_ROWS.find(r => r.type === this.meal?.mealType)?.label ?? '';
  }

  private get slot(): SlotRef | null {
    return this.meal
      ? { date: this.meal.date.slice(0, 10), mealType: this.meal.mealType }
      : null;
  }

  onSwitchRecipe(): void {
    const slot = this.slot;
    if (slot) this.switchRecipe.emit(slot);
  }

  onRemove(): void {
    const slot = this.slot;
    if (slot) this.removed.emit(slot);
  }
}
