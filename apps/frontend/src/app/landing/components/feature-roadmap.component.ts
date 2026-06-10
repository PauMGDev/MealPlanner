import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

@Component({
  selector: 'app-feature-roadmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './feature-roadmap.component.html',
  styleUrl: './feature-roadmap.component.css',
})
export class FeatureRoadmapComponent {}
