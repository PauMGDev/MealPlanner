import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { IngredientResult, IngredientsService } from '../../core/services/ingredients.service';
import { PantryItem, PantryService } from '../../core/services/pantry.service';
import { Recipe, RecipesService } from '../../core/services/recipes.service';

interface PendingIngredient {
  ingredient: IngredientResult;
  quantity: number;
}

type AvailabilityStatus = 'available' | 'depleted' | 'missing';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-2xl font-bold text-mm-text1">Recetas</h1>
          <p class="text-mm-text2 mt-0.5 text-sm">
            @if (isFiltering()) {
              <span class="text-mm-text2">{{ filteredRecipes().length }}</span>
              <span> de {{ recipes().length }}</span>
            } @else {
              <span class="text-mm-text2">{{ recipes().length }}</span> receta{{ recipes().length !== 1 ? 's' : '' }}
            }
          </p>
        </div>
        <button (click)="openModal()"
                class="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Nueva receta
        </button>
      </div>

      <!-- Search & filters -->
      @if (!loading() && recipes().length > 0) {
        <div class="sticky top-0 z-10 -mx-8 px-8 pt-3 pb-4 mb-4
                    bg-mm-base/90 backdrop-blur-md border-b border-white/[0.04]">
          <div class="relative mb-2.5">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mm-text3 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607"/>
            </svg>
            <input type="text"
                   [value]="searchQuery()"
                   (input)="searchQuery.set($any($event.target).value)"
                   placeholder="Buscar receta…"
                   class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.06]
                          bg-mm-surface text-mm-text1 text-sm outline-none
                          transition-colors focus:border-blue-500/50 placeholder:text-mm-text3" />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')"
                      class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5
                             text-mm-text3 hover:text-mm-text1 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            }
          </div>
          <div class="flex items-center gap-2">
            <button (click)="onlyAvailable.update(v => !v)"
                    [class]="onlyAvailable()
                      ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border bg-green-500/20 text-green-400 border-green-500/30'
                      : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border bg-mm-surface border-white/[0.06] text-mm-text2 hover:border-white/10 hover:text-mm-text1'">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
              Listo para cocinar
            </button>
            @if (isFiltering()) {
              <button (click)="clearFilters()"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                             text-mm-text3 hover:text-mm-text1 transition-colors
                             border border-white/[0.06] hover:border-white/10 ml-auto">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Limpiar
              </button>
            }
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center gap-3 text-mm-text2 text-sm py-16 justify-center">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Cargando...
        </div>
      }

      <!-- Empty state -->
      @else if (recipes().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-20 h-20 rounded-3xl bg-mm-surface border border-white/[0.06]
                      flex items-center justify-center mb-5">
            <svg class="w-9 h-9 text-mm-text3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="1.3">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
            </svg>
          </div>
          <p class="text-mm-text1 font-semibold text-lg mb-1">Sin recetas todavía</p>
          <p class="text-mm-text2 text-sm mb-6 max-w-xs">Crea tu primera receta y vincula los ingredientes de tu despensa</p>
          <button (click)="openModal()" class="btn-primary px-5 py-2.5 text-sm">
            Crear primera receta
          </button>
        </div>
      }

      <!-- Recipes grid -->
      @else {
        @if (filteredRecipes().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-12 h-12 rounded-2xl bg-mm-surface border border-white/[0.06]
                        flex items-center justify-center mb-4">
              <svg class="w-5 h-5 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607"/>
              </svg>
            </div>
            <p class="text-mm-text1 font-semibold mb-1">Sin resultados</p>
            <p class="text-mm-text3 text-sm mb-4">
              @if (onlyAvailable() && searchQuery()) {
                Ninguna receta coincide con "{{ searchQuery() }}" y tienes todos los ingredientes
              } @else if (onlyAvailable()) {
                No tienes todos los ingredientes para ninguna receta
              } @else {
                No se encontró ninguna receta con "{{ searchQuery() }}"
              }
            </p>
            <button (click)="clearFilters()"
                    class="px-4 py-2 rounded-full border border-white/[0.07] text-mm-text2
                           hover:text-mm-text1 hover:border-white/10 transition-colors text-sm">
              Limpiar filtros
            </button>
          </div>
        }
        <div class="grid gap-3 items-start" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))">
          @for (recipe of filteredRecipes(); track recipe.id) {
            <div class="bg-mm-surface border rounded-xl overflow-hidden group transition-all duration-200 cursor-pointer"
                 [class]="cardBorderClass(recipe)"
                 (click)="openDetail(recipe)">

              <!-- Image area -->
              <div class="relative h-36 overflow-hidden rounded-t-xl">
                @if (recipe.imageUrl) {
                  <img [src]="recipe.imageUrl" [alt]="recipe.name"
                       class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-white"
                       [style]="cardGradientStyle(recipe)">
                    <svg class="w-12 h-12 opacity-20" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                  </div>
                }
                <div class="absolute bottom-0 left-0 right-0 h-0.5" [class]="accentBarClass(recipe)"></div>
              </div>

              <div class="p-4">
                <!-- Top row: name + delete -->
                <div class="flex items-start justify-between mb-2">
                  <p class="text-[15px] font-semibold text-mm-text1 leading-snug flex-1 min-w-0 pr-2 line-clamp-2 min-h-[2.75rem]">
                    {{ recipe.name }}
                  </p>
                  <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all"
                       (click)="$event.stopPropagation()">
                    <button (click)="openEditModal(recipe)"
                            title="Editar"
                            class="p-1.5 rounded-lg text-mm-text3
                                   hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                      </svg>
                    </button>
                    <button (click)="deleteRecipe(recipe.id)"
                            title="Eliminar"
                            class="p-1.5 rounded-lg text-mm-text3
                                   hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <p class="text-xs text-mm-text2 mb-3 line-clamp-1 leading-relaxed min-h-[1rem] overflow-hidden">{{ recipe.description }}</p>

                <!-- Meta pills -->
                <div class="flex flex-wrap gap-1.5 mb-3">
                  <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-mm-card
                               text-xs text-mm-text2">
                    <svg class="w-3 h-3 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ recipe.prepTime }} min
                  </span>
                  <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-mm-card
                               text-xs text-mm-text2">
                    <svg class="w-3 h-3 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                    </svg>
                    {{ recipe.servings }} rac.
                  </span>
                  @if (recipe.steps.length > 0) {
                    <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-mm-card
                                 text-xs text-mm-text2">
                      <svg class="w-3 h-3 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5"/>
                      </svg>
                      {{ recipe.steps.length }} paso{{ recipe.steps.length !== 1 ? 's' : '' }}
                    </span>
                  }
                </div>

                <!-- Ingredient availability summary -->
                @if (recipe.recipeIngredients.length > 0) {
                  <div class="flex items-center gap-2 pt-2.5 border-t border-white/[0.04]"
                       (click)="$event.stopPropagation(); toggleExpand(recipe.id)">
                    <div class="flex gap-1">
                      @for (ri of recipe.recipeIngredients; track ri.id) {
                        <span class="w-2 h-2 rounded-full flex-shrink-0"
                              [class]="dotClass(ingredientStatus(ri.ingredientId))"
                              [title]="ri.ingredient.name"></span>
                      }
                    </div>
                    <span class="text-xs text-mm-text3">
                      {{ availableSummary(recipe) }}
                    </span>
                    <svg class="w-3 h-3 text-mm-text3 ml-auto transition-transform duration-200"
                         [class.rotate-180]="expandedId() === recipe.id"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                  </div>
                } @else {
                  <div class="flex items-center gap-1.5 pt-2.5 border-t border-white/[0.04]"
                       (click)="$event.stopPropagation(); toggleExpand(recipe.id)">
                    <span class="text-xs text-mm-text3">Sin ingredientes</span>
                    <svg class="w-3 h-3 text-mm-text3 ml-auto transition-transform duration-200"
                         [class.rotate-180]="expandedId() === recipe.id"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                  </div>
                }

                <!-- Expanded: ingredient list -->
                @if (expandedId() === recipe.id) {
                  <div class="mt-3 pt-3 border-t border-white/[0.04] space-y-2" (click)="$event.stopPropagation()">
                    @if (recipe.recipeIngredients.length === 0) {
                      <p class="text-xs text-mm-text3 text-center py-2">No hay ingredientes en esta receta</p>
                    }
                    @for (ri of recipe.recipeIngredients; track ri.id) {
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              [class]="dotClass(ingredientStatus(ri.ingredientId))"></span>
                        <span class="text-xs text-mm-text1 truncate">{{ ri.ingredient.name }}</span>
                        <span class="text-xs text-mm-text3 flex-shrink-0">{{ ri.quantity }} {{ ri.ingredient.unit }}</span>
                      </div>
                    }
                    @if (recipe.steps.length > 0) {
                      <div class="pt-2 mt-2 border-t border-white/[0.04]">
                        <p class="text-xs font-medium text-mm-text3 mb-2 uppercase tracking-wide">Pasos</p>
                        <ol class="space-y-1">
                          @for (step of recipe.steps; track $index) {
                            <li class="text-xs text-mm-text2 flex gap-2">
                              <span class="text-mm-text3 flex-shrink-0">{{ $index + 1 }}.</span>
                              <span>{{ step }}</span>
                            </li>
                          }
                        </ol>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- ── Detail Modal ──────────────────────────────────────── -->
    @if (detailRecipe(); as recipe) {
      <div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50
                  flex items-center justify-center p-4 modal-backdrop-enter"
           (click)="closeDetail()">
        <div class="relative bg-mm-surface border border-white/[0.07] rounded-2xl
                    w-full max-w-3xl shadow-2xl modal-enter
                    flex flex-col sm:flex-row overflow-hidden max-h-[90vh]"
             (click)="$event.stopPropagation()">

          <!-- Status accent line across top -->
          <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl z-10"
               [class]="accentBarClass(recipe)"></div>

          <!-- Content — left / bottom -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-8 min-w-0 order-2 sm:order-1">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3 mb-1">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-2.5">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        [class]="dotClass(detailStatusForDot(recipe))"></span>
                  <span class="text-[10px] font-semibold tracking-[0.15em] uppercase"
                        [class]="overallStatusTextClass(recipe)">
                    {{ overallStatusLabel(recipe) }}
                  </span>
                </div>
                <h2 class="text-2xl font-bold text-mm-text1 leading-tight">{{ recipe.name }}</h2>
              </div>
              <div class="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                <button (click)="openEditModal(recipe)"
                        title="Editar"
                        class="p-2 rounded-xl text-mm-text3 hover:text-blue-400
                               hover:bg-blue-400/10 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                  </svg>
                </button>
                <button (click)="closeDetail()"
                        class="p-2 rounded-xl text-mm-text3 hover:text-mm-text1
                               hover:bg-white/[0.04] transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            @if (recipe.description) {
              <p class="text-sm text-mm-text2 leading-relaxed mt-3">{{ recipe.description }}</p>
            }

            <!-- Meta pills -->
            <div class="flex flex-wrap gap-2 mt-5 mb-6">
              <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-mm-card border border-white/[0.06] text-xs text-mm-text2">
                <svg class="w-3.5 h-3.5 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ recipe.prepTime }} min
              </span>
              <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-mm-card border border-white/[0.06] text-xs text-mm-text2">
                <svg class="w-3.5 h-3.5 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
                {{ recipe.servings }} ración{{ recipe.servings !== 1 ? 'es' : '' }}
              </span>
              @if (recipe.steps.length > 0) {
                <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-mm-card border border-white/[0.06] text-xs text-mm-text2">
                  <svg class="w-3.5 h-3.5 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5"/>
                  </svg>
                  {{ recipe.steps.length }} paso{{ recipe.steps.length !== 1 ? 's' : '' }}
                </span>
              }
            </div>

            <div class="border-t border-white/[0.05] mb-6"></div>

            <!-- Ingredients -->
            @if (recipe.recipeIngredients.length > 0) {
              <section class="mb-7">
                <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-mm-text3 mb-3">
                  Ingredientes
                </p>
                <div class="space-y-1.5">
                  @for (ri of recipe.recipeIngredients; track ri.id) {
                    <div class="flex items-center gap-2.5 px-3 py-2.5
                                rounded-xl bg-mm-card/60 border border-white/[0.04] min-w-0">
                      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            [class]="dotClass(ingredientStatus(ri.ingredientId))"></span>
                      <span class="text-sm text-mm-text1 truncate">{{ ri.ingredient.name }}</span>
                      <span class="text-xs text-mm-text3 flex-shrink-0 ml-auto">{{ ri.quantity }} {{ ri.ingredient.unit }}</span>
                    </div>
                  }
                </div>
              </section>
            }

            <!-- Steps -->
            @if (recipe.steps.length > 0) {
              <section>
                <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-mm-text3 mb-4">
                  Preparación
                </p>
                <ol class="space-y-4">
                  @for (step of recipe.steps; track $index) {
                    <li class="flex gap-4">
                      <span class="flex-shrink-0 w-6 h-6 rounded-full
                                   bg-mm-card border border-white/[0.06]
                                   flex items-center justify-center
                                   text-[11px] font-semibold text-mm-text3 mt-0.5">
                        {{ $index + 1 }}
                      </span>
                      <p class="text-sm text-mm-text2 leading-relaxed">{{ step }}</p>
                    </li>
                  }
                </ol>
              </section>
            }

            @if (recipe.recipeIngredients.length === 0 && recipe.steps.length === 0) {
              <p class="text-sm text-mm-text3 text-center py-8">
                Esta receta no tiene ingredientes ni pasos definidos aún.
              </p>
            }

          </div>

          <!-- Image — top on mobile, right column on sm+ -->
          <div class="h-52 sm:h-auto sm:w-72 sm:flex-shrink-0 relative order-first sm:order-last">
            @if (recipe.imageUrl) {
              <img [src]="recipe.imageUrl" [alt]="recipe.name"
                   class="w-full h-full object-cover" />
            } @else {
              <div class="w-full h-full flex items-center justify-center text-white"
                   [style]="cardGradientStyle(recipe)">
                <svg class="w-16 h-16 opacity-15" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
              </div>
            }
            <!-- Fade toward content on desktop -->
            <div class="hidden sm:block absolute inset-y-0 left-0 w-12
                        bg-gradient-to-r from-mm-surface to-transparent pointer-events-none"></div>
            <!-- Fade toward content on mobile -->
            <div class="sm:hidden absolute inset-x-0 bottom-0 h-10
                        bg-gradient-to-t from-mm-surface to-transparent pointer-events-none"></div>
          </div>

        </div>
      </div>
    }

    <!-- ── Modal ────────────────────────────────────────────── -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                  flex items-center justify-center p-4"
           (click)="closeModal()">

        <div class="bg-mm-surface border border-white/[0.06] rounded-3xl
                    w-full max-w-xl shadow-2xl max-h-[92vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-8 pt-7 pb-0 flex-shrink-0">
            <h2 class="text-xl font-bold text-mm-text1">{{ editingRecipe() ? 'Editar receta' : 'Nueva receta' }}</h2>
            <button (click)="closeModal()"
                    class="p-2 rounded-xl text-mm-text3 hover:text-mm-text1
                           hover:bg-white/[0.04] transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Scrollable form body -->
          <div class="overflow-y-auto flex-1 px-8 pt-6 pb-8">
            <form [formGroup]="form" (ngSubmit)="submit()" id="recipeForm">

              <!-- Name -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-mm-text2 mb-1.5">Nombre</label>
                <input formControlName="name" type="text" placeholder="Ej: Pasta carbonara"
                       class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                              bg-mm-card text-mm-text1 text-[15px] outline-none
                              transition-colors focus:border-blue-500
                              placeholder:text-mm-text3" />
                @if (form.get('name')?.touched && form.get('name')?.invalid) {
                  <p class="text-red-400 text-xs mt-1.5">El nombre es obligatorio (mín. 2 caracteres)</p>
                }
              </div>

              <!-- Description -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-mm-text2 mb-1.5">
                  Descripción <span class="text-mm-text3 font-normal">(opcional)</span>
                </label>
                <textarea formControlName="description" rows="2"
                          placeholder="Breve descripción..."
                          class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                                 bg-mm-card text-mm-text1 text-[15px] outline-none
                                 transition-colors focus:border-blue-500
                                 placeholder:text-mm-text3 resize-none"></textarea>
              </div>

              <!-- Image upload (próximamente) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-mm-text2 mb-1.5">
                  Imagen <span class="text-mm-text3 font-normal">(próximamente)</span>
                </label>
                <div class="w-full h-24 rounded-[10px] border border-dashed border-white/[0.10]
                            bg-mm-card flex flex-col items-center justify-center gap-1.5
                            opacity-40 cursor-not-allowed select-none">
                  <svg class="w-6 h-6 text-mm-text3" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <p class="text-xs text-mm-text3">Subir imagen</p>
                </div>
              </div>

              <!-- PrepTime + Servings -->
              <div class="flex gap-3 mb-5">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-mm-text2 mb-1.5">Tiempo (min)</label>
                  <input formControlName="prepTime" type="number" placeholder="30" min="1"
                         class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                                bg-mm-card text-mm-text1 text-[15px] outline-none
                                transition-colors focus:border-blue-500 placeholder:text-mm-text3" />
                  @if (form.get('prepTime')?.touched && form.get('prepTime')?.invalid) {
                    <p class="text-red-400 text-xs mt-1.5">Tiempo inválido</p>
                  }
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-mm-text2 mb-1.5">Raciones</label>
                  <input formControlName="servings" type="number" placeholder="4" min="1"
                         class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                                bg-mm-card text-mm-text1 text-[15px] outline-none
                                transition-colors focus:border-blue-500 placeholder:text-mm-text3" />
                  @if (form.get('servings')?.touched && form.get('servings')?.invalid) {
                    <p class="text-red-400 text-xs mt-1.5">Raciones inválidas</p>
                  }
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-white/[0.06] mb-5"></div>

              <!-- Steps -->
              <div class="mb-5">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3">Pasos</p>
                  <button type="button" (click)="addStep()"
                          class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    + Añadir paso
                  </button>
                </div>
                @for (step of stepControls; track $index) {
                  <div class="flex gap-2 mb-2">
                    <span class="flex-shrink-0 w-5 h-10 flex items-center justify-center
                                 text-xs text-mm-text3 font-medium">{{ $index + 1 }}.</span>
                    <input [formControl]="step"
                           [placeholder]="'Paso ' + ($index + 1) + '...'"
                           class="flex-1 px-3 py-2.5 rounded-[10px] border border-white/[0.06]
                                  bg-mm-card text-mm-text1 text-sm outline-none
                                  transition-colors focus:border-blue-500 placeholder:text-mm-text3" />
                    @if (stepControls.length > 1) {
                      <button type="button" (click)="removeStep($index)"
                              class="flex-shrink-0 p-2 rounded-lg text-mm-text3
                                     hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Divider -->
              <div class="border-t border-white/[0.06] mb-5"></div>

              <!-- ── Ingredients section ────────────────────── -->
              <div class="mb-6">
                <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-3">
                  Ingredientes <span class="font-normal normal-case tracking-normal">(opcional)</span>
                </p>

                <!-- Search input -->
                <div class="relative mb-3">
                  <input
                    type="text"
                    [value]="ingredientQuery()"
                    (input)="onSearchInput($any($event.target).value)"
                    (focus)="showResults.set(true)"
                    placeholder="Buscar ingrediente..."
                    class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                           bg-mm-card text-mm-text1 text-[15px] outline-none
                           transition-colors focus:border-blue-500 placeholder:text-mm-text3" />
                  @if (ingredientQuery().length > 0) {
                    <button type="button"
                            (click)="clearSearch()"
                            class="absolute right-3 top-1/2 -translate-y-1/2 p-1
                                   text-mm-text3 hover:text-mm-text2 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </div>

                <!-- Search results dropdown (inline) -->
                @if (showResults() && ingredientQuery().length >= 2) {
                  <div class="bg-mm-card border border-white/[0.06] rounded-xl mb-3 overflow-hidden">
                    @if (searchLoading()) {
                      <div class="px-4 py-3 text-xs text-mm-text3">Buscando...</div>
                    } @else if (ingredientResults().length > 0) {
                      @for (result of ingredientResults(); track result.id) {
                        <button type="button"
                                (click)="selectIngredient(result)"
                                class="w-full flex items-center justify-between px-4 py-2.5
                                       hover:bg-white/[0.04] transition-colors text-left
                                       border-b border-white/[0.04] last:border-0">
                          <span class="text-sm text-mm-text1">{{ result.name }}</span>
                          <span class="text-xs text-mm-text3 ml-2">{{ result.unit }}</span>
                        </button>
                      }
                      <!-- Create new option at bottom -->
                      <button type="button"
                              (click)="openCreateIngredient()"
                              class="w-full flex items-center gap-2 px-4 py-2.5
                                     hover:bg-blue-500/[0.06] transition-colors text-left
                                     border-t border-white/[0.04]">
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        <span class="text-sm text-blue-400">Crear "{{ ingredientQuery() }}"</span>
                      </button>
                    } @else {
                      <div class="px-4 py-3 text-xs text-mm-text3">
                        No se encontraron resultados
                      </div>
                      <button type="button"
                              (click)="openCreateIngredient()"
                              class="w-full flex items-center gap-2 px-4 py-2.5
                                     hover:bg-blue-500/[0.06] transition-colors text-left
                                     border-t border-white/[0.04]">
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        <span class="text-sm text-blue-400">Crear "{{ ingredientQuery() }}" como nuevo</span>
                      </button>
                    }
                  </div>
                }

                <!-- Inline create ingredient form -->
                @if (showCreateIngredient()) {
                  <div class="bg-mm-card border border-blue-500/30 rounded-xl p-4 mb-3">
                    <p class="text-xs font-semibold text-blue-400 mb-3">Nuevo ingrediente</p>

                    <!-- Duplicate suggestions -->
                    @if (ingredientSuggestions().length > 0) {
                      <div class="mb-3 p-3 bg-yellow-400/[0.06] border border-yellow-400/20 rounded-lg">
                        <p class="text-xs text-yellow-400 mb-2">¿Quisiste decir alguno de estos?</p>
                        @for (s of ingredientSuggestions(); track s.id) {
                          <button type="button"
                                  (click)="selectIngredient(s)"
                                  class="block w-full text-left text-xs text-mm-text1 py-1
                                         hover:text-blue-400 transition-colors">
                            {{ s.name }} ({{ s.unit }})
                          </button>
                        }
                        <button type="button" (click)="forceCreateIngredient()"
                                class="text-xs text-mm-text3 mt-2 hover:text-mm-text2 transition-colors">
                          Crear igualmente →
                        </button>
                      </div>
                    }

                    <div class="flex gap-2 mb-3">
                      <div class="flex-1">
                        <label class="block text-xs text-mm-text3 mb-1">Nombre</label>
                        <input type="text"
                               [value]="createIngredientName()"
                               (input)="createIngredientName.set($any($event.target).value)"
                               class="w-full px-3 py-2 rounded-lg border border-white/[0.06]
                                      bg-mm-elevated text-mm-text1 text-sm outline-none
                                      focus:border-blue-500 transition-colors" />
                      </div>
                      <div class="w-24">
                        <label class="block text-xs text-mm-text3 mb-1">Unidad</label>
                        <input type="text"
                               [value]="createIngredientUnit()"
                               (input)="createIngredientUnit.set($any($event.target).value)"
                               placeholder="g"
                               list="unit-list"
                               class="w-full px-3 py-2 rounded-lg border border-white/[0.06]
                                      bg-mm-elevated text-mm-text1 text-sm outline-none
                                      focus:border-blue-500 transition-colors" />
                        <datalist id="unit-list">
                          <option value="g"></option><option value="kg"></option>
                          <option value="ml"></option><option value="l"></option>
                          <option value="unidades"></option><option value="piezas"></option>
                        </datalist>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" (click)="cancelCreateIngredient()"
                              class="flex-1 py-2 rounded-lg border border-white/[0.06]
                                     text-mm-text2 text-xs hover:text-mm-text1 transition-colors">
                        Cancelar
                      </button>
                      <button type="button" (click)="createIngredient()"
                              [disabled]="creatingIngredient()"
                              class="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400
                                     text-xs font-medium hover:bg-blue-500/30 transition-colors
                                     disabled:opacity-50">
                        {{ creatingIngredient() ? 'Creando...' : 'Añadir' }}
                      </button>
                    </div>
                  </div>
                }

                <!-- Pending ingredients list -->
                @if (pendingIngredients().length > 0) {
                  <div class="space-y-2">
                    @for (pi of pendingIngredients(); track pi.ingredient.id) {
                      <div class="flex items-center gap-2 bg-mm-card border border-white/[0.06]
                                  rounded-lg px-3 py-2">
                        <span class="flex-1 text-sm text-mm-text1 truncate">{{ pi.ingredient.name }}</span>
                        <input type="number" min="0.001" step="any"
                               [value]="pi.quantity"
                               (change)="updatePendingQty($index, $any($event.target).value)"
                               class="w-16 px-2 py-1 rounded-lg border border-white/[0.06]
                                      bg-mm-elevated text-mm-text1 text-xs text-center
                                      outline-none focus:border-blue-500 transition-colors" />
                        <span class="text-xs text-mm-text3 w-8">{{ pi.ingredient.unit }}</span>
                        <button type="button" (click)="removePendingIngredient($index)"
                                class="text-mm-text3 hover:text-red-400 transition-colors p-1">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Error -->
              @if (saveError()) {
                <p class="text-red-400 text-sm mb-4 bg-red-400/10 px-4 py-2.5 rounded-lg">
                  {{ saveError() }}
                </p>
              }

              <!-- Actions -->
              <div class="flex gap-3">
                <button type="button" (click)="closeModal()"
                        class="flex-1 py-3 rounded-[10px] border border-white/[0.06]
                               text-mm-text2 hover:text-mm-text1 hover:border-white/10
                               transition-colors text-[15px] font-medium">
                  Cancelar
                </button>
                <button type="submit" [disabled]="saving()"
                        class="flex-1 btn-primary py-3 text-[15px]
                               disabled:opacity-60 disabled:cursor-not-allowed
                               disabled:translate-y-0 disabled:shadow-none">
                  {{ saving() ? 'Guardando...' : editingRecipe() ? 'Guardar cambios' : 'Crear receta' }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class RecipesComponent implements OnInit, OnDestroy {
  private readonly recipesService = inject(RecipesService);
  private readonly ingredientsService = inject(IngredientsService);
  private readonly pantryService = inject(PantryService);
  private readonly fb = inject(FormBuilder);

  // ── State ──────────────────────────────────────────────────
  recipes = signal<Recipe[]>([]);
  pantryItems = signal<PantryItem[]>([]);
  loading = signal(true);
  expandedId = signal<string | null>(null);

  // Filters
  searchQuery   = signal('');
  onlyAvailable = signal(false);

  // Modal
  showModal = signal(false);
  saving = signal(false);
  saveError = signal('');
  editingRecipe = signal<Recipe | null>(null);
  detailRecipe = signal<Recipe | null>(null);

  // Ingredient search
  ingredientQuery = signal('');
  ingredientResults = signal<IngredientResult[]>([]);
  showResults = signal(false);
  searchLoading = signal(false);
  pendingIngredients = signal<PendingIngredient[]>([]);

  // Create ingredient inline
  showCreateIngredient = signal(false);
  createIngredientName = signal('');
  createIngredientUnit = signal('');
  ingredientSuggestions = signal<IngredientResult[]>([]);
  creatingIngredient = signal(false);

  // ── Form ───────────────────────────────────────────────────
  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    prepTime:    [null as number | null, [Validators.required, Validators.min(1)]],
    servings:    [null as number | null, [Validators.required, Validators.min(1)]],
    steps:       this.fb.array([this.fb.control('', Validators.required)]),
  });

  private get stepsArray(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  get stepControls(): FormControl[] {
    return this.stepsArray.controls as FormControl[];
  }

  // ── Computed ───────────────────────────────────────────────
  pantryMap = computed(() => {
    const map = new Map<string, PantryItem>();
    for (const item of this.pantryItems()) {
      if (item.ingredientId) map.set(item.ingredientId, item);
    }
    return map;
  });

  isFiltering = computed(() => !!this.searchQuery().trim() || this.onlyAvailable());

  filteredRecipes = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const onlyAvail = this.onlyAvailable();
    return this.recipes().filter(recipe => {
      if (q && !recipe.name.toLowerCase().includes(q)) return false;
      if (onlyAvail && this.overallStatus(recipe) !== 'available') return false;
      return true;
    });
  });

  // ── Lifecycle ──────────────────────────────────────────────
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  // ── Data loading ───────────────────────────────────────────
  private loadAll(): void {
    this.recipesService.getAll().subscribe({
      next: (r) => { this.recipes.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.pantryService.getAll().subscribe({
      next: (items) => this.pantryItems.set(items),
    });
  }

  // ── Card helpers ───────────────────────────────────────────
  toggleExpand(id: string): void {
    this.expandedId.update(current => (current === id ? null : id));
  }

  ingredientStatus(ingredientId: string): AvailabilityStatus {
    const item = this.pantryMap().get(ingredientId);
    if (!item) return 'missing';
    return item.quantity > 0 ? 'available' : 'depleted';
  }

  overallStatus(recipe: Recipe): AvailabilityStatus | 'none' {
    if (recipe.recipeIngredients.length === 0) return 'none';
    const statuses = recipe.recipeIngredients.map(ri => this.ingredientStatus(ri.ingredientId));
    if (statuses.every(s => s === 'available')) return 'available';
    if (statuses.some(s => s === 'missing')) return 'missing';
    return 'depleted';
  }

  cardBorderClass(recipe: Recipe): string {
    const s = this.overallStatus(recipe);
    if (s === 'available') return 'border-green-500/30 hover:border-green-500/50';
    if (s === 'depleted')  return 'border-yellow-500/30 hover:border-yellow-500/50';
    if (s === 'missing')   return 'border-red-500/20 hover:border-red-500/30';
    return 'border-white/[0.06] hover:border-white/10';
  }

  accentBarClass(recipe: Recipe): string {
    const s = this.overallStatus(recipe);
    if (s === 'available') return 'bg-green-500/60';
    if (s === 'depleted')  return 'bg-yellow-500/60';
    if (s === 'missing')   return 'bg-red-500/40';
    return 'bg-white/[0.04]';
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.onlyAvailable.set(false);
  }

  openDetail(recipe: Recipe): void {
    this.expandedId.set(null);
    this.detailRecipe.set(recipe);
  }

  closeDetail(): void {
    this.detailRecipe.set(null);
  }

  detailStatusForDot(recipe: Recipe): AvailabilityStatus {
    const s = this.overallStatus(recipe);
    return s === 'none' ? 'missing' : s;
  }

  overallStatusLabel(recipe: Recipe): string {
    const s = this.overallStatus(recipe);
    if (s === 'available') return 'Listo para cocinar';
    if (s === 'depleted')  return 'Ingredientes agotados';
    if (s === 'missing')   return 'Faltan ingredientes';
    return 'Sin ingredientes vinculados';
  }

  overallStatusTextClass(recipe: Recipe): string {
    const s = this.overallStatus(recipe);
    if (s === 'available') return 'text-green-400';
    if (s === 'depleted')  return 'text-yellow-400';
    if (s === 'missing')   return 'text-red-400';
    return 'text-mm-text3';
  }

  cardGradientStyle(recipe: Recipe): string {
    const s = this.overallStatus(recipe);
    if (s === 'available') return 'background: linear-gradient(135deg, #0f1e28 0%, #0d2018 100%)';
    if (s === 'depleted')  return 'background: linear-gradient(135deg, #1a1a0a 0%, #1e1a06 100%)';
    if (s === 'missing')   return 'background: linear-gradient(135deg, #1e0f0f 0%, #200c0c 100%)';
    return 'background: linear-gradient(135deg, #0f1628 0%, #131a2e 100%)';
  }

  dotClass(status: AvailabilityStatus): string {
    if (status === 'available') return 'bg-green-400';
    if (status === 'depleted')  return 'bg-yellow-400';
    return 'bg-red-400';
  }

  statusLabelClass(status: AvailabilityStatus): string {
    if (status === 'available') return 'text-green-400';
    if (status === 'depleted')  return 'text-yellow-400';
    return 'text-red-400';
  }

  statusLabel(ingredientId: string): string {
    const item = this.pantryMap().get(ingredientId);
    if (!item) return 'No en despensa';
    if (item.quantity === 0) return 'Agotado';
    return `${item.quantity} ${item.unit}`;
  }

  availableSummary(recipe: Recipe): string {
    if (recipe.recipeIngredients.length === 0) return '';
    const avail = recipe.recipeIngredients.filter(
      ri => this.ingredientStatus(ri.ingredientId) === 'available'
    ).length;
    return `${avail}/${recipe.recipeIngredients.length} en despensa`;
  }

  // ── Modal ──────────────────────────────────────────────────
  openModal(): void {
    this.editingRecipe.set(null);
    while (this.stepsArray.length > 1) this.stepsArray.removeAt(this.stepsArray.length - 1);
    this.stepsArray.at(0).reset('');
    this.form.reset({ name: '', description: '', prepTime: null, servings: null });
    this.pendingIngredients.set([]);
    this.ingredientQuery.set('');
    this.ingredientResults.set([]);
    this.showResults.set(false);
    this.showCreateIngredient.set(false);
    this.ingredientSuggestions.set([]);
    this.saveError.set('');
    this.showModal.set(true);
  }

  openEditModal(recipe: Recipe): void {
    this.detailRecipe.set(null);
    this.editingRecipe.set(recipe);
    this.form.reset({
      name: recipe.name,
      description: recipe.description ?? '',
      prepTime: recipe.prepTime,
      servings: recipe.servings,
    });
    while (this.stepsArray.length > 0) this.stepsArray.removeAt(0);
    const steps = recipe.steps.length > 0 ? recipe.steps : [''];
    for (const step of steps) {
      this.stepsArray.push(this.fb.control(step, Validators.required));
    }
    this.pendingIngredients.set(
      recipe.recipeIngredients.map(ri => ({ ingredient: ri.ingredient as IngredientResult, quantity: ri.quantity }))
    );
    this.ingredientQuery.set('');
    this.ingredientResults.set([]);
    this.showResults.set(false);
    this.showCreateIngredient.set(false);
    this.ingredientSuggestions.set([]);
    this.saveError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRecipe.set(null);
  }

  addStep(): void {
    this.stepsArray.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number): void {
    this.stepsArray.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const { name, description, prepTime, servings, steps } = this.form.value;
    const pending = this.pendingIngredients();
    const editing = this.editingRecipe();

    if (editing) {
      const dto = {
        name: name!,
        prepTime: prepTime!,
        servings: servings!,
        steps: (steps as string[]).filter(s => s?.trim()),
        ...(description ? { description } : { description: undefined }),
      };

      const origMap = new Map(editing.recipeIngredients.map(ri => [ri.ingredientId, ri]));
      const pendingMap = new Map(pending.map(p => [p.ingredient.id, p]));

      // Remove ingredients deleted or with changed quantity (will be re-added)
      const toRemove = editing.recipeIngredients.filter(ri => {
        const p = pendingMap.get(ri.ingredientId);
        return !p || p.quantity !== ri.quantity;
      });
      // Add ingredients that are new or whose quantity changed
      const toAdd = pending.filter(p => {
        const orig = origMap.get(p.ingredient.id);
        return !orig || orig.quantity !== p.quantity;
      });

      this.recipesService.update(editing.id, dto).pipe(
        switchMap(() => toRemove.length
          ? forkJoin(toRemove.map(ri => this.recipesService.removeIngredient(editing.id, ri.ingredientId)))
          : of(null)),
        switchMap(() => toAdd.length
          ? forkJoin(toAdd.map(p => this.recipesService.addIngredient(editing.id, { ingredientId: p.ingredient.id, quantity: p.quantity })))
          : of(null)),
        switchMap(() => this.recipesService.getAll()),
      ).subscribe({
        next: recipes => {
          this.recipes.set(recipes as Recipe[]);
          this.saving.set(false);
          this.closeModal();
        },
        error: err => {
          this.saveError.set(err.error?.message ?? 'No se pudo guardar la receta');
          this.saving.set(false);
        },
      });
      return;
    }

    const dto = {
      name: name!,
      prepTime: prepTime!,
      servings: servings!,
      steps: (steps as string[]).filter(s => s?.trim()),
      ...(description ? { description } : {}),
    };

    this.recipesService.create(dto).pipe(
      switchMap(recipe => {
        if (pending.length === 0) return of(recipe);
        return forkJoin(
          pending.map(p => this.recipesService.addIngredient(recipe.id, {
            ingredientId: p.ingredient.id,
            quantity: p.quantity,
          }))
        ).pipe(switchMap(() => this.recipesService.getAll()));
      })
    ).subscribe({
      next: (result) => {
        if (Array.isArray(result)) {
          this.recipes.set(result as Recipe[]);
        } else {
          this.recipes.update(list => [result as Recipe, ...list]);
        }
        this.saving.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.saveError.set(err.error?.message ?? 'No se pudo guardar la receta');
        this.saving.set(false);
      },
    });
  }

  deleteRecipe(id: string): void {
    this.recipesService.remove(id).subscribe({
      next: () => this.recipes.update(list => list.filter(r => r.id !== id)),
    });
  }

  // ── Ingredient search ─────────────────────────────────────
  onSearchInput(value: string): void {
    this.ingredientQuery.set(value);
    this.ingredientSuggestions.set([]);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (value.length < 2) {
      this.ingredientResults.set([]);
      this.showResults.set(false);
      return;
    }
    this.showResults.set(true);
    this.searchLoading.set(true);
    this.searchTimer = setTimeout(() => {
      this.ingredientsService.search(value).subscribe({
        next: results => { this.ingredientResults.set(results); this.searchLoading.set(false); },
        error: () => { this.ingredientResults.set([]); this.searchLoading.set(false); },
      });
    }, 300);
  }

  clearSearch(): void {
    this.ingredientQuery.set('');
    this.ingredientResults.set([]);
    this.showResults.set(false);
  }

  selectIngredient(result: IngredientResult): void {
    const already = this.pendingIngredients().some(p => p.ingredient.id === result.id);
    if (!already) {
      this.pendingIngredients.update(list => [...list, { ingredient: result, quantity: 1 }]);
    }
    this.clearSearch();
    this.showCreateIngredient.set(false);
    this.ingredientSuggestions.set([]);
  }

  removePendingIngredient(index: number): void {
    this.pendingIngredients.update(list => list.filter((_, i) => i !== index));
  }

  updatePendingQty(index: number, value: string): void {
    const qty = parseFloat(value);
    if (!isNaN(qty) && qty > 0) {
      this.pendingIngredients.update(list =>
        list.map((p, i) => i === index ? { ...p, quantity: qty } : p)
      );
    }
  }

  // ── Create ingredient ─────────────────────────────────────
  openCreateIngredient(): void {
    this.createIngredientName.set(this.ingredientQuery());
    this.createIngredientUnit.set('g');
    this.showResults.set(false);
    this.showCreateIngredient.set(true);
    this.ingredientSuggestions.set([]);
  }

  cancelCreateIngredient(): void {
    this.showCreateIngredient.set(false);
    this.ingredientSuggestions.set([]);
  }

  createIngredient(): void {
    const name = this.createIngredientName().trim();
    const unit = this.createIngredientUnit().trim();
    if (!name || !unit) return;
    this.creatingIngredient.set(true);
    this.ingredientSuggestions.set([]);

    this.ingredientsService.create({ name, unit }).subscribe({
      next: (ingredient) => {
        this.selectIngredient(ingredient);
        this.creatingIngredient.set(false);
        this.showCreateIngredient.set(false);
      },
      error: (err) => {
        this.creatingIngredient.set(false);
        if (err.status === 409) {
          if (err.error?.existing) {
            this.selectIngredient(err.error.existing);
            this.showCreateIngredient.set(false);
          } else if (err.error?.suggestions?.length) {
            this.ingredientSuggestions.set(err.error.suggestions);
          }
        }
      },
    });
  }

  forceCreateIngredient(): void {
    const name = this.createIngredientName().trim();
    const unit = this.createIngredientUnit().trim();
    if (!name || !unit) return;
    this.creatingIngredient.set(true);
    this.ingredientSuggestions.set([]);

    this.ingredientsService.create({ name, unit, force: true }).subscribe({
      next: (ingredient) => {
        this.selectIngredient(ingredient);
        this.creatingIngredient.set(false);
        this.showCreateIngredient.set(false);
      },
      error: () => { this.creatingIngredient.set(false); },
    });
  }
}
