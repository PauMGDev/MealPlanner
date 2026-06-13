import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal.directive';

@Component({
  selector: 'app-app-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './app-preview.component.html',
})
export class AppPreviewComponent {}
