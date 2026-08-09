import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthShellComponent } from '../auth-shell.component';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AuthShellComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  error = signal('');
  loading = signal(false);

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) this.form.patchValue({ email });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { name, email, password } = this.form.value;
    this.auth.register(name!, email!, password!).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: err => { this.error.set(this.messageFor(err, 'No se pudo crear la cuenta')); this.loading.set(false); },
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
