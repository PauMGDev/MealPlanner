import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {}
