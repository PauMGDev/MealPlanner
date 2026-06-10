import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Recipe, RecipeIngredientDetail, CreateRecipeDto } from '../models/recipe.types';

export type { Recipe, RecipeIngredientDetail, CreateRecipeDto } from '../models/recipe.types';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recipes`;

  getAll() {
    return this.http.get<Recipe[]>(this.base);
  }

  getOne(id: string) {
    return this.http.get<Recipe>(`${this.base}/${id}`);
  }

  create(dto: CreateRecipeDto) {
    return this.http.post<Recipe>(this.base, dto);
  }

  update(id: string, dto: Partial<CreateRecipeDto> & { description?: string }) {
    return this.http.patch<Recipe>(`${this.base}/${id}`, dto);
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
