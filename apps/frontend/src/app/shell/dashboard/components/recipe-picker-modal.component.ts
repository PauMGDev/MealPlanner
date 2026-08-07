import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { type Recipe } from '../../../core/services/recipes.service';
import { AppModalComponent } from '../../../shared/modal/app-modal.component';
import { MEAL_ROWS, formatSlotDate } from '../weekly-calendar.types';
import type { SlotRef } from './calendar-grid.component';

@Component({
  selector: 'app-recipe-picker-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModalComponent],
  templateUrl: './recipe-picker-modal.component.html',
})
export class RecipePickerModalComponent implements OnChanges {
  @Input() show = false;
  @Input() slot: SlotRef | null = null;
  @Input() set recipes(v: Recipe[]) { this.allRecipes.set(v); }
  @Input() set loadingRecipes(v: boolean) { this.isLoading.set(v); }

  @Output() closed = new EventEmitter<void>();
  @Output() selected = new EventEmitter<Recipe>();

  allRecipes = signal<Recipe[]>([]);
  protected readonly isLoading = signal(false);
  query = signal('');

  filteredRecipes = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.allRecipes().filter(r => r.name.toLowerCase().includes(q)) : this.allRecipes();
  });

  readonly skeletonRows = [0, 1, 2, 3];
  protected readonly formatSlotDate = formatSlotDate;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) this.query.set('');
  }

  get slotLabel(): string {
    return MEAL_ROWS.find(r => r.type === this.slot?.mealType)?.label ?? '';
  }
}
