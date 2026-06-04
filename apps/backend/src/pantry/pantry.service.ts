import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';

const include = { category: true, ingredient: true } as const;

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  findAllCategories() {
    return this.prisma.ingredientCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findAll(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include,
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.pantryItem.findUnique({ where: { id }, include });
    if (!item) throw new NotFoundException('Pantry item not found');
    if (item.userId !== userId) throw new ForbiddenException();
    return item;
  }

  create(userId: string, dto: CreatePantryItemDto) {
    const { expiresAt, categoryId, ingredientId, ...rest } = dto;
    return this.prisma.pantryItem.create({
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId: categoryId ?? null,
        ingredientId: ingredientId ?? null,
        userId,
      },
      include,
    });
  }

  async update(id: string, userId: string, dto: UpdatePantryItemDto) {
    await this.findOne(id, userId);
    const { expiresAt, categoryId, ingredientId, ...rest } = dto;
    return this.prisma.pantryItem.update({
      where: { id },
      data: {
        ...rest,
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId ?? null }),
        ...(ingredientId !== undefined && { ingredientId: ingredientId ?? null }),
      },
      include,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.pantryItem.delete({ where: { id } });
  }
}
