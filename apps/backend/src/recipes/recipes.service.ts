import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddRecipeIngredientDto } from './dto/add-recipe-ingredient.dto.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

const recipeInclude = {
  recipeIngredients: {
    include: { ingredient: true },
    orderBy: { ingredient: { name: 'asc' } },
  },
} as const;

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: recipeInclude,
    });
  }

  async findOne(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: recipeInclude,
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    if (recipe.userId !== userId) throw new ForbiddenException();

    // Cross-reference with user's pantry for availability
    const ingredientIds = recipe.recipeIngredients.map(ri => ri.ingredientId);
    const pantryItems = await this.prisma.pantryItem.findMany({
      where: { userId, ingredientId: { in: ingredientIds } },
      select: { ingredientId: true, quantity: true, unit: true },
    });
    const pantryMap = new Map(pantryItems.map(p => [p.ingredientId, p]));

    return {
      ...recipe,
      recipeIngredients: recipe.recipeIngredients.map(ri => ({
        ...ri,
        pantry: pantryMap.get(ri.ingredientId) ?? null,
      })),
    };
  }

  create(userId: string, dto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: { ...dto, steps: dto.steps, userId },
      include: recipeInclude,
    });
  }

  async update(id: string, userId: string, dto: UpdateRecipeDto) {
    await this.findOne(id, userId);
    return this.prisma.recipe.update({
      where: { id },
      data: { ...dto },
      include: recipeInclude,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.recipe.delete({ where: { id } });
  }

  async addIngredient(id: string, userId: string, dto: AddRecipeIngredientDto) {
    await this.findOne(id, userId);

    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: dto.ingredientId },
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');

    const existing = await this.prisma.recipeIngredient.findUnique({
      where: { recipeId_ingredientId: { recipeId: id, ingredientId: dto.ingredientId } },
    });
    if (existing) throw new ConflictException('Ingredient already in recipe');

    return this.prisma.recipeIngredient.create({
      data: { recipeId: id, ingredientId: dto.ingredientId, quantity: dto.quantity },
      include: { ingredient: true },
    });
  }

  async removeIngredient(id: string, userId: string, ingredientId: string) {
    await this.findOne(id, userId);
    return this.prisma.recipeIngredient.deleteMany({
      where: { recipeId: id, ingredientId },
    });
  }
}
