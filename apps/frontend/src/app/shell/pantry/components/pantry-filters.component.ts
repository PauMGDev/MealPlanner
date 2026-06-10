import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { IngredientCategory } from '../../../core/services/pantry.service';

@Component({
  selector: 'app-pantry-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pantry-filters.component.html',
  styleUrl: './pantry-filters.component.css',
})
export class PantryFiltersComponent {
  @Input() searchQuery = '';
  @Input() expiryFilter: 'soon' | 'expired' | null = null;
  @Input() categoryFilter: string | null = null;
  @Input() sortOrder: 'name' | 'expiry' | 'quantity' = 'name';
  @Input() categories: IngredientCategory[] = [];
  @Input() isFiltering = false;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() expiryFilterChange = new EventEmitter<'soon' | 'expired' | null>();
  @Output() categoryFilterChange = new EventEmitter<string | null>();
  @Output() sortOrderChange = new EventEmitter<'name' | 'expiry' | 'quantity'>();
  @Output() clearFilters = new EventEmitter<void>();

  toggleExpiry(val: 'soon' | 'expired'): void {
    this.expiryFilterChange.emit(this.expiryFilter === val ? null : val);
  }
}
