import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent {
  private readonly auth = inject(AuthService);

  email   = computed(() => this.auth.user()?.email ?? '');
  initial = computed(() => (this.auth.user()?.email ?? 'U')[0].toUpperCase());

  logout(): void { this.auth.logout(); }
}
