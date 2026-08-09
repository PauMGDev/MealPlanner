import type { PantryItem } from '../../core/services/pantry.service';
import type { Recipe } from '../../core/services/recipes.service';
import type { IngredientResult } from '../../core/services/ingredients.service';

export type AvailabilityStatus = 'available' | 'depleted' | 'missing' | 'none';

export interface PendingIngredient {
  ingredient: IngredientResult;
  quantity: number;
}

export interface RecipeAvailability {
  status: AvailabilityStatus;
  ingredientStatuses: ReadonlyMap<string, AvailabilityStatus>;
}

export function computeAvailability(recipe: Recipe, pantryMap: Map<string, PantryItem>): RecipeAvailability {
  const ingredientStatuses = new Map<string, AvailabilityStatus>();
  for (const ri of recipe.recipeIngredients) {
    const item = pantryMap.get(ri.ingredientId);
    const s: AvailabilityStatus = !item ? 'missing' : item.quantity > 0 ? 'available' : 'depleted';
    ingredientStatuses.set(ri.ingredientId, s);
  }
  const statuses = [...ingredientStatuses.values()];
  let status: AvailabilityStatus = 'none';
  if (statuses.length > 0) {
    if (statuses.every(s => s === 'available')) status = 'available';
    else if (statuses.some(s => s === 'missing')) status = 'missing';
    else status = 'depleted';
  }
  return { status, ingredientStatuses };
}

/**
 * Having an ingredient is the default state and carries no mark. Only what the
 * user has to act on is signalled, so `available` is the one quiet status.
 */
export function isMissing(status: AvailabilityStatus | undefined): boolean {
  return status !== 'available';
}

export interface AvailabilitySummary {
  /** Complete class literal, never concatenated: Tailwind only sees whole names. */
  dot: string;
  text: string;
}

/**
 * The single availability read of a recipe card: one dot plus one actionable
 * line. The all-in-stock case gets a neutral dot, because green is the default
 * and the system never spends a colour on it.
 */
export function availabilitySummary(availability: RecipeAvailability): AvailabilitySummary {
  const statuses = [...availability.ingredientStatuses.values()];
  const total = statuses.length;
  if (total === 0) return { dot: 'lp-dot lp-dot--none', text: 'Sin ingredientes' };

  const missing = statuses.filter(isMissing).length;
  if (missing === 0) return { dot: 'lp-dot lp-dot--none', text: `${total}/${total} en despensa` };

  return {
    dot: missing / total > 0.5 ? 'lp-dot lp-dot--danger' : 'lp-dot lp-dot--warn',
    text: missing === 1 ? 'Te falta 1' : `Te faltan ${missing}`,
  };
}
