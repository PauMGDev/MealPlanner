import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-recipe-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-filters.component.html',
  styleUrl: './recipe-filters.component.css',
})
export class RecipeFiltersComponent {
  @Input() searchQuery = '';
  @Input() onlyAvailable = false;
  @Input() isFiltering = false;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() onlyAvailableChange = new EventEmitter<boolean>();
  @Output() clearFilters = new EventEmitter<void>();
}
