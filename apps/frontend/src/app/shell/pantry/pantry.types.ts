import type { IngredientResult } from '../../core/services/ingredients.service';
import type { CreatePantryItemDto, PantryItem } from '../../core/services/pantry.service';

export type DisplayItem = PantryItem & { virtual?: true };

export interface PantryGroup {
  id: string;
  name: string;
  items: DisplayItem[];
  isDepleted: boolean;
}

export function buildMergedItems(items: PantryItem[], catalog: IngredientResult[]): DisplayItem[] {
  const now = new Date().toISOString();
  const linkedIds = new Set(items.map(i => i.ingredientId).filter((id): id is string => !!id));
  const virtuals: DisplayItem[] = catalog
    .filter(ing => !linkedIds.has(ing.id))
    .map(ing => ({
      virtual: true as const,
      id: ing.id, name: ing.name, quantity: 0, unit: ing.unit,
      ingredientId: ing.id, categoryId: null, category: null,
      expiresAt: null, createdAt: now, updatedAt: now,
    }));
  return [...items, ...virtuals];
}

export function buildGroupedItems(merged: DisplayItem[]): PantryGroup[] {
  const inStock = merged.filter(i => i.quantity > 0);
  const depleted = merged.filter(i => i.quantity === 0);

  const catMap = new Map<string, PantryGroup>();
  for (const item of inStock) {
    const key = item.categoryId ?? '__none__';
    const name = item.category?.name ?? 'Sin categoría';
    if (!catMap.has(key)) catMap.set(key, { id: key, name, items: [], isDepleted: false });
    catMap.get(key)!.items.push(item);
  }

  const groups = [...catMap.values()].sort((a, b) => {
    if (a.id === '__none__') return 1;
    if (b.id === '__none__') return -1;
    return a.name.localeCompare(b.name, 'es');
  });

  if (depleted.length > 0) groups.push({ id: '__depleted__', name: 'Agotados', items: depleted, isDepleted: true });
  return groups;
}

export type ExpiryLevel = 'expired' | 'soon';

export interface ExpiryBadge {
  level: ExpiryLevel;
  label: string;
  /** Complete Tailwind literal, never concatenated. */
  cls: string;
}

export function expiryBadgeOf(item: PantryItem): ExpiryBadge | null {
  let ms: number | null = null;
  if (item.expiresAt) {
    ms = new Date(item.expiresAt).getTime();
  } else if (item.category) {
    ms = new Date(item.createdAt).getTime() + item.category.defaultDays * 86_400_000;
  }
  if (ms === null) return null;
  const days = (ms - Date.now()) / 86_400_000;
  const date = new Date(ms).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  if (days < 0)  return { level: 'expired', label: 'Caducado',      cls: 'bg-lp-danger-soft text-lp-danger' };
  if (days <= 7) return { level: 'soon',    label: `Caduca ${date}`, cls: 'bg-lp-warn/20 text-lp-ink' };
  return null;
}

export function getExpiryMs(item: PantryItem): number | null {
  if (item.expiresAt) return new Date(item.expiresAt).getTime();
  if (item.category) return new Date(item.createdAt).getTime() + item.category.defaultDays * 86_400_000;
  return null;
}

/** Finds a pantry item that a new "add ingredient" entry would merge into, by catalog link or name. */
export function findExistingMatch(items: PantryItem[], name: string, catalogId: string | null): PantryItem | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (catalogId) return items.find(i => i.ingredientId === catalogId) ?? null;
  return items.find(i => i.name.toLowerCase() === trimmed.toLowerCase()) ?? null;
}

export interface PantryItemFormValue {
  name: string;
  quantity: number;
  unit: string;
  categoryId: string;
  expiresAt: string;
}

export type PantryItemSaveIntent =
  | { kind: 'update'; id: string; dto: Partial<CreatePantryItemDto> }
  | { kind: 'create'; dto: CreatePantryItemDto };

/** Builds the create/update request for the pantry-item form, merging into an existing match when possible. */
export function buildSaveIntent(params: {
  editingItemId: string | null;
  existingMatch: PantryItem | null;
  form: PantryItemFormValue;
  catalogId: string | null;
}): PantryItemSaveIntent {
  const { editingItemId, existingMatch, form, catalogId } = params;

  if (editingItemId) {
    return {
      kind: 'update',
      id: editingItemId,
      dto: {
        name: form.name,
        quantity: form.quantity,
        unit: form.unit,
        categoryId: form.categoryId || undefined,
        expiresAt: form.expiresAt || undefined,
      },
    };
  }

  if (existingMatch) {
    return { kind: 'update', id: existingMatch.id, dto: { quantity: existingMatch.quantity + form.quantity } };
  }

  const dto: CreatePantryItemDto = { name: form.name, quantity: form.quantity, unit: form.unit };
  if (form.categoryId) dto.categoryId = form.categoryId;
  if (form.expiresAt) dto.expiresAt = form.expiresAt;
  if (catalogId) dto.ingredientId = catalogId;
  return { kind: 'create', dto };
}
