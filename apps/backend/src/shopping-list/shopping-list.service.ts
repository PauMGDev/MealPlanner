import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto.js';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto.js';

const include = { ingredient: true } as const;

function currentWeekStart(): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

@Injectable()
export class ShoppingListService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: [{ checked: 'asc' }, { createdAt: 'asc' }],
      include,
    });
  }

  async getSuggestions(userId: string) {
    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: currentWeekStart() } },
      select: {
        recipe: {
          select: {
            name: true,
            recipeIngredients: {
              select: {
                ingredient: { select: { id: true, name: true, unit: true } },
              },
            },
          },
        },
      },
    });

    const needed = new Map<
      string,
      { id: string; name: string; unit: string; recipeNames: Set<string> }
    >();
    for (const meal of meals) {
      for (const ri of meal.recipe.recipeIngredients) {
        const entry = needed.get(ri.ingredient.id) ?? {
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          recipeNames: new Set<string>(),
        };
        entry.recipeNames.add(meal.recipe.name);
        needed.set(ri.ingredient.id, entry);
      }
    }

    if (needed.size === 0) return [];

    const ingredientIds = [...needed.keys()];
    const [pantryItems, listItems] = await Promise.all([
      this.prisma.pantryItem.findMany({
        where: { userId, ingredientId: { in: ingredientIds } },
        select: { ingredientId: true, quantity: true },
      }),
      this.prisma.shoppingListItem.findMany({
        where: { userId, ingredientId: { in: ingredientIds } },
        select: { ingredientId: true },
      }),
    ]);

    const pantryQty = new Map(pantryItems.map((p) => [p.ingredientId, p.quantity]));
    const onListIds = new Set(listItems.map((i) => i.ingredientId));

    return ingredientIds
      .filter((id) => (pantryQty.get(id) ?? 0) <= 0 && !onListIds.has(id))
      .map((id) => {
        const entry = needed.get(id)!;
        return {
          ingredientId: entry.id,
          name: entry.name,
          unit: entry.unit,
          recipeNames: [...entry.recipeNames],
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id },
      include,
    });
    if (!item) throw new NotFoundException('Shopping list item not found');
    if (item.userId !== userId) throw new ForbiddenException();
    return item;
  }

  create(userId: string, dto: CreateShoppingListItemDto) {
    const { ingredientId, ...rest } = dto;
    return this.prisma.shoppingListItem.create({
      data: {
        ...rest,
        ingredientId: ingredientId ?? null,
        userId,
      },
      include,
    });
  }

  async update(id: string, userId: string, dto: UpdateShoppingListItemDto) {
    await this.findOne(id, userId);
    const { ingredientId, ...rest } = dto;
    return this.prisma.shoppingListItem.update({
      where: { id },
      data: {
        ...rest,
        ...(ingredientId !== undefined && {
          ingredientId: ingredientId ?? null,
        }),
      },
      include,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.shoppingListItem.delete({ where: { id } });
  }

  clearChecked(userId: string) {
    return this.prisma.shoppingListItem.deleteMany({
      where: { userId, checked: true },
    });
  }
}
