import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import { type IngredientResult, IngredientsService } from '../../../core/services/ingredients.service';

@Component({
  selector: 'app-ingredient-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ingredient-search.component.html',
  styleUrl: './ingredient-search.component.css',
})
export class IngredientSearchComponent {
  @Input() alreadySelectedIds: string[] = [];
  @Output() ingredientSelected = new EventEmitter<IngredientResult>();

  private readonly ingredientsService = inject(IngredientsService);
  private readonly searchInput$ = new Subject<string>();

  query = signal('');
  results = signal<IngredientResult[]>([]);
  showResults = signal(false);
  loading = signal(false);
  showCreate = signal(false);
  createName = signal('');
  createUnit = signal('');
  suggestions = signal<IngredientResult[]>([]);
  creating = signal(false);

  constructor() {
    this.searchInput$.pipe(
      debounceTime(300),
      switchMap(value => {
        this.loading.set(true);
        return this.ingredientsService.search(value).pipe(catchError(() => of([])));
      }),
      takeUntilDestroyed(),
    ).subscribe(r => { this.results.set(r); this.loading.set(false); });
  }

  onInput(value: string): void {
    this.query.set(value);
    this.suggestions.set([]);
    if (value.length < 2) { this.results.set([]); this.showResults.set(false); return; }
    this.showResults.set(true);
    this.searchInput$.next(value);
  }

  clearSearch(): void { this.query.set(''); this.results.set([]); this.showResults.set(false); }

  select(result: IngredientResult): void {
    this.ingredientSelected.emit(result);
    this.clearSearch();
    this.showCreate.set(false);
    this.suggestions.set([]);
  }

  openCreate(): void {
    this.createName.set(this.query());
    this.createUnit.set('g');
    this.showResults.set(false);
    this.showCreate.set(true);
    this.suggestions.set([]);
  }

  cancelCreate(): void { this.showCreate.set(false); this.suggestions.set([]); }

  create(): void {
    const name = this.createName().trim();
    const unit = this.createUnit().trim();
    if (!name || !unit) return;
    this.creating.set(true);
    this.suggestions.set([]);
    this.ingredientsService.create({ name, unit }).subscribe({
      next: ingredient => { this.select(ingredient); this.creating.set(false); this.showCreate.set(false); },
      error: err => {
        this.creating.set(false);
        if (err.status === 409) {
          if (err.error?.existing) { this.select(err.error.existing); this.showCreate.set(false); }
          else if (err.error?.suggestions?.length) this.suggestions.set(err.error.suggestions);
        }
      },
    });
  }

  forceCreate(): void {
    const name = this.createName().trim();
    const unit = this.createUnit().trim();
    if (!name || !unit) return;
    this.creating.set(true);
    this.suggestions.set([]);
    this.ingredientsService.create({ name, unit, force: true }).subscribe({
      next: ingredient => { this.select(ingredient); this.creating.set(false); this.showCreate.set(false); },
      error: () => this.creating.set(false),
    });
  }
}
