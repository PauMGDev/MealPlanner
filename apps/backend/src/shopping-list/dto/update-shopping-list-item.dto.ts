import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateShoppingListItemDto } from './create-shopping-list-item.dto.js';

export class UpdateShoppingListItemDto extends PartialType(CreateShoppingListItemDto) {
  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}
