import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RemoveMealDto } from './dto/remove-meal.dto.js';
import { UpsertMealDto } from './dto/upsert-meal.dto.js';

const mealInclude = {
  recipe: {
    select: { id: true, name: true, imageUrl: true, prepTime: true, servings: true },
  },
} as const;

function toMondayDate(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeek(userId: string, weekStart: Date) {
    const plan = await this.prisma.weeklyPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
      include: {
        meals: {
          include: mealInclude,
          orderBy: { date: 'asc' },
        },
      },
    });
    return plan ?? { weekStart, meals: [] };
  }

  async upsertMeal(userId: string, dto: UpsertMealDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: dto.recipeId } });
    if (!recipe || recipe.userId !== userId) throw new ForbiddenException('Recipe not found');

    const date = new Date(dto.date + 'T00:00:00Z');
    const weekStart = toMondayDate(dto.date);

    const plan = await this.prisma.weeklyPlan.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      create: { userId, weekStart },
      update: {},
    });

    return this.prisma.meal.upsert({
      where: { userId_date_mealType: { userId, date, mealType: dto.mealType } },
      create: { userId, date, mealType: dto.mealType, recipeId: dto.recipeId, weeklyPlanId: plan.id },
      update: { recipeId: dto.recipeId, weeklyPlanId: plan.id },
      include: mealInclude,
    });
  }

  async removeMeal(userId: string, dto: RemoveMealDto) {
    const date = new Date(dto.date + 'T00:00:00Z');
    await this.prisma.meal.deleteMany({ where: { userId, date, mealType: dto.mealType } });
    return { deleted: true };
  }
}
