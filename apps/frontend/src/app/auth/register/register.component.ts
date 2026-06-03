import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-mm-base flex items-center justify-center px-4">
      <div class="w-full max-w-[420px]">

        <a routerLink="/"
           class="flex items-center justify-center gap-2.5 font-bold text-xl text-mm-text1 mb-8">
          <svg viewBox="0 0 28 28" class="w-[26px] h-[26px]" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="#3b82f6" opacity="0.14"/>
            <rect x="6" y="6" width="16" height="16" rx="4" fill="#3b82f6"/>
          </svg>
          MealMap
        </a>

        <div class="bg-mm-surface border border-white/[0.06] rounded-3xl p-8">
          <h1 class="text-2xl font-bold text-mm-text1 mb-1">Crea tu cuenta</h1>
          <p class="text-[15px] text-mm-text2 mb-7">Empieza a planificar tus comidas</p>

          <form [formGroup]="form" (ngSubmit)="submit()">

            <div class="mb-4">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">Nombre</label>
              <input formControlName="name" type="text" placeholder="Tu nombre"
                     class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                            bg-mm-card text-mm-text1 text-[15px] outline-none
                            transition-colors focus:border-blue-500
                            placeholder:text-mm-text3 font-sans" />
              @if (form.get('name')?.touched && form.get('name')?.invalid) {
                <p class="text-red-400 text-xs mt-1.5">El nombre es obligatorio</p>
              }
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">Email</label>
              <input formControlName="email" type="email" placeholder="tu@email.com"
                     class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                            bg-mm-card text-mm-text1 text-[15px] outline-none
                            transition-colors focus:border-blue-500
                            placeholder:text-mm-text3 font-sans" />
              @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <p class="text-red-400 text-xs mt-1.5">Introduce un email válido</p>
              }
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">Contraseña</label>
              <input formControlName="password" type="password" placeholder="Mínimo 8 caracteres"
                     class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                            bg-mm-card text-mm-text1 text-[15px] outline-none
                            transition-colors focus:border-blue-500
                            placeholder:text-mm-text3 font-sans" />
              @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
                <p class="text-red-400 text-xs mt-1.5">Mínimo 8 caracteres</p>
              }
            </div>

            @if (error()) {
              <p class="text-red-400 text-sm mb-4 bg-red-400/10 px-4 py-2.5 rounded-lg">
                {{ error() }}
              </p>
            }

            <button type="submit" [disabled]="loading()"
                    class="btn-primary w-full py-3 text-[15px] mb-5
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                           disabled:shadow-none">
              {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="text-center text-sm text-mm-text2">
            ¿Ya tienes cuenta?
            <a routerLink="/login"
               class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { name, email, password } = this.form.value;
    this.auth.register(name!, email!, password!).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'No se pudo crear la cuenta');
        this.loading.set(false);
      },
    });
  }
}
