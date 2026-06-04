import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recipes`;

  getAll() {
    return this.http.get<Recipe[]>(this.base);
  }

  create(dto: CreateRecipeDto) {
    return this.http.post<Recipe>(this.base, dto);
  }

  remove(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  addIngredient(recipeId: string, dto: { ingredientId: string; quantity: number }) {
    return this.http.post<RecipeIngredientDetail>(`${this.base}/${recipeId}/ingredients`, dto);
  }

  removeIngredient(recipeId: string, ingredientId: string) {
    return this.http.delete(`${this.base}/${recipeId}/ingredients/${ingredientId}`);
  }
}
