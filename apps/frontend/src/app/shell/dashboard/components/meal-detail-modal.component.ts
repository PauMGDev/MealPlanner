import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import type { Meal, MealType } from '../../../core/services/meal-plans.service';
import { type Recipe } from '../../../core/services/recipes.service';
import { MEAL_ROWS, SKELETON_ROWS, formatSlotDate, type MealRowDef } from '../weekly-calendar.types';

@Component({
  selector: 'app-meal-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meal-detail-modal.component.html',
  styleUrl: './meal-detail-modal.component.css',
})
export class MealDetailModalComponent {
  @Input() meal: Meal | null = null;
  @Input() set recipeDetail(v: Recipe | null) { this.recipe.set(v); }
  @Input() set loadingRecipe(v: boolean) { this.loading.set(v); }

  @Output() closed = new EventEmitter<void>();
  @Output() switchRecipe = new EventEmitter<{ date: string; mealType: MealType }>();
  @Output() removed = new EventEmitter<{ date: string; mealType: MealType }>();

  recipe = signal<Recipe | null>(null);
  loading = signal(false);

  readonly skeletonRows = SKELETON_ROWS;
  protected readonly formatSlotDate = formatSlotDate;

  get rowDef(): MealRowDef {
    return MEAL_ROWS.find(r => r.type === this.meal?.mealType)!;
  }

  onSwitchRecipe(): void {
    if (this.meal) this.switchRecipe.emit({ date: this.meal.date.slice(0, 10), mealType: this.meal.mealType });
  }

  onRemove(): void {
    if (this.meal) this.removed.emit({ date: this.meal.date.slice(0, 10), mealType: this.meal.mealType });
  }
}
