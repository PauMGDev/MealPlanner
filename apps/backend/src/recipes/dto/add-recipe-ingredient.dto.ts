import { IsNumber, IsPositive, IsString } from 'class-validator';

export class AddRecipeIngredientDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
