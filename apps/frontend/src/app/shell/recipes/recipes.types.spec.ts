import { computeAvailability } from './recipes.types';
import type { Recipe } from '../../core/services/recipes.service';
import type { PantryItem } from '../../core/services/pantry.service';

const makeRecipe = (ingredientIds: string[]): Recipe => ({
  id: 'r1', name: 'Test', description: null, imageUrl: null,
  recipeIngredients: ingredientIds.map(id => ({ ingredientId: id, ingredientName: id, quantity: 1, unit: 'g' })),
} as Recipe);

const makePantryEntry = (id: string, quantity: number): [string, PantryItem] => [
  id,
  { id: `p-${id}`, name: id, quantity, unit: 'g', ingredientId: id } as PantryItem,
];

describe('computeAvailability', () => {
  it('returns none for a recipe with no ingredients', () => {
    const result = computeAvailability(makeRecipe([]), new Map());
    expect(result.status).toBe('none');
    expect(result.availableSummary).toBe('');
  });

  it('returns available when all ingredients have stock', () => {
    const pantryMap = new Map([makePantryEntry('a', 5), makePantryEntry('b', 3)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('available');
    expect(result.availableSummary).toBe('2/2 en despensa');
  });

  it('returns missing when an ingredient is absent from pantry', () => {
    const pantryMap = new Map([makePantryEntry('a', 5)]);
    const result = computeAvailability(makeRecipe(['a', 'b']), pantryMap);
    expect(result.status).toBe('missing');
    expect(result.availableSummary).toBe('1/2 en despensa');
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
