import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto.js';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto.js';

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.pantryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Pantry item not found');
    if (item.userId !== userId) throw new ForbiddenException();
    return item;
  }

  create(userId: string, dto: CreatePantryItemDto) {
    return this.prisma.pantryItem.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdatePantryItemDto) {
    await this.findOne(id, userId);
    return this.prisma.pantryItem.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.pantryItem.delete({ where: { id } });
  }
}
