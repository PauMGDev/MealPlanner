export interface IngredientCategory {
  id: string;
  name: string;
  defaultDays: number;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt: string | null;
  categoryId: string | null;
  category: IngredientCategory | null;
  ingredientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePantryItemDto {
  name: string;
  quantity: number;
  unit: string;
  expiresAt?: string | null;
  categoryId?: string | null;
  ingredientId?: string;
}
