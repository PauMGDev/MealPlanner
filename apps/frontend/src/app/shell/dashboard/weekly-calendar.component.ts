import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { type Meal, type MealType, type WeeklyPlan, MealPlansService } from '../../core/services/meal-plans.service';
import { type Recipe, RecipesService } from '../../core/services/recipes.service';
import { MEAL_ROWS, STORAGE_KEY, addDays, formatWeekRange, getThisMonday, loadVisibleMeals, toISODate } from './weekly-calendar.types';
import { CalendarHeaderComponent } from './components/calendar-header.component';
import { CalendarGridComponent } from './components/calendar-grid.component';
import { MealDetailModalComponent } from './components/meal-detail-modal.component';
import { RecipePickerModalComponent } from './components/recipe-picker-modal.component';

@Component({
  selector: 'app-weekly-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarHeaderComponent, CalendarGridComponent, MealDetailModalComponent, RecipePickerModalComponent],
  templateUrl: './weekly-calendar.component.html',
  styleUrl: './weekly-calendar.component.css',
})
export class WeeklyCalendarComponent {
  private readonly mealPlans = inject(MealPlansService);
  private readonly recipesService = inject(RecipesService);
  private readonly destroyRef = inject(DestroyRef);

  currentWeekStart = signal<Date>(getThisMonday());
  weeklyPlan = signal<WeeklyPlan | null>(null);
  loadingPlan = signal(true);
  visibleMealTypes = signal<MealType[]>(loadVisibleMeals() ?? MEAL_ROWS.map(r => r.type));
  calendarError = signal('');

  detailMeal = signal<Meal | null>(null);
  detailRecipe = signal<Recipe | null>(null);
  loadingDetail = signal(false);

  pickerOpen = signal(false);
  pickerSlot = signal<{ date: string; mealType: MealType } | null>(null);
  pickerRecipes = signal<Recipe[]>([]);
  loadingPickerRecipes = signal(false);
  private readonly pickerRecipesLoaded = signal(false);

  readonly allMealRows = MEAL_ROWS;
  weekDays = computed(() => Array.from({ length: 7 }, (_, i) => addDays(this.currentWeekStart(), i)));
  filteredMealRows = computed(() => MEAL_ROWS.filter(r => this.visibleMealTypes().includes(r.type)));
  weekRangeLabel = computed(() => formatWeekRange(this.currentWeekStart()));
  isCurrentWeek = computed(() => toISODate(this.currentWeekStart()) === toISODate(getThisMonday()));
  mealGrid = computed(() => {
    const map = new Map<string, Meal>();
    for (const meal of (this.weeklyPlan()?.meals ?? [])) {
      map.set(`${meal.date.slice(0, 10)}|${meal.mealType}`, meal);
    }
    return map;
  });

  constructor() {
    toObservable(this.currentWeekStart).pipe(
      switchMap(date => {
        this.loadingPlan.set(true);
        this.calendarError.set('');
        return this.mealPlans.getWeek(toISODate(date)).pipe(catchError(() => of(null)));
      }),
      takeUntilDestroyed(),
    ).subscribe(plan => {
      this.weeklyPlan.set(plan);
      this.loadingPlan.set(false);
    });
  }

  prevWeek(): void { this.currentWeekStart.update(d => addDays(d, -7)); }
  nextWeek(): void { this.currentWeekStart.update(d => addDays(d, 7)); }
  goToThisWeek(): void { this.currentWeekStart.set(getThisMonday()); }

  toggleMealType(type: MealType): void {
    this.visibleMealTypes.update(cur => {
      const next = cur.includes(type) ? cur.filter(t => t !== type) : [...cur, type];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }

  openDetail(meal: Meal): void {
    this.detailMeal.set(meal);
    this.detailRecipe.set(null);
    this.loadingDetail.set(true);
    this.recipesService.getOne(meal.recipe.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.detailRecipe.set(r); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }

  closeDetail(): void {
    this.detailMeal.set(null);
    this.detailRecipe.set(null);
    this.loadingDetail.set(false);
  }

  onDetailSwitchRecipe(s: { date: string; mealType: MealType }): void { this.closeDetail(); this.openPicker(s.date, s.mealType); }

  onDetailRemoved(slot: { date: string; mealType: MealType }): void {
    this.closeDetail();
    const snapshot = this.weeklyPlan();
    this.removeMealFromPlan(slot.date, slot.mealType);
    this.mealPlans.removeMeal(slot).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => { this.weeklyPlan.set(snapshot); this.calendarError.set('No se pudo eliminar la comida. Inténtalo de nuevo.'); },
    });
  }

  openPicker(date: string, mealType: MealType): void {
    this.pickerSlot.set({ date, mealType });
    this.pickerOpen.set(true);
    if (!this.pickerRecipesLoaded()) {
      this.loadingPickerRecipes.set(true);
      this.recipesService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: r => { this.pickerRecipes.set(r); this.pickerRecipesLoaded.set(true); this.loadingPickerRecipes.set(false); },
        error: () => this.loadingPickerRecipes.set(false),
      });
    }
  }

  closePicker(): void { this.pickerOpen.set(false); this.pickerSlot.set(null); }

  assignRecipe(recipe: Recipe): void {
    const slot = this.pickerSlot();
    if (!slot) return;
    this.mealPlans.upsertMeal({ ...slot, recipeId: recipe.id }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: meal => {
        this.weeklyPlan.update(p => !p ? p : {
          ...p, meals: [...p.meals.filter(m => !(m.date.slice(0, 10) === slot.date && m.mealType === slot.mealType)), meal],
        });
        this.closePicker();
      },
      error: () => { this.calendarError.set('No se pudo asignar la receta. Inténtalo de nuevo.'); this.closePicker(); },
    });
  }

  removeSlot(event: { date: string; mealType: MealType }): void {
    const snapshot = this.weeklyPlan();
    this.removeMealFromPlan(event.date, event.mealType);
    this.mealPlans.removeMeal(event).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => { this.weeklyPlan.set(snapshot); this.calendarError.set('No se pudo eliminar la comida. Inténtalo de nuevo.'); },
    });
  }

  private removeMealFromPlan(date: string, mealType: MealType): void {
    this.weeklyPlan.update(plan => {
      if (!plan) return plan;
      return { ...plan, meals: plan.meals.filter(m => !(m.date.slice(0, 10) === date && m.mealType === mealType)) };
    });
  }
}
