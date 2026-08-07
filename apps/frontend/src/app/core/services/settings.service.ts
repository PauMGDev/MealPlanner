import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { MealType } from '../models/meal-plan.types';
import { DEFAULT_ACTIVE_MEAL_TYPES, type UserProfile } from '../models/user.types';

export type { UserProfile } from '../models/user.types';

/**
 * Holds the authenticated profile for the shell: the account chip in the nav and
 * the meal slots that drive the rows of the weekly matrix. Loaded once by the
 * layout, read by every screen.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  readonly profile = signal<UserProfile | null>(null);
  readonly activeMealTypes = computed(
    () => this.profile()?.activeMealTypes ?? DEFAULT_ACTIVE_MEAL_TYPES,
  );

  load() {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`).pipe(
      tap(profile => this.profile.set(profile)),
      catchError(() => of(null)),
    );
  }

  /** Optimistic: the caller rolls back by resetting the profile on error. */
  updateActiveMealTypes(activeMealTypes: MealType[]) {
    this.profile.update(p => (p ? { ...p, activeMealTypes } : p));
    return this.http.patch<UserProfile>(`${environment.apiUrl}/users/me/settings`, {
      activeMealTypes,
    });
  }

  setProfile(profile: UserProfile | null): void {
    this.profile.set(profile);
  }
}
