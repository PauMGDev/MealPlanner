import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { type Meal, type MealType, MealPlansService } from '../../../core/services/meal-plans.service';
import type { Recipe } from '../../../core/services/recipes.service';
import { PlanWeekService } from '../../../core/services/plan-week.service';
import { SettingsService } from '../../../core/services/settings.service';
import {
  DAY_INITIALS,
  MEAL_ROWS,
  formatDayLong,
  isToday,
  toISODate,
  type MealRowDef,
} from '../../dashboard/weekly-calendar.types';

interface SlotOption {
  row: MealRowDef;
  /** The recipe already sitting in this slot, if any. */
  taken: Meal | undefined;
}

/**
 * Puts a recipe on the plan without leaving the recipe modal. Rendered as a
 * step of that modal rather than as a layer over it: the panel clips its own
 * content, so an anchored popover would be cut off on a short recipe.
 *
 * The days offered are the week the Plan screen is showing and the rows are the
 * user's active slots, so this never invents a calendar of its own.
 */
@Component({
  selector: 'app-add-to-plan',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-to-plan.component.html',
})
export class AddToPlanComponent implements OnInit {
  @Input({ required: true }) recipe!: Recipe;

  /** Emitted once the meal is saved, so the modal can confirm and close. */
  @Output() added = new EventEmitter<void>();
  /** Back to the recipe without saving. */
  @Output() cancelled = new EventEmitter<void>();

  private readonly mealPlans = inject(MealPlansService);
  private readonly planWeek = inject(PlanWeekService);
  private readonly settings = inject(SettingsService);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dayInitials = DAY_INITIALS;
  protected readonly isToday = isToday;
  protected readonly toISODate = toISODate;
  protected readonly formatDayLong = formatDayLong;

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  /** Set when the chosen slot is taken: the user confirms before we overwrite. */
  pendingReplace = signal<SlotOption | null>(null);

  private focusTimer?: ReturnType<typeof setTimeout>;
  private readonly meals = signal<Meal[]>([]);

  readonly days = this.planWeek.days;
  selectedDate = signal<string>(toISODate(new Date()));

  slots = computed<SlotOption[]>(() => {
    const active = this.settings.activeMealTypes();
    const date = this.selectedDate();
    return MEAL_ROWS.filter(r => active.includes(r.type)).map(row => ({
      row,
      taken: this.meals().find(m => m.date.slice(0, 10) === date && m.mealType === row.type),
    }));
  });

  get selectedDayLabel(): string {
    const day = this.days().find(d => toISODate(d) === this.selectedDate());
    return day ? formatDayLong(day) : '';
  }

  constructor() {
    // Follows the shared week, so "libre" never lies if it changes underneath.
    toObservable(this.planWeek.weekStart)
      .pipe(
        switchMap(weekStart => {
          this.loading.set(true);
          return this.mealPlans.getWeek(toISODate(weekStart)).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(plan => {
        this.meals.set(plan?.meals ?? []);
        this.loading.set(false);
      });

    this.destroyRef.onDestroy(() => clearTimeout(this.focusTimer));
  }

  ngOnInit(): void {
    this.selectedDate.set(this.defaultDate());
    this.focusFirst('.lp-daypill');
  }

  /**
   * Every view swap inside the step re-homes focus. Focus is what keeps Escape
   * unwinding one level at a time: if it fell back to `<body>`, the keydown
   * would never bubble through this component and the whole modal would close.
   *
   * A macrotask, not a microtask: the target is behind an `@if`, so it only
   * exists once change detection has run.
   */
  private focusFirst(selector: string): void {
    clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(() => this.host.querySelector<HTMLElement>(selector)?.focus());
  }

  /** Today when it belongs to the visible week, otherwise its Monday. */
  private defaultDate(): string {
    const days = this.days();
    return toISODate(days.find(isToday) ?? days[0]);
  }

  selectDay(day: Date): void {
    this.selectedDate.set(toISODate(day));
    this.pendingReplace.set(null);
  }

  goBack(): void {
    this.cancelled.emit();
  }

  pick(slot: SlotOption): void {
    if (this.saving()) return;
    // Upsert overwrites silently on the server, so ask here instead.
    if (slot.taken) {
      this.pendingReplace.set(slot);
      this.focusFirst('[data-confirm-cancel]');
      return;
    }
    this.assign(slot.row.type);
  }

  confirmReplace(): void {
    const slot = this.pendingReplace();
    if (slot) this.assign(slot.row.type);
  }

  cancelReplace(): void {
    this.pendingReplace.set(null);
    this.focusFirst('.lp-slot-option');
  }

  private assign(mealType: MealType): void {
    this.saving.set(true);
    this.error.set('');
    this.mealPlans
      .upsertMeal({ date: this.selectedDate(), mealType, recipeId: this.recipe.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.added.emit();
        },
        error: () => {
          this.saving.set(false);
          this.pendingReplace.set(null);
          this.error.set('No se pudo añadir al plan. Inténtalo de nuevo.');
        },
      });
  }

  /** Unwinds one level: back to the recipe, not out of the modal. */
  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    event.stopPropagation();
    if (this.pendingReplace()) {
      this.cancelReplace();
      return;
    }
    this.goBack();
  }
}
