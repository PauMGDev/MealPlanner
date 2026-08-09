import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { PantryItem } from '../../../core/services/pantry.service';
import { expiryBadgeOf, type DisplayItem, type ExpiryBadge } from '../pantry.types';

@Component({
  selector: 'app-pantry-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pantry-item.component.html',
  styleUrl: './pantry-item.component.css',
})
export class PantryItemComponent {
  @Input({ required: true }) item!: DisplayItem;

  @Output() rowClick = new EventEmitter<DisplayItem>();
  @Output() setDepleted = new EventEmitter<DisplayItem>();
  @Output() delete = new EventEmitter<DisplayItem>();

  get badge(): ExpiryBadge | null {
    return this.item.virtual ? null : expiryBadgeOf(this.item as PantryItem);
  }
}
