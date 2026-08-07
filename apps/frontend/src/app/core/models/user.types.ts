import type { MealType } from './meal-plan.types';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  /** Meal slots the user plans for: the rows of the weekly matrix. */
  activeMealTypes: MealType[];
}

/** Mirrors the Prisma default, used until the profile has loaded. */
export const DEFAULT_ACTIVE_MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

export const MIN_ACTIVE_MEAL_TYPES = 3;
export const MAX_ACTIVE_MEAL_TYPES = 5;
