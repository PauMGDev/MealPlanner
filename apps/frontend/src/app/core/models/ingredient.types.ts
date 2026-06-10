export interface IngredientResult {
  id: string;
  name: string;
  unit: string;
  caloriesPer100g: number | null;
  similarity?: number;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
  caloriesPer100g?: number;
  force?: boolean;
}
