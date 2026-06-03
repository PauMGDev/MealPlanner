import { Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { HeroComponent } from './hero.component';
import { FeaturesComponent } from './features.component';
import { CtaComponent } from './cta.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    CtaComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar />
    <main class="bg-mm-base min-h-screen font-sans text-mm-text1 antialiased overflow-x-hidden">
      <app-hero />
      <app-features />
      <app-cta />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: block;
      background: #070b14;
    }
  `],
})
export class LandingPageComponent {}
