import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { ShoppingListItem } from '../../../core/services/shopping-list.service';

const ROTATIONS = ['-0.6deg', '0.5deg', '-0.3deg', '0.7deg', '-0.5deg', '0.4deg'];

@Component({
  selector: 'app-shopping-list-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shopping-list-row.component.html',
  styleUrl: './shopping-list-row.component.css',
})
export class ShoppingListRowComponent {
  @Input({ required: true }) item!: ShoppingListItem;
  @Input() index = 0;

  @Output() toggled = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<{ id: string; quantity: number }>();
  @Output() removed = new EventEmitter<string>();

  get rotation(): string {
    return ROTATIONS[this.index % ROTATIONS.length];
  }

  onQuantityChange(value: string): void {
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity >= 0) {
      this.quantityChanged.emit({ id: this.item.id, quantity });
    }
  }
}
