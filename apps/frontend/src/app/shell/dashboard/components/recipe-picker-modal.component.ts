import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import type { MealType } from '../../../core/services/meal-plans.service';
import { type Recipe } from '../../../core/services/recipes.service';
import { RecipeCardsIconComponent } from '../../../shared/icons/recipe-cards-icon.component';
import { MEAL_ROWS, SKELETON_ROWS, formatSlotDate, type MealRowDef } from '../weekly-calendar.types';

@Component({
  selector: 'app-recipe-picker-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCardsIconComponent],
  templateUrl: './recipe-picker-modal.component.html',
  styleUrl: './recipe-picker-modal.component.css',
})
export class RecipePickerModalComponent implements OnChanges {
  @Input() show = false;
  @Input() slot: { date: string; mealType: MealType } | null = null;
  @Input() set recipes(v: Recipe[]) { this.allRecipes.set(v); }
  @Input() set loadingRecipes(v: boolean) { this.isLoading.set(v); }

  @Output() closed = new EventEmitter<void>();
  @Output() selected = new EventEmitter<Recipe>();

  allRecipes = signal<Recipe[]>([]);
  protected readonly isLoading = signal(false);
  query = signal('');

  filteredRecipes = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.allRecipes().filter(r => r.name.toLowerCase().includes(q)) : this.allRecipes();
  });

  readonly skeletonRows = SKELETON_ROWS;
  protected readonly formatSlotDate = formatSlotDate;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) this.query.set('');
  }

  get rowDef(): MealRowDef | null {
    return this.slot ? MEAL_ROWS.find(r => r.type === this.slot!.mealType) ?? null : null;
  }
}
