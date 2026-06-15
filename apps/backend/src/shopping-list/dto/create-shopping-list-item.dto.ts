import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateShoppingListItemDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  ingredientId?: string;
}
