import { PartialType } from '@nestjs/mapped-types';
import { CreatePantryItemDto } from './create-pantry-item.dto.js';

export class UpdatePantryItemDto extends PartialType(CreatePantryItemDto) {}
