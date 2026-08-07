import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import type { Meal, MealType } from '../../../core/services/meal-plans.service';
import {
  DAY_LABELS,
  availabilityLabel,
  dotClass,
  isToday,
  toISODate,
  type MealRowDef,
  type SlotAvailability,
} from '../weekly-calendar.types';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal.directive';

export interface SlotRef {
  date: string;
  mealType: MealType;
}

export interface MoveRequest {
  from: SlotRef;
  to: SlotRef;
}

/**
 * The weekly matrix: seven day columns by the active meal rows. Cell height
 * adapts to the row count (`--lp-rows`) so the whole matrix fits above the fold
 * instead of scrolling. Reassigning a meal is a native HTML5 drag between cells.
 */
@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  templateUrl: './calendar-grid.component.html',
})
export class CalendarGridComponent {
  @Input() weekDays: Date[] = [];
  @Input() mealRows: MealRowDef[] = [];
  @Input() mealGrid = new Map<string, Meal>();
  @Input() availability = new Map<string, SlotAvailability>();
  @Input() loading = true;

  @Output() openDetail = new EventEmitter<Meal>();
  @Output() openPicker = new EventEmitter<SlotRef>();
  @Output() removeSlot = new EventEmitter<SlotRef>();
  @Output() moveMeal = new EventEmitter<MoveRequest>();

  readonly dayLabels = DAY_LABELS;
  protected readonly isToday = isToday;
  protected readonly toISODate = toISODate;
  protected readonly dotClass = dotClass;
  protected readonly availabilityLabel = availabilityLabel;

  /** Slot keys, not objects: the template compares them with plain equality. */
  dragSource = signal<string | null>(null);
  dragOver = signal<string | null>(null);

  slotKey(day: Date, mealType: MealType): string {
    return `${toISODate(day)}|${mealType}`;
  }

  getMeal(day: Date, mealType: MealType): Meal | undefined {
    return this.mealGrid.get(this.slotKey(day, mealType));
  }

  getAvailability(meal: Meal): SlotAvailability {
    return this.availability.get(meal.recipeId) ?? { level: 'none', missing: 0, total: 0 };
  }

  onDragStart(event: DragEvent, key: string): void {
    this.dragSource.set(key);
    event.dataTransfer?.setData('text/plain', key);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.dragSource.set(null);
    this.dragOver.set(null);
  }

  onDragOver(event: DragEvent, key: string): void {
    if (!this.dragSource() || this.dragSource() === key) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dragOver.set(key);
  }

  onDragLeave(key: string): void {
    if (this.dragOver() === key) this.dragOver.set(null);
  }

  onDrop(event: DragEvent, day: Date, mealType: MealType): void {
    event.preventDefault();
    const from = this.dragSource();
    this.onDragEnd();
    const to = this.slotKey(day, mealType);
    if (!from || from === to) return;
    const [fromDate, fromType] = from.split('|');
    this.moveMeal.emit({
      from: { date: fromDate, mealType: fromType as MealType },
      to: { date: toISODate(day), mealType },
    });
  }

  onRemove(event: Event, day: Date, mealType: MealType): void {
    event.stopPropagation();
    this.removeSlot.emit({ date: toISODate(day), mealType });
  }
}
