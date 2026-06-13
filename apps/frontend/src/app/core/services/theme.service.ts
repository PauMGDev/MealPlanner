import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'mm_theme';

  readonly theme = signal<Theme>(this.getInitialTheme());

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
}
