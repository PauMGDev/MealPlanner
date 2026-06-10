import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';
import { FeaturePlanningCardComponent } from './components/feature-planning-card.component';
import { FeatureRecipesCardComponent } from './components/feature-recipes-card.component';
import { FeatureRoadmapComponent } from './components/feature-roadmap.component';

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective, FeaturePlanningCardComponent, FeatureRecipesCardComponent, FeatureRoadmapComponent],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {}
