import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { Recipe } from '../../../core/services/recipes.service';
import { accentBarClass, cardGradientStyle, dotClass, statusLabel, statusTextClass, type RecipeAvailability } from '../recipes.types';

@Component({
  selector: 'app-recipe-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-detail-modal.component.html',
  styleUrl: './recipe-detail-modal.component.css',
})
export class RecipeDetailModalComponent {
  @Input() recipe: Recipe | null = null;
  @Input() availability: RecipeAvailability | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<Recipe>();

  protected readonly dotClass = dotClass;
  protected readonly accentBarClass = accentBarClass;
  protected readonly cardGradientStyle = cardGradientStyle;
  protected readonly statusLabel = statusLabel;
  protected readonly statusTextClass = statusTextClass;
}
