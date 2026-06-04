import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientResult, IngredientsService } from '../../core/services/ingredients.service';
import { IngredientCategory, PantryItem, PantryService } from '../../core/services/pantry.service';

type DisplayItem = PantryItem & { virtual?: true };

interface PantryGroup {
  id: string;
  name: string;
  items: DisplayItem[];
  isDepleted: boolean;
}

const CAT_PALETTE = [
  '#60a5fa', '#34d399', '#f87171', '#fbbf24',
  '#a78bfa', '#fb923c', '#38bdf8', '#4ade80',
];

@Component({
  selector: 'app-pantry',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 lg:p-8">

      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-mm-text1 tracking-tight">Despensa</h1>
          <p class="text-mm-text3 text-sm mt-1">
            @if (!loading()) {
              <span class="text-mm-text2">{{ inStockCount() }}</span> en stock
              @if (depletedCount() > 0) {
                <span class="mx-1.5 text-white/20">·</span>
                <span class="text-yellow-500/80">
                  {{ depletedCount() }} agotado{{ depletedCount() !== 1 ? 's' : '' }}
                </span>
              }
            } @else { Cargando... }
          </p>
        </div>
        <button (click)="openAddModal()"
                class="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Añadir
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (i of [0,1,2,3,4,5]; track i) {
            <div>
              <div class="h-4 w-24 bg-mm-surface rounded-md mb-3 animate-pulse"></div>
              <div class="space-y-2">
                @for (j of [0,1,2]; track j) {
                  <div class="h-11 bg-mm-surface rounded-lg animate-pulse"></div>
                }
              </div>
            </div>
          }
        </div>
      }

      @else if (mergedItems().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-14 h-14 rounded-2xl bg-mm-surface border border-white/[0.06]
                      flex items-center justify-center mb-5">
            <svg class="w-6 h-6 text-mm-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
          </div>
          <p class="text-mm-text1 font-semibold mb-1.5">La despensa está vacía</p>
          <p class="text-mm-text3 text-sm mb-6 max-w-xs">
            Añade los ingredientes que tienes en casa para saber qué recetas puedes preparar.
          </p>
          <button (click)="openAddModal()" class="btn-primary px-5 py-2.5 text-sm">
            Añadir primer ingrediente
          </button>
        </div>
      }

      @else {

        <!-- ── In-stock categories: responsive grid ──────── -->
        @if (inStockGroups().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            @for (group of inStockGroups(); track group.id) {
              <section>

                <!-- Group header -->
                <div class="flex items-center gap-3 mb-3">
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                        [style.background]="categoryColor(group.id)"></span>
                  <h2 class="text-xs font-semibold uppercase tracking-widest text-mm-text3">
                    {{ group.name }}
                  </h2>
                  <div class="flex-1 h-px bg-white/[0.05]"></div>
                  <span class="text-xs text-mm-text3 tabular-nums">{{ group.items.length }}</span>
                </div>

                <!-- Item rows -->
                <div class="rounded-xl border border-white/[0.05] overflow-hidden bg-mm-surface">
                  @for (item of group.items; track item.id; let last = $last) {
                    <div class="flex items-center gap-2 px-3 py-2.5 group/row transition-colors
                                hover:bg-white/[0.03] cursor-pointer"
                         [class.border-b]="!last"
                         style="border-color: rgba(255,255,255,0.04)"
                         (click)="handleRowClick(item)">

                      <div class="w-0.5 h-4 rounded-full flex-shrink-0 opacity-60"
                           [style.background]="categoryColor(group.id)"></div>

                      <span class="flex-1 text-sm text-mm-text1 truncate min-w-0">{{ item.name }}</span>

                      <!-- Expiry badge: fixed-width slot so badges align across rows -->
                      <div class="hidden lg:flex w-28 flex-shrink-0 justify-end">
                        @if (!item.virtual && expiryBadge(item); as badge) {
                          <span class="text-xs px-1.5 py-0.5 rounded-md font-medium" [class]="badge.cls">
                            {{ badge.label }}
                          </span>
                        }
                      </div>

                      <!-- Quantity: fixed-width slot, chip right-aligned inside -->
                      <div class="w-24 flex-shrink-0 flex justify-end">
                        <span class="text-xs tabular-nums px-2 py-0.5 rounded-md
                                     border border-white/[0.06] bg-mm-card text-mm-text2">
                          {{ item.quantity }} {{ item.unit }}
                        </span>
                      </div>

                      <!-- Actions -->
                      <div class="flex items-center gap-0.5 flex-shrink-0
                                  opacity-0 group-hover/row:opacity-100 transition-opacity"
                           (click)="$event.stopPropagation()">
                        @if (!item.virtual && item.quantity > 0) {
                          <button (click)="setDepleted(item)"
                                  title="Marcar como agotado"
                                  class="p-1 rounded-md text-mm-text3 transition-colors
                                         hover:text-yellow-400 hover:bg-yellow-400/10">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/>
                            </svg>
                          </button>
                        }
                        <button (click)="deleteItem(item)"
                                title="Eliminar"
                                class="p-1 rounded-md text-mm-text3 transition-colors
                                       hover:text-red-400 hover:bg-red-400/10">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        }

        <!-- ── Agotados: siempre al fondo, ancho completo ── -->
        @if (depletedGroup(); as depleted) {
          <div class="mt-8 pt-6 border-t border-white/[0.05]">

            <div class="flex items-center gap-3 mb-4">
              <span class="w-2 h-2 rounded-full bg-yellow-600/70 flex-shrink-0"></span>
              <h2 class="text-xs font-semibold uppercase tracking-widest text-yellow-500/60">
                Agotados
              </h2>
              <div class="flex-1 h-px bg-white/[0.05]"></div>
              <span class="text-xs text-mm-text3 tabular-nums">{{ depleted.items.length }}</span>
            </div>

            <!-- Chips: compact, horizontal wrap, full width -->
            <div class="flex flex-wrap gap-2">
              @for (item of depleted.items; track item.id) {
                <div class="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-xl
                            bg-mm-surface border border-white/[0.05]
                            group/chip cursor-pointer
                            hover:border-white/10 hover:bg-white/[0.02]
                            transition-all opacity-60 hover:opacity-90"
                     (click)="handleRowClick(item)">

                  <div class="w-0.5 h-3.5 rounded-full bg-yellow-600/60 flex-shrink-0"></div>

                  <span class="text-sm text-mm-text2 group-hover/chip:text-mm-text1
                               transition-colors whitespace-nowrap">
                    {{ item.name }}
                  </span>

                  <span class="text-xs text-mm-text3 tabular-nums">
                    {{ item.unit }}
                  </span>

                  <!-- Delete on hover -->
                  <button (click)="$event.stopPropagation(); deleteItem(item)"
                          title="Eliminar"
                          class="p-0.5 rounded-md text-mm-text3 transition-colors
                                 opacity-0 group-hover/chip:opacity-100
                                 hover:text-red-400 hover:bg-red-400/10 ml-0.5">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>
        }

      }
    </div>

    <!-- ── Modal ──────────────────────────────────────────── -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                  flex items-end sm:items-center justify-center p-0 sm:p-4"
           (click)="closeModal()">

        <div class="bg-mm-surface border border-white/[0.07] sm:rounded-2xl rounded-t-2xl
                    w-full sm:max-w-md shadow-2xl max-h-[92vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between px-6 pt-6 pb-0 flex-shrink-0">
            <h2 class="text-lg font-bold text-mm-text1">
              {{ editMode() ? 'Editar ingrediente' : 'Añadir ingrediente' }}
            </h2>
            <button (click)="closeModal()"
                    class="p-1.5 rounded-xl text-mm-text3 hover:text-mm-text1
                           hover:bg-white/[0.04] transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 px-6 pt-5 pb-6">
            <form [formGroup]="form" (ngSubmit)="submit()">

              <!-- Name -->
              <div class="mb-4">
                <label class="block text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">
                  Ingrediente
                </label>

                <input
                  type="text"
                  [value]="ingredientName()"
                  (input)="onNameInput($any($event.target).value)"
                  (focus)="!editMode() && showDropdown.set(true)"
                  (blur)="onNameBlur()"
                  placeholder="Buscar o escribir nombre…"
                  class="w-full px-4 py-3 rounded-xl border bg-mm-card text-mm-text1 text-sm
                         outline-none transition-colors placeholder:text-mm-text3
                         border-white/[0.06] focus:border-blue-500" />

                @if (selectedCatalog() && !editMode()) {
                  <p class="text-[11px] text-blue-400/60 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    Vinculado al catálogo
                  </p>
                }

                @if (!editMode() && showDropdown() && catalogResults().length > 0) {
                  <div class="mt-1 bg-mm-card border border-white/[0.07] rounded-xl
                              overflow-hidden shadow-xl">
                    @for (r of catalogResults(); track r.id) {
                      <button type="button"
                              (mousedown)="selectCatalog(r)"
                              class="w-full flex items-center justify-between px-4 py-2.5
                                     hover:bg-white/[0.04] text-left transition-colors
                                     border-b border-white/[0.04] last:border-0">
                        <span class="text-sm text-mm-text1">{{ r.name }}</span>
                        <span class="text-xs text-mm-text3 ml-3 flex-shrink-0">{{ r.unit }}</span>
                      </button>
                    }
                  </div>
                }

                @if (nameTouched() && !ingredientName().trim()) {
                  <p class="text-red-400 text-xs mt-1.5">El nombre es obligatorio</p>
                }

                @if (!editMode() && existingMatch(); as match) {
                  <div class="flex items-center gap-1.5 mt-2 px-3 py-2 rounded-lg
                              bg-blue-500/[0.08] border border-blue-500/20">
                    <svg class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    <p class="text-xs text-blue-300">
                      Se sumará a <span class="font-semibold">{{ match.name }}</span>
                      <span class="text-blue-400/60 ml-1">({{ match.quantity }} {{ match.unit }} actuales)</span>
                    </p>
                  </div>
                }
              </div>

              <!-- Quantity + Unit -->
              <div class="flex gap-3 mb-4">
                <div class="flex-1">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">
                    Cantidad
                  </label>
                  <input formControlName="quantity" type="number" placeholder="0" min="0" step="any"
                         class="w-full px-4 py-3 rounded-xl border border-white/[0.06]
                                bg-mm-card text-mm-text1 text-sm outline-none
                                transition-colors focus:border-blue-500 placeholder:text-mm-text3" />
                  @if (form.get('quantity')?.touched && form.get('quantity')?.invalid) {
                    <p class="text-red-400 text-xs mt-1">Cantidad inválida</p>
                  }
                </div>
                <div class="w-32">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-2">
                    Unidad
                  </label>
                  <select formControlName="unit"
                          class="w-full px-3 py-3 rounded-xl border border-white/[0.06]
                                 bg-mm-card text-mm-text1 text-sm outline-none
                                 transition-colors focus:border-blue-500">
                    <option value="" disabled>—</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="unidades">unidad(es)</option>
                    <option value="paquetes">paquete(s)</option>
                    <option value="latas">lata(s)</option>
                    <option value="botes">bote(s)</option>
                    <option value="bolsas">bolsa(s)</option>
                  </select>
                </div>
              </div>

              <!-- Caducidad -->
              <div class="border-t border-white/[0.05] pt-4 mb-5 space-y-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3">
                  Caducidad <span class="font-normal normal-case tracking-normal opacity-60">(opcional)</span>
                </p>
                <select formControlName="categoryId"
                        class="w-full px-4 py-2.5 rounded-xl border border-white/[0.06]
                               bg-mm-card text-mm-text1 text-sm outline-none
                               transition-colors focus:border-blue-500">
                  <option value="">Sin categoría</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">
                      {{ cat.name }} — ~{{ cat.defaultDays }} día{{ cat.defaultDays !== 1 ? 's' : '' }}
                    </option>
                  }
                </select>
                @if (selectedCategory()) {
                  <p class="text-blue-400 text-xs">Caduca aprox. el {{ categoryExpiryPreview() }}</p>
                }
                <input formControlName="expiresAt" type="date"
                       class="w-full px-4 py-2.5 rounded-xl border border-white/[0.06]
                              bg-mm-card text-mm-text1 text-sm outline-none
                              transition-colors focus:border-blue-500 [color-scheme:dark]" />
              </div>

              @if (saveError()) {
                <p class="text-red-400 text-xs mb-4 bg-red-400/10 px-3 py-2 rounded-lg">
                  {{ saveError() }}
                </p>
              }

              <div class="flex gap-2.5">
                <button type="button" (click)="closeModal()"
                        class="flex-1 py-2.5 rounded-xl border border-white/[0.07]
                               text-mm-text2 hover:text-mm-text1 hover:border-white/10
                               transition-colors text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" [disabled]="saving()"
                        class="flex-1 btn-primary py-2.5 text-sm
                               disabled:opacity-50 disabled:cursor-not-allowed
                               disabled:translate-y-0 disabled:shadow-none">
                  {{ saving() ? '…' : submitLabel() }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class PantryComponent implements OnInit, OnDestroy {
  private readonly pantryService    = inject(PantryService);
  private readonly ingredientsService = inject(IngredientsService);
  private readonly fb = inject(FormBuilder);

  // ── Data ───────────────────────────────────────────────────
  items      = signal<PantryItem[]>([]);
  categories = signal<IngredientCategory[]>([]);
  catalog    = signal<IngredientResult[]>([]);
  loading    = signal(true);

  // ── Modal ──────────────────────────────────────────────────
  showModal    = signal(false);
  saving       = signal(false);
  saveError    = signal('');
  editMode     = signal(false);
  editingItem  = signal<DisplayItem | null>(null);

  ingredientName  = signal('');
  nameTouched     = signal(false);
  catalogResults  = signal<IngredientResult[]>([]);
  showDropdown    = signal(false);
  selectedCatalog = signal<IngredientResult | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    quantity:   [null as number | null, [Validators.required, Validators.min(0)]],
    unit:       ['', Validators.required],
    categoryId: [''],
    expiresAt:  [''],
  });

  // ── Computed ───────────────────────────────────────────────
  mergedItems = computed<DisplayItem[]>(() => {
    const now = new Date().toISOString();
    const linkedIds = new Set(
      this.items().map(i => i.ingredientId).filter((id): id is string => !!id)
    );
    const virtuals: DisplayItem[] = this.catalog()
      .filter(ing => !linkedIds.has(ing.id))
      .map(ing => ({
        virtual: true as const,
        id: ing.id,
        name: ing.name,
        quantity: 0,
        unit: ing.unit,
        ingredientId: ing.id,
        categoryId: null,
        category: null,
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
      }));
    return [...this.items(), ...virtuals];
  });

  inStockCount  = computed(() => this.mergedItems().filter(i => i.quantity > 0).length);
  depletedCount = computed(() => this.mergedItems().filter(i => i.quantity === 0).length);

  inStockGroups = computed(() => this.groupedItems().filter(g => !g.isDepleted));
  depletedGroup = computed(() => this.groupedItems().find(g => g.isDepleted) ?? null);

  groupedItems = computed<PantryGroup[]>(() => {
    const inStock  = this.mergedItems().filter(i => i.quantity > 0);
    const depleted = this.mergedItems().filter(i => i.quantity === 0);

    const catMap = new Map<string, PantryGroup>();
    for (const item of inStock) {
      const key  = item.categoryId ?? '__none__';
      const name = item.category?.name ?? 'Sin categoría';
      if (!catMap.has(key)) catMap.set(key, { id: key, name, items: [], isDepleted: false });
      catMap.get(key)!.items.push(item);
    }

    const groups = [...catMap.values()].sort((a, b) => {
      if (a.id === '__none__') return 1;
      if (b.id === '__none__') return -1;
      return a.name.localeCompare(b.name, 'es');
    });

    if (depleted.length > 0) {
      groups.push({ id: '__depleted__', name: 'Agotados', items: depleted, isDepleted: true });
    }
    return groups;
  });

  catColorMap = computed(() => {
    const map = new Map<string, string>();
    this.categories().forEach((cat, i) => map.set(cat.id, CAT_PALETTE[i % CAT_PALETTE.length]));
    return map;
  });

  existingMatch = computed<PantryItem | null>(() => {
    if (this.editMode()) return null;
    const name = this.ingredientName().trim();
    const cat  = this.selectedCatalog();
    if (!name) return null;
    if (cat) return this.items().find(i => i.ingredientId === cat.id) ?? null;
    return this.items().find(i => i.name.toLowerCase() === name.toLowerCase()) ?? null;
  });

  selectedCategory = computed(() => {
    const id = this.form.get('categoryId')?.value;
    return id ? this.categories().find(c => c.id === id) ?? null : null;
  });

  categoryExpiryPreview = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return '';
    const d = new Date();
    d.setDate(d.getDate() + cat.defaultDays);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  submitLabel = computed(() => {
    if (this.saving()) return '…';
    if (this.editMode()) return 'Guardar';
    if (this.existingMatch()) return 'Sumar cantidad';
    return 'Añadir';
  });

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.pantryService.getCategories().subscribe(cats => this.categories.set(cats));
    this.ingredientsService.getAll().subscribe(ings => this.catalog.set(ings));
    this.loadItems();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  // ── Row interaction ────────────────────────────────────────
  handleRowClick(item: DisplayItem): void {
    if (item.virtual) {
      // Open add modal pre-filled from catalog ingredient
      this.openAddModal({ id: item.ingredientId!, name: item.name, unit: item.unit, caloriesPer100g: null });
    } else {
      this.openEditModal(item);
    }
  }

  setDepleted(item: DisplayItem): void {
    if (item.virtual) return;
    this.pantryService.update(item.id, { quantity: 0, categoryId: null, expiresAt: null }).subscribe({
      next: (u) => this.items.update(l => l.map(i => i.id === u.id ? u : i)),
    });
  }

  deleteItem(item: DisplayItem): void {
    if (item.virtual) {
      // Delete from global catalog
      this.ingredientsService.delete(item.id).subscribe({
        next: () => this.catalog.update(l => l.filter(i => i.id !== item.id)),
        error: (e) => alert(e.error?.message ?? 'No se puede eliminar este ingrediente'),
      });
    } else {
      this.pantryService.remove(item.id).subscribe({
        next: () => this.items.update(l => l.filter(i => i.id !== item.id)),
      });
    }
  }

  // ── Modal — Add ────────────────────────────────────────────
  openAddModal(ing?: IngredientResult | null): void {
    this.editMode.set(false);
    this.editingItem.set(null);
    this.form.reset({ quantity: null, unit: ing?.unit ?? '', categoryId: '', expiresAt: '' });
    this.ingredientName.set(ing?.name ?? '');
    this.nameTouched.set(false);
    this.catalogResults.set([]);
    this.showDropdown.set(false);
    this.saveError.set('');
    this.selectedCatalog.set(ing ?? null);
    this.showModal.set(true);
  }

  // ── Modal — Edit ───────────────────────────────────────────
  openEditModal(item: DisplayItem): void {
    this.editMode.set(true);
    this.editingItem.set(item);
    const expiresAt = item.expiresAt ? item.expiresAt.split('T')[0] : '';
    this.form.reset({
      quantity:   item.quantity,
      unit:       item.unit,
      categoryId: item.categoryId ?? '',
      expiresAt,
    });
    this.ingredientName.set(item.name);
    this.nameTouched.set(false);
    this.catalogResults.set([]);
    this.showDropdown.set(false);
    this.saveError.set('');
    this.selectedCatalog.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  // ── Catalog search (add mode only) ─────────────────────────
  onNameInput(value: string): void {
    this.ingredientName.set(value);
    if (this.selectedCatalog() && value !== this.selectedCatalog()!.name) {
      this.selectedCatalog.set(null);
    }
    if (this.editMode()) return; // no catalog search in edit mode
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (value.length < 2) { this.catalogResults.set([]); return; }
    this.searchTimer = setTimeout(() => {
      this.ingredientsService.search(value).subscribe({
        next: r  => this.catalogResults.set(r),
        error: () => this.catalogResults.set([]),
      });
    }, 300);
  }

  onNameBlur(): void {
    this.nameTouched.set(true);
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  selectCatalog(ing: IngredientResult): void {
    this.selectedCatalog.set(ing);
    this.ingredientName.set(ing.name);
    this.form.patchValue({ unit: ing.unit });
    this.catalogResults.set([]);
    this.showDropdown.set(false);
  }

  // ── Submit ─────────────────────────────────────────────────
  submit(): void {
    this.nameTouched.set(true);
    const name = this.ingredientName().trim();
    if (!name || this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    this.saveError.set('');

    const { quantity: qty, unit, categoryId, expiresAt } = this.form.value;

    if (this.editMode()) {
      const target = this.editingItem()!;
      const dto: Parameters<PantryService['update']>[1] = {
        name,
        quantity: qty!,
        unit: unit!,
      };
      if (categoryId !== undefined) dto.categoryId = categoryId || undefined;
      if (expiresAt  !== undefined) dto.expiresAt  = expiresAt  || undefined;

      this.pantryService.update(target.id, dto).subscribe({
        next: (u) => {
          this.items.update(l => l.map(i => i.id === u.id ? u : i));
          this.saving.set(false); this.closeModal();
        },
        error: (e) => { this.saveError.set(e.error?.message ?? 'Error'); this.saving.set(false); },
      });
      return;
    }

    // Add mode
    const existing = this.existingMatch();
    if (existing) {
      this.pantryService.update(existing.id, { quantity: existing.quantity + qty! }).subscribe({
        next: (u) => {
          this.items.update(l => l.map(i => i.id === u.id ? u : i));
          this.saving.set(false); this.closeModal();
        },
        error: (e) => { this.saveError.set(e.error?.message ?? 'Error'); this.saving.set(false); },
      });
    } else {
      const dto: Parameters<PantryService['create']>[0] = { name, quantity: qty!, unit: unit! };
      if (categoryId) dto.categoryId = categoryId;
      if (expiresAt)  dto.expiresAt  = expiresAt;
      const cat = this.selectedCatalog();
      if (cat) dto.ingredientId = cat.id;

      this.pantryService.create(dto).subscribe({
        next: (item) => {
          this.items.update(l => [...l, item].sort((a, b) => a.name.localeCompare(b.name)));
          this.saving.set(false); this.closeModal();
        },
        error: (e) => { this.saveError.set(e.error?.message ?? 'Error al guardar'); this.saving.set(false); },
      });
    }
  }

  // ── Visual helpers ─────────────────────────────────────────
  categoryColor(groupId: string): string {
    if (groupId === '__depleted__') return '#ca8a04';
    if (groupId === '__none__')     return '#374151';
    return this.catColorMap().get(groupId) ?? CAT_PALETTE[0];
  }

  expiryBadge(item: PantryItem): { label: string; cls: string } | null {
    let ms: number | null = null;
    if (item.expiresAt) {
      ms = new Date(item.expiresAt).getTime();
    } else if (item.category) {
      ms = new Date(item.createdAt).getTime() + item.category.defaultDays * 86_400_000;
    }
    if (ms === null) return null;
    const days = (ms - Date.now()) / 86_400_000;
    const date = new Date(ms).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    if (days < 0)  return { label: 'Caducado',      cls: 'bg-red-500/15 text-red-400' };
    if (days <= 3) return { label: `Caduca ${date}`, cls: 'bg-orange-500/15 text-orange-400' };
    if (days <= 7) return { label: `Caduca ${date}`, cls: 'bg-yellow-500/15 text-yellow-400' };
    return null;
  }

  private loadItems(): void {
    this.pantryService.getAll().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
