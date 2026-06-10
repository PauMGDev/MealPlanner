export interface RecipeIngredientDetail {
  id: string;
  ingredientId: string;
  quantity: number;
  ingredient: { id: string; name: string; unit: string; caloriesPer100g: number | null; };
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  prepTime: number;
  servings: number;
  steps: string[];
  recipeIngredients: RecipeIngredientDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeDto {
  name: string;
  prepTime: number;
  servings: number;
  steps: string[];
  description?: string;
  imageUrl?: string;
}
