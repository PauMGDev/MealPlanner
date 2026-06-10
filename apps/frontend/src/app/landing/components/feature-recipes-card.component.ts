import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

interface SampleIngredient { name: string; qty: string; status: 'available' | 'depleted' | 'missing'; }

const SAMPLE_INGREDIENTS: SampleIngredient[] = [
  { name: 'Leche',    qty: '200 ml', status: 'available' },
  { name: 'Harina',   qty: '100 g',  status: 'available' },
  { name: 'Huevos',   qty: '0 ud',   status: 'depleted'  },
  { name: 'Levadura', qty: '—',      status: 'missing'   },
];

@Component({
  selector: 'app-feature-recipes-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './feature-recipes-card.component.html',
  styleUrl: './feature-recipes-card.component.css',
})
export class FeatureRecipesCardComponent {
  readonly sampleIngredients = SAMPLE_INGREDIENTS;
}
