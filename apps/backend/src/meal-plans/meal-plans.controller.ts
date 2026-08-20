import { Body, Controller, Delete, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RemoveMealDto } from './dto/remove-meal.dto.js';
import { UpsertMealDto } from './dto/upsert-meal.dto.js';
import { MealPlansService } from './meal-plans.service.js';

@ApiTags('meal-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlans: MealPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get the weekly meal plan for a given week' })
  getWeek(@Query('weekStart') weekStart: string, @CurrentUser() user: User) {
    return this.mealPlans.getWeek(user.id, new Date(weekStart + 'T00:00:00Z'));
  }

  @Put('meals')
  @ApiOperation({ summary: 'Assign or replace a recipe in a meal slot' })
  upsertMeal(@Body() dto: UpsertMealDto, @CurrentUser() user: User) {
    return this.mealPlans.upsertMeal(user.id, dto);
  }

  @Delete('meals')
  @ApiOperation({ summary: 'Remove a recipe from a meal slot' })
  removeMeal(@Body() dto: RemoveMealDto, @CurrentUser() user: User) {
    return this.mealPlans.removeMeal(user.id, dto);
  }
}
