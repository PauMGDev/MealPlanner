import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException('Recipe not found');
    if (recipe.userId !== userId) throw new ForbiddenException();
    return recipe;
  }

  create(userId: string, dto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: { ...dto, steps: dto.steps, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateRecipeDto) {
    await this.findOne(id, userId);
    return this.prisma.recipe.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.recipe.delete({ where: { id } });
  }
}
