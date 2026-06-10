import { Body, Controller, Delete, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../generated/prisma/client.js';
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
  getWeek(@Query('weekStart') weekStart: string, @Req() req: any) {
    return this.mealPlans.getWeek((req.user as User).id, new Date(weekStart + 'T00:00:00Z'));
  }

  @Put('meals')
  @ApiOperation({ summary: 'Assign or replace a recipe in a meal slot' })
  upsertMeal(@Body() dto: UpsertMealDto, @Req() req: any) {
    return this.mealPlans.upsertMeal((req.user as User).id, dto);
  }

  @Delete('meals')
  @ApiOperation({ summary: 'Remove a recipe from a meal slot' })
  removeMeal(@Body() dto: RemoveMealDto, @Req() req: any) {
    return this.mealPlans.removeMeal((req.user as User).id, dto);
  }
}
