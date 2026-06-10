import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { Recipe } from '../../../core/services/recipes.service';
import { accentBarClass, cardBorderClass, cardGradientStyle, dotClass, type RecipeAvailability } from '../recipes.types';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: Recipe;
  @Input({ required: true }) availability!: RecipeAvailability;
  @Input() isExpanded = false;

  @Output() select = new EventEmitter<Recipe>();
  @Output() edit = new EventEmitter<Recipe>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleExpand = new EventEmitter<string>();

  protected readonly dotClass = dotClass;
  protected readonly accentBarClass = accentBarClass;
  protected readonly cardBorderClass = cardBorderClass;
  protected readonly cardGradientStyle = cardGradientStyle;
}
