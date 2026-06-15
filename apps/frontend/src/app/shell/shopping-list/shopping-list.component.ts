import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { type IngredientResult } from '../../core/services/ingredients.service';
import { type ShoppingListItem, type ShoppingListSuggestion, ShoppingListService } from '../../core/services/shopping-list.service';
import { IngredientSearchComponent } from '../recipes/components/ingredient-search.component';
import { ShoppingListRowComponent } from './components/shopping-list-row.component';
import { ShoppingListSuggestionsComponent } from './components/shopping-list-suggestions.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IngredientSearchComponent, ShoppingListRowComponent, ShoppingListSuggestionsComponent, SkeletonComponent],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.css',
})
export class ShoppingListComponent implements OnInit {
  private readonly shoppingListService = inject(ShoppingListService);
  private readonly destroyRef = inject(DestroyRef);

  items = signal<ShoppingListItem[]>([]);
  suggestions = signal<ShoppingListSuggestion[]>([]);
  loading = signal(true);
  error = signal('');
  adding = signal(false);

  pendingItems = computed(() => this.items().filter(i => !i.checked));
  checkedItems = computed(() => this.items().filter(i => i.checked));
  alreadySelectedIds = computed(() =>
    this.items().map(i => i.ingredientId).filter((id): id is string => !!id));

  ngOnInit(): void {
    forkJoin({
      items: this.shoppingListService.getAll().pipe(
        catchError(() => { this.error.set('No se pudo cargar la lista de la compra.'); return of([]); })),
      suggestions: this.shoppingListService.getSuggestions().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ items, suggestions }) => {
        this.items.set(items);
        this.suggestions.set(suggestions);
        this.loading.set(false);
      });
  }

  addSuggestion(suggestion: ShoppingListSuggestion): void {
    this.shoppingListService.create({ name: suggestion.name, unit: suggestion.unit, ingredientId: suggestion.ingredientId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: item => {
          this.items.update(l => [...l, item]);
          this.suggestions.update(s => s.filter(x => x.ingredientId !== suggestion.ingredientId));
        },
        error: () => this.error.set('No se pudo añadir el ingrediente. Inténtalo de nuevo.'),
      });
  }

  onIngredientSelected(result: IngredientResult): void {
    this.error.set('');
    this.adding.set(true);
    this.shoppingListService.create({ name: result.name, unit: result.unit, ingredientId: result.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: item => { this.items.update(l => [...l, item]); this.adding.set(false); },
        error: () => { this.error.set('No se pudo añadir el ingrediente. Inténtalo de nuevo.'); this.adding.set(false); },
      });
  }

  toggleChecked(id: string): void {
    const item = this.items().find(i => i.id === id);
    if (!item) return;
    this.shoppingListService.update(id, { checked: !item.checked })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => this.items.update(l => l.map(i => i.id === updated.id ? updated : i)),
        error: () => this.error.set('No se pudo actualizar el elemento.'),
      });
  }

  updateQuantity(event: { id: string; quantity: number }): void {
    this.shoppingListService.update(event.id, { quantity: event.quantity })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => this.items.update(l => l.map(i => i.id === updated.id ? updated : i)),
        error: () => this.error.set('No se pudo actualizar la cantidad.'),
      });
  }

  removeItem(id: string): void {
    this.shoppingListService.remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.items.update(l => l.filter(i => i.id !== id)),
        error: () => this.error.set('No se pudo eliminar el elemento.'),
      });
  }

  clearChecked(): void {
    this.shoppingListService.clearChecked()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.items.update(l => l.filter(i => !i.checked)),
        error: () => this.error.set('No se pudieron vaciar los elementos marcados.'),
      });
  }
}
