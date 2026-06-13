import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly profileName = signal<string | null>(null);

  email       = computed(() => this.auth.user()?.email ?? '');
  displayName = computed(() => this.profileName() ?? this.email());
  initial     = computed(() => (this.displayName() || 'U')[0].toUpperCase());

  ngOnInit(): void {
    this.auth.getProfile()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(profile => {
        if (profile) this.profileName.set(profile.name);
      });
  }

  logout(): void { this.auth.logout(); }
}
