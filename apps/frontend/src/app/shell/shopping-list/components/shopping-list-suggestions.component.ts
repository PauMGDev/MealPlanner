import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { type ShoppingListSuggestion } from '../../../core/services/shopping-list.service';

@Component({
  selector: 'app-shopping-list-suggestions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './shopping-list-suggestions.component.html',
  styleUrl: './shopping-list-suggestions.component.css',
})
export class ShoppingListSuggestionsComponent {
  @Input() suggestions: ShoppingListSuggestion[] = [];
  @Input() loading = false;

  @Output() add = new EventEmitter<ShoppingListSuggestion>();
}
