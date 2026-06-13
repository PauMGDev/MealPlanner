import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
