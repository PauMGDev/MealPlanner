import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
      ],
    });
  });

  it('returns true when the user is logged in', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('returns a UrlTree to /login when the user is not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).not.toBe(true);
    // UrlTree serializes to /login
    expect(result.toString()).toContain('login');
  });
});
