import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { MealPlansService } from '../../core/services/meal-plans.service';
import { PantryService } from '../../core/services/pantry.service';
import { RecipesService } from '../../core/services/recipes.service';
import { WeeklyCalendarComponent } from './weekly-calendar.component';
import { getThisMonday, toISODate } from './weekly-calendar.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeeklyCalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly recipesService = inject(RecipesService);
  private readonly pantryService = inject(PantryService);
  private readonly mealPlansService = inject(MealPlansService);
  private readonly destroyRef = inject(DestroyRef);

  email = computed(() => this.auth.user()?.email ?? '');

  loadingRecipes = signal(true);
  loadingPantry = signal(true);
  loadingMeals = signal(true);
  recipeCount = signal(0);
  pantryCount = signal(0);
  depletedCount = signal(0);
  mealsThisWeek = signal(0);

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
    this.mealPlansService.getWeek(toISODate(getThisMonday())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: plan => { this.mealsThisWeek.set(plan.meals.length); this.loadingMeals.set(false); },
      error: () => this.loadingMeals.set(false),
    });
  }
}
