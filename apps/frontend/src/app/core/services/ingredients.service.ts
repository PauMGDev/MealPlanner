import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { IngredientResult, CreateIngredientDto } from '../models/ingredient.types';

export type { IngredientResult, CreateIngredientDto } from '../models/ingredient.types';

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
