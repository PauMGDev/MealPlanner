import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = { category: true } as const;

  findAllCategories() {
    return this.prisma.ingredientCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findAll(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: this.include,
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.pantryItem.findUnique({ where: { id }, include: this.include });
    if (!item) throw new NotFoundException('Pantry item not found');
    if (item.userId !== userId) throw new ForbiddenException();
    return item;
  }

  create(userId: string, dto: CreatePantryItemDto) {
    const { expiresAt, categoryId, ...rest } = dto;
    return this.prisma.pantryItem.create({
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId: categoryId ?? null,
        userId,
      },
      include: this.include,
    });
  }

  async update(id: string, userId: string, dto: UpdatePantryItemDto) {
    await this.findOne(id, userId);
    const { expiresAt, categoryId, ...rest } = dto;
    return this.prisma.pantryItem.update({
      where: { id },
      data: {
        ...rest,
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId ?? null }),
      },
      include: this.include,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.pantryItem.delete({ where: { id } });
  }
}
