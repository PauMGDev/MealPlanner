import { IsDateString, IsEnum } from 'class-validator';
import { MealType } from '../../generated/prisma/enums.js';

export class RemoveMealDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;
}
