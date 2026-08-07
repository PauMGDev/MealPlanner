import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { type PantryItem, PantryService } from '../../core/services/pantry.service';
import { type Recipe, RecipesService } from '../../core/services/recipes.service';
import { type RecipeAvailability, computeAvailability } from './recipes.types';
import { RecipeFiltersComponent } from './components/recipe-filters.component';
import { RecipeCardComponent } from './components/recipe-card.component';
import { RecipeDetailModalComponent } from './components/recipe-detail-modal.component';
import { RecipeFormModalComponent } from './components/recipe-form-modal.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeFiltersComponent, RecipeCardComponent, RecipeDetailModalComponent, RecipeFormModalComponent, SkeletonComponent],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css',
})
export class RecipesComponent implements OnInit {
  private readonly recipesService = inject(RecipesService);
  private readonly pantryService = inject(PantryService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  recipes = signal<Recipe[]>([]);
  pantryItems = signal<PantryItem[]>([]);
  loading = signal(true);
  expandedId = signal<string | null>(null);
  searchQuery = signal('');
  onlyAvailable = signal(false);
  showFormModal = signal(false);
  editingRecipe = signal<Recipe | null>(null);
  detailRecipe = signal<Recipe | null>(null);
  deleteError = signal('');

  pantryMap = computed(() => {
    const map = new Map<string, PantryItem>();
    for (const item of this.pantryItems()) {
      if (item.ingredientId) map.set(item.ingredientId, item);
    }
    return map;
  });

  isFiltering = computed(() => !!this.searchQuery().trim() || this.onlyAvailable());

  recipeAvailabilities = computed((): Map<string, RecipeAvailability> => {
    const map = this.pantryMap();
    const result = new Map<string, RecipeAvailability>();
    for (const recipe of this.recipes()) result.set(recipe.id, computeAvailability(recipe, map));
    return result;
  });

  filteredRecipes = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const onlyAvail = this.onlyAvailable();
    return this.recipes().filter(recipe => {
      if (q && !recipe.name.toLowerCase().includes(q)) return false;
      if (onlyAvail && this.recipeAvailabilities().get(recipe.id)?.status !== 'available') return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadAll();
    // Reacts to later navigations too: the router reuses this component when only
    // the query param changes, so ngOnInit alone would miss the second click.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.openRequestedRecipe(params.get('recipe')));
  }

  private loadAll(): void {
    this.loading.set(true);
    forkJoin({
      recipes: this.recipesService.getAll().pipe(catchError(() => of([] as Recipe[]))),
      pantryItems: this.pantryService.getAll().pipe(catchError(() => of([] as PantryItem[]))),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ recipes, pantryItems }) => {
      this.recipes.set(recipes);
      this.pantryItems.set(pantryItems);
      this.loading.set(false);
      this.openRequestedRecipe(this.route.snapshot.queryParamMap.get('recipe'));
    });
  }

  /** `?recipe=<id>` opens that recipe straight away: the dashboard links here. */
  private openRequestedRecipe(id: string | null): void {
    if (!id) return;
    const recipe = this.recipes().find(r => r.id === id);
    if (recipe) this.detailRecipe.set(recipe);
  }

  getAvailability(recipeId: string): RecipeAvailability {
    return this.recipeAvailabilities().get(recipeId) ?? { status: 'none', availableSummary: '', ingredientStatuses: new Map() };
  }

  deleteRecipe(id: string): void {
    this.recipesService.remove(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.recipes.update(list => list.filter(r => r.id !== id)),
      error: () => this.deleteError.set('No se pudo eliminar la receta. Inténtalo de nuevo.'),
    });
  }

  clearFilters(): void { this.searchQuery.set(''); this.onlyAvailable.set(false); }
  toggleExpand(id: string): void { this.expandedId.update(curr => curr === id ? null : id); }
  openModal(): void { this.editingRecipe.set(null); this.showFormModal.set(true); }
  closeModal(): void { this.showFormModal.set(false); this.editingRecipe.set(null); }
  openEditModal(recipe: Recipe): void { this.detailRecipe.set(null); this.editingRecipe.set(recipe); this.showFormModal.set(true); }
  openDetail(recipe: Recipe): void { this.expandedId.set(null); this.detailRecipe.set(recipe); }
  closeDetail(): void { this.detailRecipe.set(null); }
  onRecipeSaved(): void { this.loadAll(); this.closeModal(); }
}
