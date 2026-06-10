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

export function dotClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'bg-green-400';
  if (status === 'depleted') return 'bg-yellow-400';
  return 'bg-red-400';
}

export function accentBarClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'bg-green-500/60';
  if (status === 'depleted') return 'bg-yellow-500/60';
  if (status === 'missing') return 'bg-red-500/40';
  return 'bg-white/[0.04]';
}

export function cardBorderClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'border-green-500/30 hover:border-green-500/50';
  if (status === 'depleted') return 'border-yellow-500/30 hover:border-yellow-500/50';
  if (status === 'missing') return 'border-red-500/20 hover:border-red-500/30';
  return 'border-white/[0.06] hover:border-white/10';
}

export function cardGradientStyle(status: AvailabilityStatus): string {
  if (status === 'available') return 'background: linear-gradient(135deg, #0f1e28 0%, #0d2018 100%)';
  if (status === 'depleted') return 'background: linear-gradient(135deg, #1a1a0a 0%, #1e1a06 100%)';
  if (status === 'missing') return 'background: linear-gradient(135deg, #1e0f0f 0%, #200c0c 100%)';
  return 'background: linear-gradient(135deg, #0f1628 0%, #131a2e 100%)';
}

export function statusLabel(status: AvailabilityStatus): string {
  if (status === 'available') return 'Listo para cocinar';
  if (status === 'depleted') return 'Ingredientes agotados';
  if (status === 'missing') return 'Faltan ingredientes';
  return 'Sin ingredientes vinculados';
}

export function statusTextClass(status: AvailabilityStatus): string {
  if (status === 'available') return 'text-green-400';
  if (status === 'depleted') return 'text-yellow-400';
  if (status === 'missing') return 'text-red-400';
  return 'text-mm-text3';
}
