import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class IngredientsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ingredients`;

  getAll() {
    return this.http.get<IngredientResult[]>(this.base);
  }

  search(query: string) {
    return this.http.get<IngredientResult[]>(`${this.base}?search=${encodeURIComponent(query)}`);
  }

  create(dto: CreateIngredientDto) {
    return this.http.post<IngredientResult>(this.base, dto);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
