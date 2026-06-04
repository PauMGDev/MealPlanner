import { IsDateString, IsNumber, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';

export class CreatePantryItemDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @MinLength(1)
  unit: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  ingredientId?: string;
}
