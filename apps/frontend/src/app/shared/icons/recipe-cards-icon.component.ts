import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-cards-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-cards-icon.component.html',
})
export class RecipeCardsIconComponent {
  /** Clases Tailwind para tamaño y color (ej: "w-5 h-5 text-blue-400") */
  @Input() class = 'w-5 h-5';
}
