import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, forkJoin, of, switchMap } from 'rxjs';
import { type Meal, type MealType, type WeeklyPlan, MealPlansService } from '../../core/services/meal-plans.service';
import { type PantryItem, PantryService } from '../../core/services/pantry.service';
import { type Recipe, RecipesService } from '../../core/services/recipes.service';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  MEAL_HOURS,
  MEAL_ROWS,
  addDays,
  computeWeekNeeds,
  findNextMeal,
  formatWeekRange,
  getThisMonday,
  isToday,
  slotAvailability,
  toISODate,
  visibleMealRows,
  type NextMealView,
  type SlotAvailability,
  type WeekNeed,
} from './weekly-calendar.types';
import { CalendarGridComponent, type MoveRequest, type SlotRef } from './components/calendar-grid.component';
import { DayViewComponent } from './components/day-view.component';
import { WeekModulesComponent } from './components/week-modules.component';
import { MealDetailModalComponent } from './components/meal-detail-modal.component';
import { RecipePickerModalComponent } from './components/recipe-picker-modal.component';

/**
 * The Plan screen. Owns the visible week and every mutation on it; the matrix,
 * the mobile day view and the modules below are presentational.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CalendarGridComponent,
    DayViewComponent,
    WeekModulesComponent,
    MealDetailModalComponent,
    RecipePickerModalComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly mealPlans = inject(MealPlansService);
  private readonly recipesService = inject(RecipesService);
  private readonly pantryService = inject(PantryService);
  private readonly shoppingList = inject(ShoppingListService);
  private readonly settings = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);

  currentWeekStart = signal<Date>(getThisMonday());
  weeklyPlan = signal<WeeklyPlan | null>(null);
  loadingPlan = signal(true);
  calendarError = signal('');

  recipes = signal<Recipe[]>([]);
  pantryItems = signal<PantryItem[]>([]);
  listedIngredientIds = signal<ReadonlySet<string>>(new Set());
  loadingContext = signal(true);
  addingToList = signal(false);

  selectedDay = signal<Date>(new Date());

  detailMeal = signal<Meal | null>(null);
  detailRecipe = signal<Recipe | null>(null);
  loadingDetail = signal(false);

  pickerOpen = signal(false);
  pickerSlot = signal<SlotRef | null>(null);

  // ─── Derived view state ───────────────────────────────────────────────────

  weekDays = computed(() => Array.from({ length: 7 }, (_, i) => addDays(this.currentWeekStart(), i)));
  weekRangeLabel = computed(() => formatWeekRange(this.currentWeekStart()));
  isCurrentWeek = computed(() => toISODate(this.currentWeekStart()) === toISODate(getThisMonday()));

  private readonly meals = computed(() => this.weeklyPlan()?.meals ?? []);
  private readonly plannedTypes = computed(() => new Set(this.meals().map(m => m.mealType)));

  private readonly rowSplit = computed(() =>
    visibleMealRows(this.settings.activeMealTypes(), this.plannedTypes()),
  );
  mealRows = computed(() => this.rowSplit().rows);
  /** Slots switched off in settings that still hold meals in this week. */
  reappearedRows = computed(() =>
    this.rowSplit().extraTypes.map(type => MEAL_ROWS.find(r => r.type === type)!.label),
  );

  mealGrid = computed(() => {
    const map = new Map<string, Meal>();
    for (const meal of this.meals()) map.set(`${meal.date.slice(0, 10)}|${meal.mealType}`, meal);
    return map;
  });

  private readonly recipesById = computed(() => new Map(this.recipes().map(r => [r.id, r])));

  private readonly pantryMap = computed(() => {
    const map = new Map<string, PantryItem>();
    for (const item of this.pantryItems()) if (item.ingredientId) map.set(item.ingredientId, item);
    return map;
  });

  availability = computed(() => {
    const pantry = this.pantryMap();
    const map = new Map<string, SlotAvailability>();
    for (const recipe of this.recipes()) map.set(recipe.id, slotAvailability(recipe, pantry));
    return map;
  });

  needs = computed<WeekNeed[]>(() =>
    computeWeekNeeds(this.meals(), this.recipesById(), this.pantryMap(), this.listedIngredientIds()),
  );

  todayInWeek = computed(() => this.weekDays().some(isToday));

  nextMeal = computed<NextMealView | null>(() => {
    if (!this.todayInWeek()) return null;
    const found = findNextMeal(this.meals(), MEAL_ROWS, new Date());
    if (!found) return null;
    return {
      meal: found.meal,
      slotLabel: found.row.label,
      time: `${String(MEAL_HOURS[found.row.type]).padStart(2, '0')}:00`,
      availability: this.availability().get(found.meal.recipeId) ?? { level: 'none', missing: 0, total: 0 },
    };
  });

  /** Bumped to force a reload of the same week after a failed mutation. */
  private readonly reloadPlan = signal(0);

  constructor() {
    combineLatest([toObservable(this.currentWeekStart), toObservable(this.reloadPlan)])
      .pipe(
        switchMap(([date]) => {
          this.loadingPlan.set(true);
          return this.mealPlans.getWeek(toISODate(date)).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(plan => {
        this.weeklyPlan.set(plan);
        this.loadingPlan.set(false);
      });

    forkJoin({
      recipes: this.recipesService.getAll().pipe(catchError(() => of([] as Recipe[]))),
      pantryItems: this.pantryService.getAll().pipe(catchError(() => of([] as PantryItem[]))),
      listItems: this.shoppingList.getAll().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed())
      .subscribe(({ recipes, pantryItems, listItems }) => {
        this.recipes.set(recipes);
        this.pantryItems.set(pantryItems);
        this.setListedIds(listItems);
        this.loadingContext.set(false);
      });
  }

  // ─── Week navigation ──────────────────────────────────────────────────────

  prevWeek(): void { this.shiftWeek(-7); }
  nextWeek(): void { this.shiftWeek(7); }

  goToThisWeek(): void {
    this.calendarError.set('');
    this.currentWeekStart.set(getThisMonday());
    this.selectedDay.set(new Date());
  }

  private shiftWeek(days: number): void {
    this.calendarError.set('');
    this.currentWeekStart.update(d => addDays(d, days));
    this.selectedDay.update(d => addDays(d, days));
  }

  selectDay(day: Date): void { this.selectedDay.set(day); }

  // ─── Slot mutations ───────────────────────────────────────────────────────
  //
  // Every mutation writes the plan optimistically and, on failure, refetches the
  // week instead of restoring a snapshot. A snapshot taken before request A has
  // already absorbed the optimistic result of an in-flight request B, so
  // restoring it would silently drop B; and a partially applied move would leave
  // the UI disagreeing with the server. Refetching costs one GET on the error
  // path and is always right.

  openPicker(slot: SlotRef): void {
    this.pickerSlot.set(slot);
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
    this.pickerSlot.set(null);
  }

  assignRecipe(recipe: Recipe): void {
    const slot = this.pickerSlot();
    if (!slot) return;
    this.closePicker();
    this.putMeal(this.optimisticMeal(slot, recipe));
    this.mealPlans
      .upsertMeal({ ...slot, recipeId: recipe.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: meal => this.putMeal(meal),
        error: () => this.failMutation('No se pudo asignar la receta. Inténtalo de nuevo.'),
      });
  }

  removeSlot(slot: SlotRef): void {
    this.dropMeal(slot.date, slot.mealType);
    this.mealPlans
      .removeMeal(slot)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.failMutation('No se pudo eliminar la comida. Inténtalo de nuevo.'),
      });
  }

  /** Stands in for the persisted row until the server answers with the real one. */
  private optimisticMeal(slot: SlotRef, recipe: Recipe): Meal {
    return {
      id: `pending:${slot.date}|${slot.mealType}`,
      date: slot.date,
      mealType: slot.mealType,
      recipeId: recipe.id,
      recipe: {
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl,
        prepTime: recipe.prepTime,
        servings: recipe.servings,
      },
    };
  }

  private failMutation(message: string): void {
    this.calendarError.set(message);
    this.reloadPlan.update(n => n + 1);
  }

  /** Drag between cells. An occupied target swaps, an empty one just moves. */
  moveMeal({ from, to }: MoveRequest): void {
    const grid = this.mealGrid();
    const source = grid.get(`${from.date}|${from.mealType}`);
    if (!source) return;
    const target = grid.get(`${to.date}|${to.mealType}`);

    this.weeklyPlan.update(plan => {
      if (!plan) return plan;
      const rest = plan.meals.filter(
        m => !this.isSlot(m, from) && !this.isSlot(m, to),
      );
      const moved: Meal[] = [{ ...source, date: to.date, mealType: to.mealType }];
      if (target) moved.push({ ...target, date: from.date, mealType: from.mealType });
      return { ...plan, meals: [...rest, ...moved] };
    });

    // The two slots are always distinct, so the writes cannot collide on the
    // (user, date, mealType) unique constraint and can run in parallel.
    // ponytail: a move is two requests, so one half can land while the other
    // fails. The error path refetches rather than guessing, which shows whatever
    // actually persisted. A transactional move endpoint would make it atomic.
    const swapBack = target
      ? this.mealPlans.upsertMeal({ ...from, recipeId: target.recipeId })
      : this.mealPlans.removeMeal(from);

    forkJoin([this.mealPlans.upsertMeal({ ...to, recipeId: source.recipeId }), swapBack])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // Adopt the persisted rows so the local plan does not keep the ids the
        // meals had in their previous slots.
        next: ([movedMeal, swappedMeal]) => {
          this.putMeal(movedMeal);
          if (target) this.putMeal(swappedMeal as Meal);
        },
        error: () => this.failMutation('No se pudo mover la comida. Inténtalo de nuevo.'),
      });
  }

  private isSlot(meal: Meal, slot: SlotRef): boolean {
    return meal.date.slice(0, 10) === slot.date && meal.mealType === slot.mealType;
  }

  private putMeal(meal: Meal): void {
    this.weeklyPlan.update(plan =>
      !plan
        ? plan
        : {
            ...plan,
            meals: [
              ...plan.meals.filter(
                m => !this.isSlot(m, { date: meal.date.slice(0, 10), mealType: meal.mealType }),
              ),
              meal,
            ],
          },
    );
  }

  private dropMeal(date: string, mealType: MealType): void {
    this.weeklyPlan.update(plan =>
      !plan ? plan : { ...plan, meals: plan.meals.filter(m => !this.isSlot(m, { date, mealType })) },
    );
  }

  // ─── Detail modal ─────────────────────────────────────────────────────────

  openDetail(meal: Meal): void {
    this.detailMeal.set(meal);
    this.detailRecipe.set(null);
    this.loadingDetail.set(true);
    this.recipesService
      .getOne(meal.recipe.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => { this.detailRecipe.set(r); this.loadingDetail.set(false); },
        error: () => this.loadingDetail.set(false),
      });
  }

  closeDetail(): void {
    this.detailMeal.set(null);
    this.detailRecipe.set(null);
    this.loadingDetail.set(false);
  }

  onDetailSwitchRecipe(slot: SlotRef): void {
    this.closeDetail();
    this.openPicker(slot);
  }

  onDetailRemoved(slot: SlotRef): void {
    this.closeDetail();
    this.removeSlot(slot);
  }

  // ─── Shopping list module ─────────────────────────────────────────────────

  addNeedsToList(needs: WeekNeed[]): void {
    if (needs.length === 0 || this.addingToList()) return;
    this.addingToList.set(true);
    forkJoin(
      needs.map(need =>
        this.shoppingList.create({
          name: need.name,
          unit: need.unit,
          ingredientId: need.ingredientId,
        }),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.listedIngredientIds.update(
            ids => new Set([...ids, ...needs.map(n => n.ingredientId)]),
          );
          this.addingToList.set(false);
        },
        error: () => {
          this.addingToList.set(false);
          this.calendarError.set('No se pudo añadir todo a la lista. Inténtalo de nuevo.');
        },
      });
  }

  private setListedIds(items: { ingredientId: string | null }[]): void {
    this.listedIngredientIds.set(
      new Set(items.map(i => i.ingredientId).filter((id): id is string => !!id)),
    );
  }
}
