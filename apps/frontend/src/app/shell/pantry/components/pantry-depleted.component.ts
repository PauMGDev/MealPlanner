import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { type DisplayItem, type PantryGroup } from '../pantry.types';

@Component({
  selector: 'app-pantry-depleted',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pantry-depleted.component.html',
  styleUrl: './pantry-depleted.component.css',
})
export class PantryDepletedComponent {
  @Input({ required: true }) group!: PantryGroup;
  @Input() isCollapsed = false;

  @Output() toggle = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<DisplayItem>();
  @Output() delete = new EventEmitter<DisplayItem>();

  get chevronClass(): string {
    const base = 'w-3.5 h-3.5 text-lp-ink-faint flex-shrink-0 transition-transform duration-200';
    return this.isCollapsed ? `${base} -rotate-90` : base;
  }

  get collapsedPreview(): string {
    const names = this.group.items.slice(0, 3).map(i => i.name).join(' · ');
    return this.group.items.length > 3 ? `${names} +${this.group.items.length - 3}` : names;
  }
}
