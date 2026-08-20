import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Meal, WeeklyPlan, UpsertMealDto, RemoveMealDto } from '../models/meal-plan.types';

export type { MealType, MealRecipe, Meal, WeeklyPlan, UpsertMealDto, RemoveMealDto } from '../models/meal-plan.types';

@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/meal-plans`;

  getWeek(weekStart: string) {
    return this.http.get<WeeklyPlan>(`${this.base}?weekStart=${weekStart}`);
  }

  upsertMeal(dto: UpsertMealDto) {
    return this.http.put<Meal>(`${this.base}/meals`, dto);
  }

  removeMeal(dto: RemoveMealDto) {
    return this.http.delete<void>(`${this.base}/meals`, { body: dto });
  }
}
