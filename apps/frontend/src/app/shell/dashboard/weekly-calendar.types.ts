import type { Meal, MealType } from '../../core/services/meal-plans.service';
import type { PantryItem } from '../../core/services/pantry.service';
import type { Recipe } from '../../core/services/recipes.service';
import { computeAvailability } from '../recipes/recipes.types';

export type MealRowDef = {
  type: MealType;
  label: string;
};

/** Chronological order. It is the row order of the matrix and never varies. */
export const MEAL_ROWS: MealRowDef[] = [
  { type: 'BREAKFAST', label: 'Desayuno' },
  { type: 'ALMUERZO', label: 'Almuerzo' },
  { type: 'LUNCH', label: 'Comida' },
  { type: 'SNACK', label: 'Merienda' },
  { type: 'DINNER', label: 'Cena' },
];

/** Approximate serving hour per slot, used to pick the next meal of the day. */
export const MEAL_HOURS: Record<MealType, number> = {
  BREAKFAST: 8,
  ALMUERZO: 11,
  LUNCH: 14,
  SNACK: 18,
  DINNER: 21,
};

export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// ─── Availability semaphore ─────────────────────────────────────────────────

export type AvailabilityLevel = 'ok' | 'warn' | 'danger' | 'none';

export interface SlotAvailability {
  level: AvailabilityLevel;
  /** Ingredients of the recipe that are absent or depleted in the pantry. */
  missing: number;
  total: number;
}

/**
 * Green when the whole recipe is in the pantry, amber when something is short,
 * red when more than half of it is. `none` means the recipe has no linked
 * ingredients, so nothing can be said about it.
 */
export function slotAvailability(
  recipe: Recipe,
  pantryMap: Map<string, PantryItem>,
): SlotAvailability {
  const { ingredientStatuses } = computeAvailability(recipe, pantryMap);
  const total = ingredientStatuses.size;
  if (total === 0) return { level: 'none', missing: 0, total: 0 };
  const missing = [...ingredientStatuses.values()].filter(s => s !== 'available').length;
  if (missing === 0) return { level: 'ok', missing, total };
  return { level: missing / total > 0.5 ? 'danger' : 'warn', missing, total };
}

/** Complete literal, never concatenated: Tailwind only sees whole class names. */
export function dotClass(level: AvailabilityLevel): string {
  if (level === 'ok') return 'lp-dot lp-dot--ok';
  if (level === 'warn') return 'lp-dot lp-dot--warn';
  if (level === 'danger') return 'lp-dot lp-dot--danger';
  return 'lp-dot lp-dot--none';
}

/** The semaphore is colour plus text, never colour alone. */
export function availabilityLabel(availability: SlotAvailability): string {
  if (availability.level === 'none') return 'Sin ingredientes vinculados';
  if (availability.level === 'ok') return 'Todo en despensa';
  return availability.missing === 1
    ? 'Falta 1 ingrediente'
    : `Faltan ${availability.missing} ingredientes`;
}

// ─── Dates ──────────────────────────────────────────────────────────────────

export function getThisMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function formatWeekRange(monday: Date): string {
  const end = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} - ${fmt(end)}, ${monday.getFullYear()}`;
}

/** "viernes 7 de agosto". Sentence case is applied by the template, not here. */
export function formatDayLong(d: Date): string {
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
  const rest = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  return `${weekday} ${rest}`;
}

export function formatSlotDate(dateStr: string): string {
  const [y, mo, d] = dateStr.slice(0, 10).split('-').map(Number);
  return formatDayLong(new Date(y, mo - 1, d, 12));
}

// ─── Dashboard modules ──────────────────────────────────────────────────────

/** One ingredient the visible week needs and the pantry cannot cover. */
export interface WeekNeed {
  ingredientId: string;
  name: string;
  unit: string;
  recipeNames: string[];
}

export interface NextMealView {
  meal: Meal;
  slotLabel: string;
  time: string;
  availability: SlotAvailability;
}

/**
 * Ingredients used by the week's planned recipes that are missing or depleted,
 * excluding whatever is already on the shopping list. Names sorted so the top
 * three shown in the module are stable between renders.
 */
export function computeWeekNeeds(
  meals: readonly Meal[],
  recipesById: ReadonlyMap<string, Recipe>,
  pantryMap: Map<string, PantryItem>,
  alreadyListed: ReadonlySet<string>,
): WeekNeed[] {
  const needs = new Map<string, WeekNeed>();
  for (const meal of meals) {
    const recipe = recipesById.get(meal.recipeId);
    if (!recipe) continue;
    const { ingredientStatuses } = computeAvailability(recipe, pantryMap);
    for (const ri of recipe.recipeIngredients) {
      if (ingredientStatuses.get(ri.ingredientId) === 'available') continue;
      if (alreadyListed.has(ri.ingredientId)) continue;
      const need = needs.get(ri.ingredientId) ?? {
        ingredientId: ri.ingredientId,
        name: ri.ingredient.name,
        unit: ri.ingredient.unit,
        recipeNames: [],
      };
      if (!need.recipeNames.includes(recipe.name)) need.recipeNames.push(recipe.name);
      needs.set(ri.ingredientId, need);
    }
  }
  return [...needs.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** The meal of today whose slot has not passed yet, or the last one if all have. */
export function findNextMeal(
  meals: readonly Meal[],
  rows: readonly MealRowDef[],
  now: Date,
): { meal: Meal; row: MealRowDef } | null {
  const today = toISODate(now);
  const todays = rows
    .map(row => ({ row, meal: meals.find(m => m.date.slice(0, 10) === today && m.mealType === row.type) }))
    .filter((entry): entry is { row: MealRowDef; meal: Meal } => !!entry.meal);
  if (todays.length === 0) return null;
  const upcoming = todays.find(entry => MEAL_HOURS[entry.row.type] >= now.getHours());
  return upcoming ?? todays[todays.length - 1];
}

// ─── Matrix rows ────────────────────────────────────────────────────────────

/**
 * Rows are the slots the user planned for, plus any slot that was switched off
 * while it still holds meals in the visible week: those meals are not deleted,
 * so the row comes back rather than hiding data.
 */
export function visibleMealRows(
  activeTypes: readonly MealType[],
  plannedTypes: ReadonlySet<MealType>,
): { rows: MealRowDef[]; extraTypes: MealType[] } {
  const rows = MEAL_ROWS.filter(r => activeTypes.includes(r.type) || plannedTypes.has(r.type));
  const extraTypes = rows.filter(r => !activeTypes.includes(r.type)).map(r => r.type);
  return { rows, extraTypes };
}
