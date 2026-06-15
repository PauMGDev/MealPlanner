export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  ingredientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShoppingListItemDto {
  name: string;
  quantity?: number;
  unit?: string;
  ingredientId?: string;
}

export interface UpdateShoppingListItemDto extends Partial<CreateShoppingListItemDto> {
  checked?: boolean;
}

export interface ShoppingListSuggestion {
  ingredientId: string;
  name: string;
  unit: string;
  recipeNames: string[];
}
