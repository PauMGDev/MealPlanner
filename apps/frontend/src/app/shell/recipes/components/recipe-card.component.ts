import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { Recipe } from '../../../core/services/recipes.service';
import { availabilitySummary, isMissing, type AvailabilitySummary, type RecipeAvailability } from '../recipes.types';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-card.component.html',
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Input({ required: true }) availability!: RecipeAvailability;
  @Input() isExpanded = false;

  @Output() select = new EventEmitter<Recipe>();
  @Output() edit = new EventEmitter<Recipe>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleExpand = new EventEmitter<string>();


  get summary(): AvailabilitySummary {
    return availabilitySummary(this.availability);
  }

  isIngredientMissing(ingredientId: string): boolean {
    return isMissing(this.availability.ingredientStatuses.get(ingredientId));
  }
}
