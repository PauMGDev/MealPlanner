import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePantryItemDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  @MinLength(1)
  unit: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
