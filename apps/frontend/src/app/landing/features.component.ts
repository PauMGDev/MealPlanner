import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';
import { FeatureCardComponent } from './components/feature-card.component';

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective, FeatureCardComponent],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {}
