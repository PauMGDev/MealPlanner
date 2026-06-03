import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsPositive()
  prepTime: number;

  @IsInt()
  @IsPositive()
  servings: number;

  @IsArray()
  @IsString({ each: true })
  steps: string[];
}
