import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-mm-text1">Dashboard</h1>
        <p class="text-mm-text2 mt-1">Bienvenido, {{ email() }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">Recetas</p>
          <p class="text-3xl font-bold text-mm-text1">—</p>
        </div>
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">Ítems en despensa</p>
          <p class="text-3xl font-bold text-mm-text1">—</p>
        </div>
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">Comidas esta semana</p>
          <p class="text-3xl font-bold text-mm-text1">—</p>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  email = computed(() => this.auth.user()?.email ?? '');
}
