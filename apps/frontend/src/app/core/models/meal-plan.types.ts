export type MealType = 'BREAKFAST' | 'ALMUERZO' | 'LUNCH' | 'SNACK' | 'DINNER';

export interface MealRecipe {
  id: string;
  name: string;
  imageUrl: string | null;
  prepTime: number;
  servings: number;
}

export interface Meal {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  recipe: MealRecipe;
}

export interface WeeklyPlan {
  weekStart: string;
  meals: Meal[];
}

export interface UpsertMealDto {
  date: string;
  mealType: MealType;
  recipeId: string;
}

export interface RemoveMealDto {
  date: string;
  mealType: MealType;
}
