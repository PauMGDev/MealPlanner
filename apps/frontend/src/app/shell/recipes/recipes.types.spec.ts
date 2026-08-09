import { availabilitySummary, computeAvailability, isMissing } from './recipes.types';
import type { Recipe } from '../../core/services/recipes.service';
import type { PantryItem } from '../../core/services/pantry.service';

const makeRecipe = (ingredientIds: string[]): Recipe => ({
  id: 'r1', name: 'Test', description: null, imageUrl: null,
  prepTime: 10, servings: 2, steps: [], createdAt: '', updatedAt: '',
  recipeIngredients: ingredientIds.map(id => ({
    id: `ri-${id}`,
    ingredientId: id,
    quantity: 1,
    ingredient: { id, name: id, unit: 'g', caloriesPer100g: null },
  })),
});

const makePantryEntry = (id: string, quantity: number): [string, PantryItem] => [
  id,
  {
    id: `p-${id}`, name: id, quantity, unit: 'g', ingredientId: id,
    expiresAt: null, categoryId: null, category: null, createdAt: '', updatedAt: '',
  },
];

describe('computeAvailability', () => {
  it('returns none for a recipe with no ingredients', () => {
    const result = computeAvailability(makeRecipe([]), new Map());
    expect(result.status).toBe('none');
  });

  it('returns available when all ingredients have stock', () => {
    const pantryMap = new Map([makePantryEntry('a', 5), makePantryEntry('b', 3)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('available');
  });

  it('returns missing when an ingredient is absent from pantry', () => {
    const pantryMap = new Map([makePantryEntry('a', 5)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('missing');
  });

  it('returns depleted when all known ingredients have quantity 0', () => {
    const pantryMap = new Map([makePantryEntry('a', 0), makePantryEntry('b', 0)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('depleted');
  });

  it('prefers missing over depleted when both conditions exist', () => {
    const pantryMap = new Map([makePantryEntry('a', 0)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('missing');
  });

  it('sets individual ingredient statuses correctly', () => {
    const pantryMap = new Map([makePantryEntry('a', 5), makePantryEntry('b', 0)]);
    const result = computeAvailability(makeRecipe(['a', 'b', 'c']), pantryMap);
    expect(result.ingredientStatuses.get('a')).toBe('available');
    expect(result.ingredientStatuses.get('b')).toBe('depleted');
    expect(result.ingredientStatuses.get('c')).toBe('missing');
  });
});

describe('availabilitySummary', () => {
  const summaryFor = (ingredientIds: string[], pantry: [string, number][]) =>
    availabilitySummary(computeAvailability(makeRecipe(ingredientIds), new Map(pantry.map(([id, q]) => makePantryEntry(id, q)))));

  it('never spends a colour on the all-in-stock case', () => {
    expect(summaryFor(['a', 'b'], [['a', 5], ['b', 3]])).toEqual({
      dot: 'lp-dot lp-dot--none',
      text: '2/2 en despensa',
    });
  });

  it('stays neutral when the recipe has no linked ingredients', () => {
    expect(summaryFor([], [])).toEqual({ dot: 'lp-dot lp-dot--none', text: 'Sin ingredientes' });
  });

  it('flags a single gap in amber with an actionable line', () => {
    expect(summaryFor(['a', 'b'], [['a', 5]])).toEqual({
      dot: 'lp-dot lp-dot--warn',
      text: 'Te falta 1',
    });
  });

  it('escalates to red once more than half is missing', () => {
    expect(summaryFor(['a', 'b', 'c'], [['a', 5]])).toEqual({
      dot: 'lp-dot lp-dot--danger',
      text: 'Te faltan 2',
    });
  });

  it('counts depleted pantry items as missing', () => {
    expect(summaryFor(['a', 'b'], [['a', 5], ['b', 0]]).text).toBe('Te falta 1');
  });
});

describe('isMissing', () => {
  it('treats only available as the quiet default', () => {
    expect(isMissing('available')).toBe(false);
    expect(isMissing('depleted')).toBe(true);
    expect(isMissing('missing')).toBe(true);
    expect(isMissing(undefined)).toBe(true);
  });
});
