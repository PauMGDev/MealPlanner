import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientCategory, PantryItem, PantryService } from '../../core/services/pantry.service';

@Component({
  selector: 'app-pantry',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-mm-text1">Despensa</h1>
          <p class="text-mm-text2 mt-0.5 text-sm">
            {{ items().length }} ingrediente{{ items().length !== 1 ? 's' : '' }}
          </p>
        </div>
        <button (click)="openModal()"
                class="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Añadir ingrediente
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center gap-3 text-mm-text2 text-sm py-12 justify-center">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Cargando...
        </div>
      }

      <!-- Empty state -->
      @else if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-mm-surface border border-white/[0.06]
                      flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-mm-text3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
          </div>
          <p class="text-mm-text1 font-medium mb-1">Tu despensa está vacía</p>
          <p class="text-mm-text2 text-sm mb-6">Añade los ingredientes que tienes disponibles</p>
          <button (click)="openModal()" class="btn-primary px-5 py-2.5 text-sm">
            Añadir primer ingrediente
          </button>
        </div>
      }

      <!-- Items grid -->
      @else {
        <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))">
          @for (item of items(); track item.id) {
            <div class="bg-mm-surface border rounded-xl p-3 flex flex-col group transition-colors"
                 [style.border-color]="expiryInfo(item)?.borderColor ?? 'rgba(255,255,255,0.06)'">

              <!-- Top: name + delete -->
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-mm-text1 truncate">{{ item.name }}</p>
                  <p class="text-xs text-mm-text2 mt-0.5">{{ item.quantity }} {{ item.unit }}</p>
                  @if (item.category) {
                    <span class="inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium
                                 bg-blue-500/10 text-blue-400">
                      {{ item.category.name }}
                    </span>
                  }
                </div>
                <button (click)="deleteItem(item.id)"
                        class="flex-shrink-0 ml-2 p-1.5 rounded-lg text-mm-text3
                               opacity-0 group-hover:opacity-100 transition-all
                               hover:text-red-400 hover:bg-red-400/10">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                  </svg>
                </button>
              </div>

              <!-- Bottom: expiry date -->
              @if (expiryInfo(item); as info) {
                <p class="text-xs text-mm-text3 mt-auto pt-2 border-t border-white/[0.04]">
                  {{ info.label }}
                </p>
              }

            </div>
          }
        </div>
      }

    </div>

    <!-- Modal backdrop -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                  flex items-center justify-center p-4"
           (click)="closeModal()">

        <div class="bg-mm-surface border border-white/[0.06] rounded-3xl
                    w-full max-w-md shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-8 pt-8 pb-0">
            <h2 class="text-xl font-bold text-mm-text1">Añadir ingrediente</h2>
            <button (click)="closeModal()"
                    class="p-2 rounded-xl text-mm-text3 hover:text-mm-text1
                           hover:bg-white/[0.04] transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="px-8 pb-8 pt-6">

            <!-- Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">Nombre</label>
              <input formControlName="name" type="text" placeholder="Ej: Pechuga de pollo"
                     class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                            bg-mm-card text-mm-text1 text-[15px] outline-none
                            transition-colors focus:border-blue-500
                            placeholder:text-mm-text3 font-sans" />
              @if (form.get('name')?.touched && form.get('name')?.invalid) {
                <p class="text-red-400 text-xs mt-1.5">El nombre es obligatorio</p>
              }
            </div>

            <!-- Quantity + Unit -->
            <div class="flex gap-3 mb-5">
              <div class="flex-1">
                <label class="block text-sm font-medium text-mm-text2 mb-1.5">Cantidad</label>
                <input formControlName="quantity" type="number" placeholder="0" min="0" step="any"
                       class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                              bg-mm-card text-mm-text1 text-[15px] outline-none
                              transition-colors focus:border-blue-500
                              placeholder:text-mm-text3 font-sans" />
                @if (form.get('quantity')?.touched && form.get('quantity')?.invalid) {
                  <p class="text-red-400 text-xs mt-1.5">Cantidad inválida</p>
                }
              </div>
              <div class="w-32">
                <label class="block text-sm font-medium text-mm-text2 mb-1.5">Unidad</label>
                <input formControlName="unit" type="text" placeholder="g"
                       list="unit-suggestions"
                       class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                              bg-mm-card text-mm-text1 text-[15px] outline-none
                              transition-colors focus:border-blue-500
                              placeholder:text-mm-text3 font-sans" />
                <datalist id="unit-suggestions">
                  <option value="g"></option>
                  <option value="kg"></option>
                  <option value="ml"></option>
                  <option value="l"></option>
                  <option value="unidades"></option>
                  <option value="piezas"></option>
                  <option value="latas"></option>
                  <option value="bolsas"></option>
                </datalist>
              </div>
            </div>

            <!-- Divider: caducidad -->
            <div class="border-t border-white/[0.06] mb-5"></div>
            <p class="text-xs font-semibold uppercase tracking-wider text-mm-text3 mb-4">
              Caducidad <span class="font-normal normal-case tracking-normal">(elige una o ambas)</span>
            </p>

            <!-- Category select -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">
                Categoría
                <span class="text-mm-text3 font-normal ml-1">— caducidad estimada</span>
              </label>
              <select formControlName="categoryId"
                      class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                             bg-mm-card text-mm-text1 text-[15px] outline-none
                             transition-colors focus:border-blue-500 font-sans">
                <option value="">Sin categoría</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">
                    {{ cat.name }} — ~{{ cat.defaultDays }} día{{ cat.defaultDays !== 1 ? 's' : '' }}
                  </option>
                }
              </select>
              @if (selectedCategory()) {
                <p class="text-blue-400 text-xs mt-1.5">
                  Caduca aprox. el {{ categoryExpiryPreview() }}
                </p>
              }
            </div>

            <!-- Manual date -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-mm-text2 mb-1.5">
                Fecha de caducidad exacta
                <span class="text-mm-text3 font-normal ml-1">— tiene prioridad sobre la categoría</span>
              </label>
              <input formControlName="expiresAt" type="date"
                     class="w-full px-4 py-3 rounded-[10px] border border-white/[0.06]
                            bg-mm-card text-mm-text1 text-[15px] outline-none
                            transition-colors focus:border-blue-500
                            [color-scheme:dark] font-sans" />
            </div>

            @if (saveError()) {
              <p class="text-red-400 text-sm mb-4 bg-red-400/10 px-4 py-2.5 rounded-lg">
                {{ saveError() }}
              </p>
            }

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
                {{ saving() ? 'Guardando...' : 'Añadir' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    }
  `,
})
export class PantryComponent implements OnInit {
  private readonly pantryService = inject(PantryService);
  private readonly fb = inject(FormBuilder);

  items = signal<PantryItem[]>([]);
  categories = signal<IngredientCategory[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  saveError = signal('');

  form = this.fb.group({
    name:       ['', Validators.required],
    quantity:   [null as number | null, [Validators.required, Validators.min(0.001)]],
    unit:       ['', Validators.required],
    categoryId: [''],
    expiresAt:  [''],
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

  ngOnInit(): void {
    this.pantryService.getCategories().subscribe(cats => this.categories.set(cats));
    this.loadItems();
  }

  openModal(): void {
    this.form.reset({ name: '', quantity: null, unit: '', categoryId: '', expiresAt: '' });
    this.saveError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const { name, quantity, unit, categoryId, expiresAt } = this.form.value;
    const dto: Parameters<PantryService['create']>[0] = {
      name: name!,
      quantity: quantity!,
      unit: unit!,
    };
    if (categoryId) dto.categoryId = categoryId;
    if (expiresAt)  dto.expiresAt  = expiresAt;

    this.pantryService.create(dto).subscribe({
      next: (item) => {
        this.items.update(list => [...list, item].sort((a, b) => a.name.localeCompare(b.name)));
        this.saving.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.saveError.set(err.error?.message ?? 'No se pudo guardar el ingrediente');
        this.saving.set(false);
      },
    });
  }

  deleteItem(id: string): void {
    this.pantryService.remove(id).subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== id)),
    });
  }

  expiryInfo(item: PantryItem): { label: string; borderColor: string } | null {
    let expiryMs: number | null = null;
    let source: 'manual' | 'category' = 'manual';

    if (item.expiresAt) {
      expiryMs = new Date(item.expiresAt).getTime();
      source = 'manual';
    } else if (item.category) {
      expiryMs = new Date(item.createdAt).getTime() + item.category.defaultDays * 86_400_000;
      source = 'category';
    }

    if (expiryMs === null) return null;

    const days = (expiryMs - Date.now()) / 86_400_000;
    const borderColor = days < 0
      ? 'rgba(248,113,113,0.55)'    // red-400
      : days <= 7
        ? 'rgba(250,204,21,0.55)'   // yellow-400
        : 'rgba(255,255,255,0.06)'; // neutral

    const dateStr = new Date(expiryMs).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const label = source === 'manual' ? `Caduca ${dateStr}` : `Caduca aprox. ${dateStr}`;

    return { label, borderColor };
  }

  private loadItems(): void {
    this.pantryService.getAll().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
