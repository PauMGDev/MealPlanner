import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './how-it-works.component.html',
})
export class HowItWorksComponent {}
