import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from './scroll-reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective, RouterLink],
  templateUrl: './cta.component.html',
})
export class CtaComponent {}
