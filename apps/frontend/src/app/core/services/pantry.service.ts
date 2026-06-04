import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class PantryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pantry`;

  getCategories() {
    return this.http.get<IngredientCategory[]>(`${this.base}/categories`);
  }

  getAll() {
    return this.http.get<PantryItem[]>(this.base);
  }

  create(dto: CreatePantryItemDto) {
    return this.http.post<PantryItem>(this.base, dto);
  }

  update(id: string, dto: Partial<CreatePantryItemDto>) {
    return this.http.patch<PantryItem>(`${this.base}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
