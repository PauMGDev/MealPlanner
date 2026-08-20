import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsEnum } from 'class-validator';
import { MealType } from '../../generated/prisma/enums.js';

export class UpdateSettingsDto {
  /** Meal slots shown as rows of the weekly matrix. */
  @IsEnum(MealType, { each: true })
  @ArrayUnique()
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  activeMealTypes: MealType[];
}
