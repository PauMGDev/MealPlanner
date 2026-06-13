import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MealPlansService } from '../../core/services/meal-plans.service';
import { PantryService } from '../../core/services/pantry.service';
import { RecipesService } from '../../core/services/recipes.service';
import { RecipeCardsIconComponent } from '../../shared/icons/recipe-cards-icon.component';
import { WeeklyCalendarComponent } from './weekly-calendar.component';
import { DAY_LABELS, MEAL_ROWS, addDays, getThisMonday, toISODate } from './weekly-calendar.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WeeklyCalendarComponent, RecipeCardsIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly recipesService = inject(RecipesService);
  private readonly pantryService = inject(PantryService);
  private readonly mealPlansService = inject(MealPlansService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dayLabels = DAY_LABELS;
  readonly totalWeekSlots = MEAL_ROWS.length * 7;

  loadingRecipes = signal(true);
  loadingPantry = signal(true);
  loadingMeals = signal(true);
  recipeCount = signal(0);
  pantryCount = signal(0);
  depletedCount = signal(0);
  mealsThisWeek = signal(0);
  mealsByDay = signal<boolean[]>(Array(7).fill(false));

  totalPantryItems = computed(() => this.pantryCount() + this.depletedCount());

  ngOnInit(): void {
    this.recipesService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.recipeCount.set(r.length); this.loadingRecipes.set(false); },
      error: () => this.loadingRecipes.set(false),
    });
    this.pantryService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => {
        this.pantryCount.set(items.filter(i => i.quantity > 0).length);
        this.depletedCount.set(items.filter(i => i.quantity === 0).length);
        this.loadingPantry.set(false);
      },
      error: () => this.loadingPantry.set(false),
    });
    const monday = getThisMonday();
    this.mealPlansService.getWeek(toISODate(monday)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: plan => {
        this.mealsThisWeek.set(plan.meals.length);
        const plannedDates = new Set(plan.meals.map(m => m.date.slice(0, 10)));
        this.mealsByDay.set(Array.from({ length: 7 }, (_, i) => plannedDates.has(toISODate(addDays(monday, i)))));
        this.loadingMeals.set(false);
      },
      error: () => this.loadingMeals.set(false),
    });
  }
}
