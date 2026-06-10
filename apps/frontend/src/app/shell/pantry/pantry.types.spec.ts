import { buildSaveIntent, findExistingMatch } from './pantry.types';
import type { PantryItem } from '../../core/services/pantry.service';

const makeItem = (overrides: Partial<PantryItem>): PantryItem => ({
  id: 'p1', name: 'Tomate', quantity: 2, unit: 'unidades',
  expiresAt: null, categoryId: null, category: null, ingredientId: null,
  createdAt: '', updatedAt: '',
  ...overrides,
});

describe('findExistingMatch', () => {
  it('returns null when the name is empty', () => {
    expect(findExistingMatch([makeItem({ name: 'Tomate' })], '  ', null)).toBeNull();
  });

  it('matches by catalog id when provided', () => {
    const item = makeItem({ id: 'p1', name: 'Tomate', ingredientId: 'ing-1' });
    const result = findExistingMatch([item, makeItem({ id: 'p2', name: 'Otro', ingredientId: 'ing-2' })], 'Tomate', 'ing-1');
    expect(result).toBe(item);
  });

  it('matches by name case-insensitively when no catalog id', () => {
    const item = makeItem({ id: 'p1', name: 'Tomate' });
    const result = findExistingMatch([item], 'tomate', null);
    expect(result).toBe(item);
  });

  it('returns null when nothing matches', () => {
    const result = findExistingMatch([makeItem({ name: 'Tomate' })], 'Cebolla', null);
    expect(result).toBeNull();
  });
});

describe('buildSaveIntent', () => {
  const baseForm = { name: 'Tomate', quantity: 3, unit: 'unidades', categoryId: '', expiresAt: '' };

  it('returns an update intent with the full dto when editing', () => {
    const result = buildSaveIntent({
      editingItemId: 'p1',
      existingMatch: null,
      form: { ...baseForm, categoryId: 'cat-1', expiresAt: '2026-07-01' },
      catalogId: null,
    });
    expect(result).toEqual({
      kind: 'update',
      id: 'p1',
      dto: { name: 'Tomate', quantity: 3, unit: 'unidades', categoryId: 'cat-1', expiresAt: '2026-07-01' },
    });
  });

  it('omits empty categoryId and expiresAt when editing', () => {
    const result = buildSaveIntent({ editingItemId: 'p1', existingMatch: null, form: baseForm, catalogId: null });
    expect(result.kind).toBe('update');
    expect(result).toMatchObject({ dto: { categoryId: undefined, expiresAt: undefined } });
  });

  it('sums the quantity into an existing match instead of creating a new item', () => {
    const existing = makeItem({ id: 'p9', quantity: 5 });
    const result = buildSaveIntent({ editingItemId: null, existingMatch: existing, form: baseForm, catalogId: null });
    expect(result).toEqual({ kind: 'update', id: 'p9', dto: { quantity: 8 } });
  });

  it('creates a new item with only the provided optional fields', () => {
    const result = buildSaveIntent({
      editingItemId: null,
      existingMatch: null,
      form: { ...baseForm, categoryId: 'cat-1' },
      catalogId: 'ing-1',
    });
    expect(result).toEqual({
      kind: 'create',
      dto: { name: 'Tomate', quantity: 3, unit: 'unidades', categoryId: 'cat-1', ingredientId: 'ing-1' },
    });
  });

  it('creates a new item without optional fields when none are set', () => {
    const result = buildSaveIntent({ editingItemId: null, existingMatch: null, form: baseForm, catalogId: null });
    expect(result).toEqual({ kind: 'create', dto: { name: 'Tomate', quantity: 3, unit: 'unidades' } });
  });
});
