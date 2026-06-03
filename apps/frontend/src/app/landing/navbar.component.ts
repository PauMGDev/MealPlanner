import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="fixed top-0 inset-x-0 z-50 border-b transition-all duration-300"
      [class.bg-mm-base/90]="scrolled()"
      [class.backdrop-blur-xl]="scrolled()"
      [class.border-white/[0.06]]="scrolled()"
      [class.bg-transparent]="!scrolled()"
      [class.border-transparent]="!scrolled()">
      <div class="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">

        <!-- Logo -->
        <a href="#" class="flex items-center gap-2.5 font-bold text-xl text-mm-text1">
          <svg viewBox="0 0 28 28" class="w-[26px] h-[26px]" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="#3b82f6" opacity="0.14"/>
            <rect x="6" y="6" width="16" height="16" rx="4" fill="#3b82f6"/>
          </svg>
          <span>MealMap</span>
        </a>

        <!-- Links -->
        <div class="flex items-center gap-6">
          <a href="#features"
             class="text-sm font-medium text-mm-text2 hover:text-mm-text1 transition-colors">
            Funcionalidades
          </a>
          <a routerLink="/login"
             class="btn-primary text-sm px-5 py-2.5 rounded-lg">
            Iniciar sesión
          </a>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }
}
