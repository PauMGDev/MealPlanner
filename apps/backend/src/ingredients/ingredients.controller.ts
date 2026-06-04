import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { IngredientsService } from './ingredients.service.js';

@ApiTags('ingredients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredients: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all ingredients or fuzzy-search by name' })
  find(@Query('search') search?: string) {
    if (!search) return this.ingredients.findAll();
    return this.ingredients.search(search);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient (with duplicate guard)' })
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredients.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingredient from the catalog' })
  remove(@Param('id') id: string) {
    return this.ingredients.remove(id);
  }
}
