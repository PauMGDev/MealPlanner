import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { ShoppingListItem, CreateShoppingListItemDto, UpdateShoppingListItemDto, ShoppingListSuggestion } from '../models/shopping-list.types';

export type { ShoppingListItem, CreateShoppingListItemDto, UpdateShoppingListItemDto, ShoppingListSuggestion } from '../models/shopping-list.types';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shopping-list`;

  getAll() {
    return this.http.get<ShoppingListItem[]>(this.base);
  }

  getSuggestions() {
    return this.http.get<ShoppingListSuggestion[]>(`${this.base}/suggestions`);
  }

  create(dto: CreateShoppingListItemDto) {
    return this.http.post<ShoppingListItem>(this.base, dto);
  }

  update(id: string, dto: UpdateShoppingListItemDto) {
    return this.http.patch<ShoppingListItem>(`${this.base}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  clearChecked() {
    return this.http.delete(`${this.base}/checked`);
  }
}
