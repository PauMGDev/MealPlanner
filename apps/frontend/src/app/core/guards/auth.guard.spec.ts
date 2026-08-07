import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const isLoggedIn = vi.fn<() => boolean>();

  beforeEach(() => {
    isLoggedIn.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn } },
      ],
    });
  });

  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  it('returns true when the user is logged in', () => {
    isLoggedIn.mockReturnValue(true);
    expect(run()).toBe(true);
  });

  it('returns a UrlTree to /login when the user is not logged in', () => {
    isLoggedIn.mockReturnValue(false);
    const result = run();
    expect(result).not.toBe(true);
    expect(result.toString()).toContain('login');
  });
});
