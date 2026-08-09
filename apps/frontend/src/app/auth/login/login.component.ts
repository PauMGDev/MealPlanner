import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthShellComponent } from '../auth-shell.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthShellComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = signal('');
  loading = signal(false);

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: err => { this.error.set(this.messageFor(err, 'Credenciales incorrectas')); this.loading.set(false); },
    });
  }

  /**
   * status 0 means the response never arrived (server down, CORS rejected the
   * origin). Reporting that as bad credentials sends people hunting for the
   * wrong problem.
   */
  private messageFor(err: { status: number; error?: { message?: string } }, fallback: string): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor. Comprueba que el backend está en marcha.';
    return err.error?.message ?? fallback;
  }

}
