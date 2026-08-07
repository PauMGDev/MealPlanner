import { describe, it, expect } from 'vitest';
import {
  MEAL_ROWS,
  availabilityLabel,
  dotClass,
  slotAvailability,
  visibleMealRows,
} from './weekly-calendar.types';
import type { MealType } from '../../core/services/meal-plans.service';
import type { PantryItem } from '../../core/services/pantry.service';
import type { Recipe } from '../../core/services/recipes.service';

const makeRecipe = (ingredientIds: string[]): Recipe =>
  ({
    id: 'r1',
    name: 'Test',
    recipeIngredients: ingredientIds.map(id => ({ ingredientId: id, quantity: 1 })),
  }) as Recipe;

const pantry = (entries: [string, number][]): Map<string, PantryItem> =>
  new Map(entries.map(([id, quantity]) => [id, { id, quantity } as PantryItem]));

describe('MEAL_ROWS', () => {
  it('defines the five meal types once, in chronological order', () => {
    const types = MEAL_ROWS.map(r => r.type);
    expect(new Set(types).size).toBe(types.length);
    expect(types).toEqual(['BREAKFAST', 'ALMUERZO', 'LUNCH', 'SNACK', 'DINNER']);
  });
});

describe('slotAvailability', () => {
  it('reports none when the recipe has no linked ingredients', () => {
    expect(slotAvailability(makeRecipe([]), pantry([])).level).toBe('none');
  });

  it('reports ok when every ingredient is in stock', () => {
    const result = slotAvailability(makeRecipe(['a', 'b']), pantry([['a', 2], ['b', 1]]));
    expect(result).toEqual({ level: 'ok', missing: 0, total: 2 });
  });

  it('reports warn when up to half of the ingredients are short', () => {
    const result = slotAvailability(makeRecipe(['a', 'b']), pantry([['a', 2], ['b', 0]]));
    expect(result).toEqual({ level: 'warn', missing: 1, total: 2 });
  });

  it('reports danger when more than half of the ingredients are short', () => {
    const result = slotAvailability(makeRecipe(['a', 'b', 'c']), pantry([['a', 2]]));
    expect(result).toEqual({ level: 'danger', missing: 2, total: 3 });
  });
});

describe('dotClass and availabilityLabel', () => {
  it('returns complete class literals per level', () => {
    expect(dotClass('ok')).toBe('lp-dot lp-dot--ok');
    expect(dotClass('warn')).toBe('lp-dot lp-dot--warn');
    expect(dotClass('danger')).toBe('lp-dot lp-dot--danger');
    expect(dotClass('none')).toBe('lp-dot lp-dot--none');
  });

  it('pairs every colour with a readable label', () => {
    expect(availabilityLabel({ level: 'ok', missing: 0, total: 3 })).toBe('Todo en despensa');
    expect(availabilityLabel({ level: 'warn', missing: 1, total: 3 })).toBe('Falta 1 ingrediente');
    expect(availabilityLabel({ level: 'danger', missing: 2, total: 3 })).toBe('Faltan 2 ingredientes');
  });
});

describe('visibleMealRows', () => {
  const active: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

  it('shows exactly the active slots when nothing else is planned', () => {
    const { rows, extraTypes } = visibleMealRows(active, new Set());
    expect(rows.map(r => r.type)).toEqual(active);
    expect(extraTypes).toEqual([]);
  });

  it('brings back a disabled slot that still holds meals, in chronological order', () => {
    const { rows, extraTypes } = visibleMealRows(active, new Set<MealType>(['SNACK']));
    expect(rows.map(r => r.type)).toEqual(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']);
    expect(extraTypes).toEqual(['SNACK']);
  });
});
