import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PantryService } from '../../core/services/pantry.service';
import { RecipesService } from '../../core/services/recipes.service';

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

        <!-- Recipes count -->
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3">Recetas</p>
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            </div>
          </div>
          @if (loadingRecipes()) {
            <div class="h-9 w-12 bg-mm-card rounded-lg animate-pulse"></div>
          } @else {
            <p class="text-3xl font-bold text-mm-text1">{{ recipeCount() }}</p>
          }
        </div>

        <!-- Pantry items count -->
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3">Ítems en despensa</p>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
              </svg>
            </div>
          </div>
          @if (loadingPantry()) {
            <div class="h-9 w-12 bg-mm-card rounded-lg animate-pulse"></div>
          } @else {
            <p class="text-3xl font-bold text-mm-text1">{{ pantryCount() }}</p>
            @if (depletedCount() > 0) {
              <p class="text-xs text-yellow-400 mt-1">{{ depletedCount() }} agotado{{ depletedCount() !== 1 ? 's' : '' }}</p>
            }
          }
        </div>

        <!-- Meals this week (coming soon) -->
        <div class="bg-mm-surface border border-white/[0.06] rounded-2xl p-5 opacity-60">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3">Comidas esta semana</p>
            <div class="w-8 h-8 rounded-lg bg-mm-card flex items-center justify-center">
              <svg class="w-4 h-4 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-mm-text1">—</p>
          <p class="text-xs text-mm-text3 mt-1">Próximamente</p>
        </div>

      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly recipesService = inject(RecipesService);
  private readonly pantryService = inject(PantryService);

  email = computed(() => this.auth.user()?.email ?? '');

  loadingRecipes = signal(true);
  loadingPantry = signal(true);
  recipeCount = signal(0);
  pantryCount = signal(0);
  depletedCount = signal(0);

  ngOnInit(): void {
    this.recipesService.getAll().subscribe({
      next: (recipes) => { this.recipeCount.set(recipes.length); this.loadingRecipes.set(false); },
      error: () => this.loadingRecipes.set(false),
    });

    this.pantryService.getAll().subscribe({
      next: (items) => {
        this.pantryCount.set(items.filter(i => i.quantity > 0).length);
        this.depletedCount.set(items.filter(i => i.quantity === 0).length);
        this.loadingPantry.set(false);
      },
      error: () => this.loadingPantry.set(false),
    });
  }
}
