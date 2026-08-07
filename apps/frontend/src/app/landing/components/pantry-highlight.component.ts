import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

/** Asymmetric split: pantry copy on the left, a real meal detail panel on the right. */
@Component({
  selector: 'app-pantry-highlight',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './pantry-highlight.component.html',
})
export class PantryHighlightComponent {}
