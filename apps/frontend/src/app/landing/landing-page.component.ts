import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { HeroComponent } from './hero.component';
import { FeaturesComponent } from './features.component';
import { HowItWorksComponent } from './components/how-it-works.component';
import { AppPreviewComponent } from './components/app-preview.component';
import { CtaComponent } from './cta.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    AppPreviewComponent,
    CtaComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar />
    <main class="bg-surface dark:bg-surface-dim text-on-surface dark:text-on-surface-variant font-body antialiased overflow-x-hidden transition-colors duration-200">
      <app-hero />
      <app-features />
      <app-how-it-works />
      <app-app-preview />
      <app-cta />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class LandingPageComponent {}
