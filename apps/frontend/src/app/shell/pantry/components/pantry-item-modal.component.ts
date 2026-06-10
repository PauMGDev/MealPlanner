import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { type IngredientCategory, type PantryItem } from '../../../core/services/pantry.service';
import { type IngredientResult } from '../../../core/services/ingredients.service';
import { type DisplayItem, type PantryItemSaveIntent, buildSaveIntent, findExistingMatch } from '../pantry.types';
import { AppModalComponent } from '../../../shared/modal/app-modal.component';

@Component({
  selector: 'app-pantry-item-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppModalComponent],
  templateUrl: './pantry-item-modal.component.html',
  styleUrl: './pantry-item-modal.component.css',
})
export class PantryItemModalComponent implements OnChanges {
  @Input() show = false;
  @Input() editingItem: DisplayItem | null = null;
  @Input() preselectedIngredient: IngredientResult | null = null;
  @Input() set categories(v: IngredientCategory[]) { this._categories.set(v); }
  @Input() set items(v: PantryItem[]) { this._items.set(v); }

  saving = input(false);
  saveError = input('');
  catalogResults = input<IngredientResult[]>([]);

  @Output() save = new EventEmitter<PantryItemSaveIntent>();
  @Output() searchIngredient = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly nameInput$ = new Subject<string>();

  protected readonly _categories = signal<IngredientCategory[]>([]);
  private _items = signal<PantryItem[]>([]);

  ingredientName = signal('');
  nameTouched = signal(false);
  showDropdown = signal(false);
  selectedCatalog = signal<IngredientResult | null>(null);

  form = this.fb.group({
    quantity:   [null as number | null, [Validators.required, Validators.min(0)]],
    unit:       ['', Validators.required],
    categoryId: [''],
    expiresAt:  [''],
  });

  get editMode(): boolean { return !!this.editingItem; }

  existingMatch = computed<PantryItem | null>(() => {
    if (this.editMode) return null;
    return findExistingMatch(this._items(), this.ingredientName(), this.selectedCatalog()?.id ?? null);
  });

  selectedCategory = computed(() => {
    const id = this.form.get('categoryId')?.value;
    return id ? this._categories().find(c => c.id === id) ?? null : null;
  });

  categoryExpiryPreview = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return '';
    const d = new Date();
    d.setDate(d.getDate() + cat.defaultDays);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  showCatalogDropdown = computed(() =>
    !this.editMode && this.showDropdown()
      && this.ingredientName().trim().length >= 2
      && this.catalogResults().length > 0
  );

  submitLabel = computed(() => {
    if (this.saving()) return '…';
    if (this.editMode) return 'Guardar';
    if (this.existingMatch()) return 'Sumar cantidad';
    return 'Añadir';
  });

  constructor() {
    this.nameInput$.pipe(
      debounceTime(300),
      takeUntilDestroyed(),
    ).subscribe(v => this.searchIngredient.emit(v));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) this.initForm();
  }

  private initForm(): void {
    const item = this.editingItem;
    const ing = this.preselectedIngredient;
    this.nameTouched.set(false);
    this.showDropdown.set(false);
    if (item) {
      this.form.reset({ quantity: item.quantity, unit: item.unit, categoryId: item.categoryId ?? '', expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : '' });
      this.ingredientName.set(item.name);
      this.selectedCatalog.set(null);
    } else {
      this.form.reset({ quantity: null, unit: ing?.unit ?? '', categoryId: '', expiresAt: '' });
      this.ingredientName.set(ing?.name ?? '');
      this.selectedCatalog.set(ing ?? null);
    }
  }

  onNameInput(value: string): void {
    this.ingredientName.set(value);
    if (this.selectedCatalog() && value !== this.selectedCatalog()!.name) this.selectedCatalog.set(null);
    if (this.editMode) return;
    if (value.length < 2) return;
    this.nameInput$.next(value);
  }

  onNameBlur(): void { this.nameTouched.set(true); setTimeout(() => this.showDropdown.set(false), 150); }

  selectCatalog(ing: IngredientResult): void {
    this.selectedCatalog.set(ing);
    this.ingredientName.set(ing.name);
    this.form.patchValue({ unit: ing.unit });
    this.showDropdown.set(false);
  }

  submit(): void {
    this.nameTouched.set(true);
    const name = this.ingredientName().trim();
    if (!name || this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { quantity, unit, categoryId, expiresAt } = this.form.value;
    this.save.emit(buildSaveIntent({
      editingItemId: this.editingItem?.id ?? null,
      existingMatch: this.existingMatch(),
      form: { name, quantity: quantity!, unit: unit!, categoryId: categoryId ?? '', expiresAt: expiresAt ?? '' },
      catalogId: this.selectedCatalog()?.id ?? null,
    }));
  }
}
