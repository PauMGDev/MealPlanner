import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import type { MealType } from '../../core/services/meal-plans.service';
import {
  MAX_ACTIVE_MEAL_TYPES,
  MIN_ACTIVE_MEAL_TYPES,
} from '../../core/models/user.types';
import { MEAL_ROWS } from '../dashboard/weekly-calendar.types';

export interface NavDestination {
  path: string;
  label: string;
  icon: string;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { path: '/app/dashboard', label: 'Plan', icon: 'calendar_month' },
  { path: '/app/recipes', label: 'Recetas', icon: 'menu_book' },
  { path: '/app/pantry', label: 'Despensa', icon: 'kitchen' },
  { path: '/app/shopping-list', label: 'Lista', icon: 'shopping_cart' },
];

/**
 * The only thing in the shell that knows how navigation works: a floating pill
 * from `md` up, a bottom tab bar plus a mini header below it. Screens never see
 * either shape. The avatar menu carries what used to live in the sidebar foot:
 * the account, the active meal slots and logout.
 */
@Component({
  selector: 'app-shell-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell-nav.component.html',
})
export class ShellNavComponent {
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsService);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  readonly destinations = NAV_DESTINATIONS;
  readonly mealRows = MEAL_ROWS;
  readonly minSlots = MIN_ACTIVE_MEAL_TYPES;
  readonly maxSlots = MAX_ACTIVE_MEAL_TYPES;

  menuOpen = signal(false);
  settingsOpen = signal(false);
  settingsError = signal('');

  activeMealTypes = computed(() => this.settings.activeMealTypes());
  displayName = computed(
    () => this.settings.profile()?.name ?? this.auth.user()?.email ?? 'Mi cuenta',
  );
  email = computed(() => this.settings.profile()?.email ?? this.auth.user()?.email ?? '');
  initial = computed(() => (this.displayName() || 'U')[0].toUpperCase());

  toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);
    if (!next) this.settingsOpen.set(false);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.settingsOpen.set(false);
  }

  isSlotActive(type: MealType): boolean {
    return this.activeMealTypes().includes(type);
  }

  /** Disabled when toggling would leave fewer than 3 or more than 5 slots. */
  isSlotLocked(type: MealType): boolean {
    const count = this.activeMealTypes().length;
    return this.isSlotActive(type) ? count <= this.minSlots : count >= this.maxSlots;
  }

  toggleSlot(type: MealType): void {
    if (this.isSlotLocked(type)) return;
    const current = this.activeMealTypes();
    const next = MEAL_ROWS.map(r => r.type).filter(t =>
      current.includes(t) ? t !== type : t === type,
    );
    const snapshot = this.settings.profile();
    this.settingsError.set('');
    this.settings
      .updateActiveMealTypes(next)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: profile => this.settings.setProfile(profile),
        error: () => {
          this.settings.setProfile(snapshot);
          this.settingsError.set('No se pudieron guardar las franjas.');
        },
      });
  }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.contains(event.target as Node)) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }
}
