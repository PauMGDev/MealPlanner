import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { HeroComponent } from './hero.component';
import { ValueBandComponent } from './components/value-band.component';
import { FeaturesComponent } from './features.component';
import { WeekRailComponent } from './components/week-rail.component';
import { PantryHighlightComponent } from './components/pantry-highlight.component';
import { HowItWorksComponent } from './components/how-it-works.component';
import { FaqComponent } from './components/faq.component';
import { CtaComponent } from './cta.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    ValueBandComponent,
    FeaturesComponent,
    WeekRailComponent,
    PantryHighlightComponent,
    HowItWorksComponent,
    FaqComponent,
    CtaComponent,
    FooterComponent,
  ],
  template: `
    <div class="lp-page">
      <app-navbar />
      <main>
        <app-hero />
        <app-value-band />
        <app-features />
        <app-week-rail />
        <app-pantry-highlight />
        <app-how-it-works />
        <app-faq />
        <app-cta />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class LandingPageComponent {}
