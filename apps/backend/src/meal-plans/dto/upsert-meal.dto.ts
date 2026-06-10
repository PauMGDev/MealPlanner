import { IsDateString, IsEnum, IsString } from 'class-validator';
import { MealType } from '../../generated/prisma/enums.js';

export class UpsertMealDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsString()
  recipeId: string;
}
