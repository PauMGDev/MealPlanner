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
  availableSummary: string;
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
  const avail = statuses.filter(s => s === 'available').length;
  return {
    status,
    availableSummary: statuses.length > 0 ? `${avail}/${statuses.length} en despensa` : '',
    ingredientStatuses,
  };
}

/** Complete class literals, never concatenated: Tailwind only sees whole names. */
export function dotClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'lp-dot lp-dot--ok';
  if (status === 'depleted') return 'lp-dot lp-dot--warn';
  if (status === 'missing') return 'lp-dot lp-dot--danger';
  return 'lp-dot lp-dot--none';
}

export function accentBarClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'bg-lp-ok';
  if (status === 'depleted') return 'bg-lp-warn';
  if (status === 'missing') return 'bg-lp-danger';
  return 'bg-lp-line';
}

export function cardBorderClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'border-lp-ok/35 hover:border-lp-ok/60';
  if (status === 'depleted') return 'border-lp-warn/35 hover:border-lp-warn/60';
  if (status === 'missing') return 'border-lp-danger/25 hover:border-lp-danger/45';
  return 'border-lp-line hover:border-lp-ink-faint';
}

export function statusLabel(status: AvailabilityStatus): string {
  if (status === 'available') return 'Listo para cocinar';
  if (status === 'depleted') return 'Ingredientes agotados';
  if (status === 'missing') return 'Faltan ingredientes';
  return 'Sin ingredientes vinculados';
}

