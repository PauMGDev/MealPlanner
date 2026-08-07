import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { type IngredientResult, IngredientsService } from '../../core/services/ingredients.service';
import { type IngredientCategory, type PantryItem, PantryService } from '../../core/services/pantry.service';
import { type DisplayItem, type PantryItemSaveIntent, buildGroupedItems, buildMergedItems, expiryBadgeOf, getExpiryMs } from './pantry.types';
import { PantryFiltersComponent } from './components/pantry-filters.component';
import { PantryGroupComponent } from './components/pantry-group.component';
import { PantryDepletedComponent } from './components/pantry-depleted.component';
import { PantryItemModalComponent } from './components/pantry-item-modal.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-pantry',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PantryFiltersComponent, PantryGroupComponent, PantryDepletedComponent, PantryItemModalComponent, SkeletonComponent],
  templateUrl: './pantry.component.html',
  styleUrl: './pantry.component.css',
})
export class PantryComponent implements OnInit {
  private readonly pantryService = inject(PantryService);
  private readonly ingredientsService = inject(IngredientsService);
  private readonly destroyRef = inject(DestroyRef);

  items = signal<PantryItem[]>([]);
  categories = signal<IngredientCategory[]>([]);
  catalog = signal<IngredientResult[]>([]);
  loading = signal(true);

  searchQuery = signal('');
  collapsedGroups = signal<Set<string>>(new Set());
  expiryFilter = signal<'soon' | 'expired' | null>(null);
  categoryFilter = signal<string | null>(null);
  sortOrder = signal<'name' | 'expiry' | 'quantity'>('name');

  showModal = signal(false);
  editingItem = signal<DisplayItem | null>(null);
  preselectedIngredient = signal<IngredientResult | null>(null);
  pantryError = signal('');

  modalSaving = signal(false);
  modalSaveError = signal('');
  modalCatalogResults = signal<IngredientResult[]>([]);

  mergedItems = computed(() => buildMergedItems(this.items(), this.catalog()));
  inStockCount = computed(() => this.mergedItems().filter(i => i.quantity > 0).length);
  depletedCount = computed(() => this.mergedItems().filter(i => i.quantity === 0).length);
  isFiltering = computed(() => !!this.searchQuery().trim() || !!this.expiryFilter() || !!this.categoryFilter());

  private groupedItems = computed(() => buildGroupedItems(this.mergedItems()));
  private inStockGroups = computed(() => this.groupedItems().filter(g => !g.isDepleted));
  private depletedGroup = computed(() => this.groupedItems().find(g => g.isDepleted) ?? null);


  filteredInStockGroups = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const expiry = this.expiryFilter();
    const catFilter = this.categoryFilter();
    const sort = this.sortOrder();
    return this.inStockGroups()
      .filter(g => !catFilter || g.id === catFilter)
      .map(g => ({
        ...g, items: g.items.filter(item => {
          if (q && !item.name.toLowerCase().includes(q)) return false;
          if (expiry) {
            const b = item.virtual ? null : expiryBadgeOf(item as PantryItem);
            if (b?.level !== expiry) return false;
          }
          return true;
        }).sort((a, b) => {
          if (sort === 'name') return a.name.localeCompare(b.name, 'es');
          if (sort === 'quantity') return b.quantity - a.quantity;
          const [ma, mb] = [a, b].map(x => x.virtual ? null : getExpiryMs(x as PantryItem));
          if (ma === null && mb === null) return 0;
          return ma === null ? 1 : mb === null ? -1 : ma - mb;
        }),
      }))
      .filter(g => g.items.length > 0);
  });

  filteredDepletedGroup = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const dep = this.depletedGroup();
    if (!dep || !q) return dep;
    const items = dep.items.filter(i => i.name.toLowerCase().includes(q));
    return items.length ? { ...dep, items } : null;
  });

  filteredInStockCount = computed(() => this.filteredInStockGroups().reduce((s, g) => s + g.items.length, 0));

  noResultsMessage = computed(() => {
    const q = this.searchQuery().trim();
    const expiry = this.expiryFilter();
    if (q) return `No se encontró "${q}"`;
    if (expiry === 'expired') return 'No hay ingredientes caducados en stock';
    if (expiry === 'soon') return 'No hay ingredientes con caducidad próxima';
    const cat = this.categories().find(c => c.id === this.categoryFilter());
    return cat ? `No hay ingredientes en "${cat.name}"` : 'Ningún ingrediente coincide con los filtros activos';
  });

  ngOnInit(): void {
    this.pantryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => this.categories.set(cats));
    this.ingredientsService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ings => this.catalog.set(ings));
    this.pantryService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: items => { this.items.set(items); this.loading.set(false); }, error: () => this.loading.set(false) });
  }


  isGroupCollapsed(id: string): boolean { return !this.isFiltering() && this.collapsedGroups().has(id); }

  toggleGroup(id: string): void {
    this.collapsedGroups.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  clearFilters(): void { this.searchQuery.set(''); this.expiryFilter.set(null); this.categoryFilter.set(null); }

  handleRowClick(item: DisplayItem): void {
    if (item.virtual) this.openAddModal({ id: item.ingredientId!, name: item.name, unit: item.unit, caloriesPer100g: null });
    else this.openEditModal(item);
  }

  setDepleted(item: DisplayItem): void {
    if (item.virtual) return;
    this.pantryService.update(item.id, { quantity: 0, categoryId: null, expiresAt: null }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: u => this.items.update(l => l.map(i => i.id === u.id ? u : i)),
      error: () => this.pantryError.set('No se pudo actualizar el ingrediente. Inténtalo de nuevo.'),
    });
  }

  deleteItem(item: DisplayItem): void {
    this.pantryError.set('');
    if (item.virtual) {
      if (!confirm(`¿Eliminar "${item.name}" del catálogo de ingredientes? Esta acción es permanente.`)) return;
      this.ingredientsService.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.catalog.update(l => l.filter(i => i.id !== item.id)),
        error: e => this.pantryError.set(e.error?.message ?? 'No se puede eliminar este ingrediente'),
      });
    } else {
      this.pantryService.remove(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.items.update(l => l.filter(i => i.id !== item.id)),
        error: () => this.pantryError.set('No se pudo eliminar el ingrediente. Inténtalo de nuevo.'),
      });
    }
  }

  openAddModal(ing?: IngredientResult | null): void {
    this.editingItem.set(null); this.preselectedIngredient.set(ing ?? null);
    this.modalSaveError.set(''); this.modalCatalogResults.set([]);
    this.showModal.set(true);
  }

  openEditModal(item: DisplayItem): void {
    this.editingItem.set(item); this.preselectedIngredient.set(null);
    this.modalSaveError.set(''); this.modalCatalogResults.set([]);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  onModalSearch(query: string): void {
    this.ingredientsService.search(query).pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(results => this.modalCatalogResults.set(results));
  }

  onModalSave(intent: PantryItemSaveIntent): void {
    this.modalSaving.set(true);
    this.modalSaveError.set('');
    const request = intent.kind === 'update'
      ? this.pantryService.update(intent.id, intent.dto)
      : this.pantryService.create(intent.dto);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: item => { this.modalSaving.set(false); this.onItemSaved(item); },
      error: e => { this.modalSaving.set(false); this.modalSaveError.set(e.error?.message ?? 'Error al guardar'); },
    });
  }

  private onItemSaved(item: PantryItem): void {
    const exists = this.items().some(i => i.id === item.id);
    if (exists) {
      this.items.update(l => l.map(i => i.id === item.id ? item : i));
    } else {
      this.items.update(l => [...l, item]);
    }
    this.closeModal();
  }
}
