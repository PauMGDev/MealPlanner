import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  unit: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  caloriesPer100g?: number;

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
