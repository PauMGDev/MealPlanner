import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { type IngredientResult } from '../../../core/services/ingredients.service';
import { type Recipe, RecipesService } from '../../../core/services/recipes.service';
import { type PendingIngredient } from '../recipes.types';
import { IngredientSearchComponent } from './ingredient-search.component';
import { AppModalComponent } from '../../../shared/modal/app-modal.component';

@Component({
  selector: 'app-recipe-form-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IngredientSearchComponent, AppModalComponent],
  templateUrl: './recipe-form-modal.component.html',
  styleUrl: './recipe-form-modal.component.css',
})
export class RecipeFormModalComponent implements OnChanges {
  @Input() show = false;
  @Input() recipe: Recipe | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private readonly recipesService = inject(RecipesService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  saveError = signal('');
  pendingIngredients = signal<PendingIngredient[]>([]);

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    prepTime:    [null as number | null, [Validators.required, Validators.min(1)]],
    servings:    [null as number | null, [Validators.required, Validators.min(1)]],
    steps:       this.fb.array([this.fb.control('', Validators.required)]),
  });

  private get stepsArray(): FormArray { return this.form.get('steps') as FormArray; }
  get stepControls(): FormControl[] { return this.stepsArray.controls as FormControl[]; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) this.initForm();
  }

  private initForm(): void {
    while (this.stepsArray.length > 0) this.stepsArray.removeAt(0);
    const r = this.recipe;
    if (r) {
      this.form.reset({ name: r.name, description: r.description ?? '', prepTime: r.prepTime, servings: r.servings });
      const steps = r.steps.length > 0 ? r.steps : [''];
      for (const step of steps) this.stepsArray.push(this.fb.control(step, Validators.required));
      this.pendingIngredients.set(r.recipeIngredients.map(ri => ({ ingredient: ri.ingredient as IngredientResult, quantity: ri.quantity })));
    } else {
      this.form.reset({ name: '', description: '', prepTime: null, servings: null });
      this.stepsArray.push(this.fb.control('', Validators.required));
      this.pendingIngredients.set([]);
    }
    this.saveError.set('');
  }

  addStep(): void { this.stepsArray.push(this.fb.control('', Validators.required)); }
  removeStep(i: number): void { this.stepsArray.removeAt(i); }

  onIngredientSelected(ingredient: IngredientResult): void {
    const already = this.pendingIngredients().some(p => p.ingredient.id === ingredient.id);
    if (!already) this.pendingIngredients.update(list => [...list, { ingredient, quantity: 1 }]);
  }

  updatePendingQty(index: number, value: string): void {
    const qty = parseFloat(value);
    if (!isNaN(qty) && qty > 0) {
      this.pendingIngredients.update(list => list.map((p, i) => i === index ? { ...p, quantity: qty } : p));
    }
  }

  removePending(index: number): void {
    this.pendingIngredients.update(list => list.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set('');
    const { name, description, prepTime, servings, steps } = this.form.value;
    const pending = this.pendingIngredients();
    const editing = this.recipe;
    const dto = { name: name!, prepTime: prepTime!, servings: servings!, steps: (steps as string[]).filter(s => s?.trim()), ...(description ? { description } : {}) };

    if (editing) {
      const origMap = new Map(editing.recipeIngredients.map(ri => [ri.ingredientId, ri]));
      const pendingMap = new Map(pending.map(p => [p.ingredient.id, p]));
      const toRemove = editing.recipeIngredients.filter(ri => { const p = pendingMap.get(ri.ingredientId); return !p || p.quantity !== ri.quantity; });
      const toAdd = pending.filter(p => { const orig = origMap.get(p.ingredient.id); return !orig || orig.quantity !== p.quantity; });
      this.recipesService.update(editing.id, dto).pipe(
        switchMap(() => toRemove.length ? forkJoin(toRemove.map(ri => this.recipesService.removeIngredient(editing.id, ri.ingredientId))) : of(null)),
        switchMap(() => toAdd.length ? forkJoin(toAdd.map(p => this.recipesService.addIngredient(editing.id, { ingredientId: p.ingredient.id, quantity: p.quantity }))) : of(null)),
      ).subscribe({
        next: () => { this.saving.set(false); this.saved.emit(); },
        error: err => { this.saveError.set(err.error?.message ?? 'Error al guardar'); this.saving.set(false); },
      });
      return;
    }

    this.recipesService.create(dto).pipe(
      switchMap(recipe => pending.length === 0 ? of(null) :
        forkJoin(pending.map(p => this.recipesService.addIngredient(recipe.id, { ingredientId: p.ingredient.id, quantity: p.quantity }))))
    ).subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: err => { this.saveError.set(err.error?.message ?? 'Error al guardar'); this.saving.set(false); },
    });
  }
}
